# 🗄️ Architektur-Check: Ist ZauberAcker datenbank-tauglich?

**Kurzfazit: Ja — mit kleinen, klar umrissenen Ergänzungen.** Der Spielstand ist
bereits ein einzelnes, serialisierbares JSON-Objekt mit Versionsfeld, die
Persistenz ist in einer Datei gekapselt, und Anmeldung + Speicherung laufen
jetzt **pro Nutzer**. Für eine echte Online-Datenbank fehlen im Wesentlichen drei
Dinge: **serverseitige Authentifizierung**, **asynchrones (offline-fähiges)
Speichern** und ein **Storage-Adapter**.

---

## ✅ Was schon gut passt

- **Spielstand = ein JSON-Blob** (`state` in `core/spielzustand.js`) mit `version`.
  Lässt sich 1:1 in eine DB-Zeile / JSON-Spalte legen (Postgres `jsonb`,
  Supabase, Firestore-Dokument). Keine Normalisierung nötig.
- **Idle-Wachstum über Zeitstempel** (`letzterZeitstempel`, Gewächshaus-`gepflanztBei`):
  geräteunabhängig, kein Server-Timer nötig.
- **Persistenz ist isoliert**: nur `speichere` / `ladeSpielstand` / `loescheSpielstand`
  greifen auf den Speicher zu — ein einziger Tauschpunkt.
- **NEU – Pro-Nutzer-Spielstände**: Speicher-Schlüssel = `Basis + nutzerId`
  (`setzeAktivenNutzer`), und `state.nutzerId` steht im Blob. Das ist exakt die
  Grundlage für „ein Spielstand pro Nutzer" in der DB.
- **NEU – Austauschbare Auth** (`core/auth.js`): Adapter-Muster — ein echtes
  Backend hängt man über `auth.setzeAdapter(...)` ein, ohne UI/Logik zu ändern.

---

## ⚠️ Was für die Datenbank noch zu tun ist

1. **Serverseitige Authentifizierung.** Der aktuelle Login ist ein **lokaler
   Platzhalter** (SHA-256-Hash im `localStorage`) und **nicht sicher**. Echte Auth
   gehört auf einen Server: Passwort-Hashing mit **bcrypt/argon2**, **HTTPS**,
   **Session/JWT**, Rate-Limiting. → nur `core/auth.js`-Adapter ersetzen.
2. **Asynchrones Speichern.** `speichere()`/`ladeSpielstand()` sind heute
   **synchron** (localStorage). Eine Remote-DB ist **async**. Empfehlung: einen
   `core/persistenz.js`-Adapter einziehen mit `lade(key)` / `speichere(key, daten)`
   → `Promise`. **Offline-first**: localStorage als Cache, im Hintergrund syncen.
3. **Speicherfrequenz drosseln.** Aktuell wird alle 10 s **und** bei jeder Aktion
   gespeichert. Für eine DB lieber **entprellen** (debounce, z. B. alle 20–30 s
   oder bei wichtigen Ereignissen) → weniger Schreiblast/Kosten.
4. **Konfliktauflösung (Mehrgeräte).** Bei Bedarf den neueren
   `letzterZeitstempel` gewinnen lassen (Last-Write-Wins) — das Feld existiert
   bereits.
5. **Versionierung/Migration.** `state.version` beim Laden prüfen und alte Stände
   migrieren (heute werden fehlende Felder schon mit den Defaults aufgefüllt).

---

## 🧭 Konkreter Migrationsplan

| Schritt | Inhalt | Status |
| --- | --- | --- |
| 1 | Auth-Schnittstelle + pro-Nutzer-Spielstände | **erledigt** |
| 2 | `core/persistenz.js`-Storage-Adapter (erst localStorage) einziehen, `spielzustand.js` darüber leiten | offen |
| 3 | `speichere()` asynchron + entprellt machen | offen |
| 4 | Backend wählen (z. B. **Supabase**: Auth + Postgres `jsonb`) und beide Adapter umstellen | offen |
| 5 | Offline-Sync (Cache ↔ DB) + Konfliktauflösung per Zeitstempel | offen |

---

## 📐 Empfohlenes Minimal-Schema

```sql
nutzer(      id PK, username, email UNIQUE, passwort_hash, erstellt_am )
spielstand(  nutzer_id PK/FK, daten JSONB, version INT, aktualisiert_am )
```

Die Spalte `daten` (JSONB) ist **exakt das heutige `state`-Objekt** — es muss
nichts umgebaut werden. Damit ist der Sprung zur Datenbank ein gut abgegrenztes,
kleines Vorhaben, kein Architektur-Umbau.
