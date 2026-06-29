# 🚀 ZauberAcker hosten + Online-Datenbank (Supabase)

Diese Anleitung bringt das Spiel **öffentlich ins Netz** und gibt jedem Spieler
ein **echtes Online-Konto**, dessen Hof in einer **Datenbank** gespeichert wird
(geräteübergreifend). Der Code ist schon fertig vorbereitet — du musst nur die
Konten anlegen und zwei Schlüssel eintragen.

> **Sicherheitsnetz:** Solange du in `src/core/cloud-config.js` nichts einträgst,
> bleibt alles wie bisher (lokaler Login + Speicherung im Browser). Du kannst die
> Schritte also gefahrlos nacheinander gehen.

---

## Teil 1 — Datenbank & Konten: Supabase einrichten (~10 Min)

1. **Konto + Projekt anlegen** auf <https://supabase.com> (kostenlos, „New project").
   Region am besten **Europe (Frankfurt)**. Das „Database Password" notieren
   (brauchst du fürs Spiel NICHT, aber für die DB-Verwaltung).
2. **Tabelle anlegen:** im Projekt links **SQL Editor → New query**, den Inhalt
   von [`supabase-schema.sql`](supabase-schema.sql) einfügen und **Run** klicken.
   Das legt die Tabelle `spielstand` an und schaltet die Sicherheitsregeln (RLS) ein.
3. **E-Mail-Bestätigung ausschalten** (sonst muss jeder erst eine Mail bestätigen):
   **Authentication → Sign In / Providers → Email** → Schalter **„Confirm email"
   ausschalten** → speichern. (Für ein Schulprojekt bequemer; später wieder
   einschaltbar.)
4. **Die zwei Schlüssel holen:** **Project Settings → API**:
   - **Project URL** (z. B. `https://abcd1234.supabase.co`)
   - **anon public** key (langer Text). ⚠️ NICHT den `service_role`-Key nehmen!
5. **In den Code eintragen:** [`src/core/cloud-config.js`](src/core/cloud-config.js)
   öffnen und die zwei Werte ersetzen:
   ```js
   export const SUPABASE_URL = 'https://abcd1234.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';   // der anon-Key
   ```
6. **Lokal testen:** `python devserver.py 8000`, im Browser `http://localhost:8000`.
   Unten im Anmeldefenster sollte jetzt stehen: „Dein Hof wird sicher online
   gespeichert". Registriere ein Konto → spiele kurz → lade die Seite neu →
   melde dich auf einem anderen Gerät/Browser an: derselbe Stand ist da. ✅
   In Supabase siehst du die Daten unter **Table Editor → spielstand**.

> Der `anon`-Key darf öffentlich im Browser stehen — er ist dafür gemacht.
> Geschützt werden die Spielstände durch die **RLS-Regeln** (jeder sieht nur
> seinen eigenen), nicht durch Geheimhaltung des Keys.

---

## Teil 2 — Das Spiel öffentlich hosten (~5 Min)

Da ZauberAcker eine **statische Seite** ist (kein Server, kein Build), reicht ein
statischer Host. Alle hier sind kostenlos und liefern automatisch **HTTPS**.

### Variante A — Netlify per Drag & Drop (am schnellsten)

1. Konto auf <https://app.netlify.com> anlegen.
2. **„Add new site" → „Deploy manually"**, den **gesamten Projektordner** ins
   Feld ziehen (mit `index.html` in der Wurzel).
3. Fertig — du bekommst eine URL wie `https://zauberacker-xyz.netlify.app`.
   Die kannst du in den Site-Einstellungen umbenennen.

### Variante B — Netlify + GitHub (empfohlen für Updates)

1. Projekt in ein **GitHub-Repository** legen (z. B. mit GitHub Desktop).
2. In Netlify **„Add new site → Import from Git"**, Repo auswählen.
   - Build command: **leer lassen**
   - Publish directory: **`.`** (Projektwurzel)
3. Ab jetzt: jeder `git push` veröffentlicht automatisch die neue Version.

> **Alternativen** (gleiches Prinzip): **Cloudflare Pages**, **GitHub Pages**,
> **Vercel**. Für GitHub Pages das Repo „Pages" auf den Branch zeigen lassen.

### Wichtig: erlaubte Domain in Supabase eintragen

Damit der Login von deiner echten URL aus funktioniert:
**Supabase → Authentication → URL Configuration** → deine Netlify-URL unter
**„Site URL"** und **„Redirect URLs"** eintragen.

---

## ✅ Danach

- Spiel läuft öffentlich unter deiner Hosting-URL.
- Spieler registrieren sich mit E-Mail + Passwort; der Hof wird in Supabase
  gespeichert und ist auf jedem Gerät verfügbar.
- „Ohne Konto (Gast)" funktioniert weiter rein lokal.

## 💸 Kosten

Beide Dienste haben großzügige **kostenlose** Stufen, die für ein Schul-/
Hobbyprojekt locker reichen. Es entstehen keine Kosten, solange du im Free-Tier
bleibst (kein Zahlungsmittel nötig).

## 🛟 Wenn etwas klemmt

- **„Cloud bleibt aus" / alter Hinweistext:** Schlüssel in `cloud-config.js`
  prüfen (URL endet auf `.supabase.co`, anon-Key vollständig kopiert).
- **Login schlägt fehl mit „E-Mail bestätigen":** Schritt 1.3 (Confirm email aus).
- **Nichts wird gespeichert:** in Supabase prüfen, ob das SQL (Schritt 1.2) lief
  und RLS-Policies existieren (Table Editor → spielstand → „...").
- **Browser-Konsole (F12)** zeigt konkrete Fehlermeldungen aus `cloud.js`.
