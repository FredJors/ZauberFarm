# 🌾 ZauberAcker

Ein browserbasiertes 3D-Lernspiel im **Low-Poly-Look** (Three.js). Du bist ein
magischer Bauer im Ursprung eines Koordinatengitters und erntest Pflanzen, indem
du **mathematische Funktionen als Zaubersprüche** über den Acker wirkst. Gelöste
Mathe-Aufgaben schalten neue Funktionen frei, der Markterlös wertet sie auf, und
seltene **Spezialpflanzen** ziehst du im **Gewächshaus** in Echtzeit groß.

Mathematik ist das Referenzfach. Insgesamt sind **siebzehn Fächer** voll ausgebaut,
jedes mit eigenen Aufgabenbanken (Abitur-Niveau) und je einer charakteristischen
Zauberform:

- **Mathe** — Funktionsgraphen (Kurven-Ernte).
- **Physik** — **Wurfparabel** (Kurve), **Schockwelle** (Splash), **Lichtkegel**
  (Kegel/Sektor) und **Materiewelle** (Welle).
- **Chemie** — **Splash-Zauber** werfen reaktive Kugeln und ernten **Kreisflächen**.
- **Biologie** — **Frosch-Zauber**: ein (per Upgrade: mehrere) Frosch macht
  zufällige Sprünge über den Acker und erntet die Landefelder, dann verpuffen sie.
- **Informatik** — **Pfad-Zauber**: Algorithmen zeichnen Pfade übers Gitter
  (wachsende **Spirale**, verschachtelte Schleifen als **Raster**, **Rekursionsbaum**).
- **Geschichte** — **Zeitstrahl** (gerade Pfadlinie), **Ausgrabung** (Splash) und
  **Epochen-Welle** (Kurve).
- **Erdkunde** — **Klimakurve**, **Monsunregen** (Regen), **Vulkanausbruch** (Splash)
  und **Erdrutsch** (Kegel).
- **Musik** — **Notentanz** (tanzende Noten, Frosch-Mechanik), **Notenregen**
  (Regen), **Melodiewelle** (Kurve) und **Akkordschlag** (Splash).
- **Kunst** — **Pinselstrich** (Kurve), **Farbklecks** (Splash), **Farbregen**
  (Regen) und **Lissajous-Muster** (parametrischer Pfad).
- **Politik-Wirtschaft** — **Marktgleichgewicht** (Kreuz: Angebot/Nachfrage),
  **Subventionsregen** (Regen), **Konjunkturwelle** (Kurve), Nachfragekurve.
- **Religion** — **Glockenklang** (Ringe: konzentrische Wellen), **Mannaregen**
  (Regen), **Himmelslicht** (Kegel), Kerzenschein (Splash).
- **Werte und Normen** — **Dilemma-Waage** (Waage: zwei Schalen), **Meinungsregen**
  (Regen), **Diskurswelle** (Kurve), Schlusskette (Treppen-Pfad).
- **Deutsch, Englisch, Französisch, Latein & Spanisch** — **Buchstaben-Zauber**:
  Buchstaben hüpfen in Bögen über den Acker und ernten die Landefelder
  (Wortlänge/Sprungweite aufwertbar). Die drei zuletzt genannten Sprachfächer
  teilen sich `faecher/sprachfabrik.js`.

Zwei Zauberformen sind **fach-übergreifend** und werden mehrfach genutzt: der
**Regen** (Tropfen/Noten/Geld/Manna auf zufällige Felder im Umkreis — Anzahl und
Radius aufwertbar) und der **Kegel** (Lichtkegel in Physik, Erdrutsch in Erdkunde,
Himmelslicht in Religion). Hinzu kommen drei weitere Formen für die Gesellschafts-
fächer: **Kreuz** (sich kreuzende Geraden), **Ringe** (konzentrische Wellen) und
**Waage** (zwei abwägende Schalen).

**Startzauber-Balance:** der erste, kostenlose Zauber jedes Fachs ist bewusst
schwach und reicht **höchstens ~3 Felder** um den Bauern; erst Upgrades und
spätere Zauber machen ihn mächtig.

Die Architektur ist **modular und datengetrieben**, sodass weitere Fächer ohne
Eingriff in den Kern ergänzt werden können — alle übrigen Oberstufenfächer sind
als Stubs registriert.

### Progression (leichter Einstieg, linear steigend)

Die Schwierigkeit liegt zentral in `core/progression.js` und gilt für **alle**
Fächer: Der Start ist sehr leicht (triviale Aufgaben → schnelle Erfolge), danach
steigt das Thema-**Niveau (1–10) linear** mit jeder richtigen Antwort. Schwerere
Aufgaben geben **linear mehr** Wissen/XP. Eine **Serie/Streak** fehlerfreier
Antworten erhöht die Belohnung (bis +100 %). Stärkere Zauber sind an ein
Mindest-Niveau gebunden und werden **teurer, aber wirkungsvoller** (Tier-System).

---

## ▶️ Starten

Das Spiel braucht **keinen Build-Schritt**, aber wegen ES-Modulen einen kleinen
statischen Server (nicht per Doppelklick / `file://` öffnen). Im Projektordner:

```bash
# Variante A: mitgelieferter Dev-Server OHNE Caching (empfohlen beim Entwickeln,
#             zeigt Code-Änderungen sofort)
python devserver.py 8000

# Variante B: Python-Standardserver
python -m http.server 8000

# Variante C: Node
npx serve .
```

Dann im Browser `http://localhost:8000` öffnen. Beim ersten Start erscheint ein
**Anmelde-/Registrier-Fenster** (Benutzername, E-Mail, Passwort). Aktuell ist das
ein **lokaler Demo-Login** — echte Online-Konten + Datenbank lassen sich ohne
Code-Änderung scharfschalten (Supabase). Wie das geht und wie man das Spiel
öffentlich hostet, steht Schritt für Schritt in **[HOSTING.md](HOSTING.md)**; die
Architektur-Bewertung dazu in **[DATENBANK.md](DATENBANK.md)**. Abmelden geht im
Upgrade-Menü unter „👤 Konto".

> Three.js und math.js werden per CDN (Import-Map) geladen — beim ersten Start
> ist also eine Internetverbindung nötig. Für den Offline-Betrieb kann man die
> Bibliotheken lokal ablegen und die URLs in `index.html` anpassen.

---

## 🎮 Steuerung

| Aktion | Bedienung |
| --- | --- |
| Kamera drehen / zoomen | Ziehen mit der Maus / Mausrad (OrbitControls) |
| Zielwinkel θ einstellen | Maus über den Acker bewegen **oder** θ-Schieberegler |
| Zaubern (ernten) | Kurzer Klick auf den Acker, **Leertaste** oder Knopf „✨ Zaubern" |
| **Fach wechseln** | **linke Fächer-Spalte** (Emoji + Name) — auch im Aufgaben-Panel |
| **Zauber wechseln** | **Chip-Leiste** unten in der Steuerung (ein Klick, kein Untermenü) |
| Aufgaben, Markt, Upgrades … | Werkzeugleiste unten |

Die hellblaue Vorschau zeigt live, welche Felder der aktive Zauber trifft. Das
**Fach** wählt man über die **linke Spalte** (jedes Fach mit Emoji + Name), den
**aktiven Zauber** über die Chip-Leiste unten. Das **Aufgaben-Panel** erlaubt
ebenfalls den Fachwechsel und zeigt eine **Gesamtübersicht** des Lernfortschritts
über alle Fächer (Ø-Niveau je Fach).

---

## 🔁 Spielablauf (Loop)

1. **Aufgabe lösen** → 📘 Wissen → im **Zauberbuch** neue Funktion freischalten.
   Das Aufgaben-Panel zeigt ein **Wissensstand-Dashboard** (Wissen, Level, Serie,
   Lösungsquote, Niveau je Thema). Es gibt viele Aufgaben pro Thema; ähnliche
   wiederholen sich, exakt gleiche aber nicht (rollender Verlauf der letzten Fragen).
   Zaubersprüche kosten bewusst viel Wissen — man muss also einige Aufgaben lösen.
2. **Zaubern**: Funktion wählen, drehen (θ), wirken → erntereife Felder werden geerntet.
3. **Markt**: Geerntetes verkaufen → 💰 Geld.
4. **Upgrades**: Zauber aufwerten (Reichweite/Fläche/Parameter) **oder den Acker
   um eine ganze Umrandung vergrößern** (fach-übergreifend).
5. **Karten** (fach-unabhängig): mit 💰 Geld neue Biome freischalten — spätere
   Karten kosten mehr, ihre Pflanzen bringen aber deutlich mehr Geld.
6. Alle **100 Ernten** → 🌟 Spezialpflanze → im **Gewächshaus** einpflanzen,
   in Echtzeit (auch offline) wachsen lassen, durch gelöste Aufgaben beschleunigen, ernten.
7. Geerntete Gewächshaus-Pflanzen geben **🔮 Essenz** → im **Skill-Baum** dauerhafte
   Verbesserungen freischalten (z. B. doppelte Ernte-Zählung, +Verkaufserlös,
   +Wissen, schnelleres Wachstum). Eine dritte Währung als Meta-Progression.

Jede geerntete Pflanzenart landet im **📖 Codex** (zusätzlich zu den Spezialpflanzen).
Das Fach wird **direkt** über die Chip-Leiste gewechselt — Karten, Markt, Gewächshaus
und Codex gelten fach-übergreifend.

---

## 🧩 Architektur

```
index.html              Einstieg, Import-Map (Three.js/math.js), UI-Styles
src/
  main.js               Bootstrap, Spielschleife, Maus-Zielen, "spiel"-Controller
  data/                 NUR Daten (datengetrieben, leicht erweiterbar)
    look.js             Optik-Parameter (Farben, Nebel, Licht, Kachelgröße)
    pflanzen.js         Standard-Pflanzen
    biome.js            Karten / Biome (FACH-UNABHÄNGIG, je eigene Pflanzen, Geld-Freischaltung)
    spezialpflanzen.js  Spezialpflanzen-Codex
    skills.js           Skill-Baum + Effekt-Berechnung (Währung 🔮 Essenz)
    erfolge.js          Erfolge/Achievements (Bedingungen + optionale Boni)
  core/                 Fachunabhängiger Kern (ohne Three.js / DOM)
    ernte.js            Erntemechanik aller Formen: Kurve, Splash, Frosch, Buchstaben,
                        Pfad, Kegel, Regen, Kreuz, Ringe & Waage; berechneErnteForm()
                        vereinheitlicht alle deterministischen Formen
    progression.js      Zentrale Schwierigkeits-/Belohnungskurve + Streak (alle Fächer)
    spielfeld.js        Gitter, Feldzustände, Wachstum, Nachsäen, Acker-Wachstum (wachse)
    gewaechshaus.js     Idle-Wachstum der Spezialpflanzen (Zeitstempel)
    spielzustand.js     Spielstand + Wirtschaft + localStorage (PRO NUTZER gespeichert)
    auth.js             Anmeldung/Registrierung über austauschbaren Adapter (DB-bereit)
    fachregister.js     Registrierung + Doku der FachModul-Schnittstelle
    erfolge.js          Erfolgs-Prüfung (pruefeErfolge) — schaltet erfüllte Erfolge frei
  faecher/
    mathe.js            VOLLES Referenzfach (Kurven-Zauber, Aufgaben, adaptive Schwierigkeit)
    physik.js           VOLLES Fach (Wurfparabel, Schockwelle, Lichtkegel, Materiewelle)
    chemie.js           VOLLES Fach mit Splash-/Flächen-Zaubern (Atombau, Stöchiometrie, pH)
    biologie.js         VOLLES Fach mit Frosch-Zaubern (Zellbiologie, Genetik, Ökologie)
    informatik.js       VOLLES Fach mit Pfad-Zaubern (Algorithmen, Daten, Theorie)
    geschichte.js       VOLLES Fach (Zeitstrahl, Ausgrabung, Epochenwelle)
    erdkunde.js         VOLLES Fach (Klimakurve, Monsunregen, Vulkan, Erdrutsch-Kegel)
    musik.js            VOLLES Fach (Notentanz, Notenregen, Melodiewelle, Akkordschlag)
    kunst.js            VOLLES Fach (Pinselstrich, Farbklecks, Farbregen, Lissajous)
    deutsch.js          VOLLES Fach mit Buchstaben-Zaubern (Grammatik, Stilmittel, Literatur)
    englisch.js         VOLLES Fach mit Buchstaben-Zaubern (Grammar, Vocabulary, Literature)
    sprachfabrik.js     Bauplan für Sprachfächer (erzeugeSprachModul) — Buchstaben-Mechanik
    franzoesisch.js     VOLLES Sprachfach (Vocabulaire, Grammaire, Civilisation)
    latein.js           VOLLES Sprachfach (Vokabular, Formenlehre, antike Kultur)
    spanisch.js         VOLLES Sprachfach (Vocabulario, Gramática, Cultura)
    politik_wirtschaft.js VOLLES Fach (Marktgleichgewicht-Kreuz, Subventionsregen …)
    religion.js         VOLLES Fach (Glockenklang-Ringe, Mannaregen, Himmelslicht-Kegel)
    werte_normen.js     VOLLES Fach (Dilemma-Waage, Meinungsregen, Schlusskette)
    zauberformen.js     Helfer für die Zufalls-Formen 'noten' & 'regen' (stabile Vorschau)
    stubs.js            Alle übrigen Oberstufenfächer als Stubs (registriert,
                        "noch nicht implementiert", je mit Konzeptnotiz)
devserver.py            Statischer Dev-Server OHNE Caching (zeigt Änderungen sofort)
  render/
    szene.js            Renderer, Kamera, Licht, Nebel, OrbitControls
    welt.js             Gitter, Bauer, Pflanzen, Kurvenband, Bursts, Deko
  ui/
    ui.js               HUD + alle Panels (spricht nur mit dem "spiel"-Controller)
    startbildschirm.js  Anmelde-/Registrier-Fenster beim Start (Login-Gate)
```

**Trennung:** `data/` enthält reine Daten, `core/` ist frei von Three.js/DOM und
testbar, `render/` und `ui/` kennen den Spielstand nur über klare Schnittstellen.

### Die FachModul-Schnittstelle

Der Kern kennt nur diese generische Schnittstelle (siehe `core/fachregister.js`):

```js
FachModul {
  id, name, icon, farbe, implementiert
  themen(): Thema[]
  erzeugeAufgabe(themaId, niveau): Aufgabe
  prüfeAntwort(aufgabe, antwort): { korrekt, feedback, erhalteneXP }
  niveauFuer(state, themaId): number          // gerundetes Thema-Niveau (1–10)
  listeZauber(themaId): Zauber[]
  alleZauber(): Zauber[]
  zauberAn(id): Zauber | null
  paramsFuer(zauber, stufen): params           // Upgrade-Stufen → Wirk-Parameter
  upgradeKosten(zauber, schluessel, stufe): number
  berechneVorschau(zauber, params): { ziele, visual }   // Live-Vorschau, ohne Ernte
  wirkeZauber(zauber, params, spielfeld): { geerntet, ziele, visual }
  startNiveau, niveauAnpassen(state, themaId, korrekt): void
}
```

`visual` beschreibt die Darstellung fach-agnostisch: `{ typ:'kurve', … }` für
Funktionsgraphen, `{ typ:'splash', cx, cy, radius, … }` für Kreisflächen,
`{ typ:'froesche', pfade, … }` für Frosch-Sprünge, `{ typ:'buchstaben', pfad,
buchstaben, … }` für springende Buchstaben, `{ typ:'pfad', pfade, … }` für
Algorithmus-/Zeitstrahl-Pfade, `{ typ:'kegel', theta, reichweite, oeffnung }` für
einen Kegel/Sektor, `{ typ:'noten', pfade, symbol }` für tanzende Noten,
`{ typ:'regen', zellen, radius, symbol }` für Regen, `{ typ:'kreuz', … }`,
`{ typ:'ringe', … }` und `{ typ:'waage', … }` — `render/welt.js: zeigeVisual()`
rendert alle Formen. Jeder Zauber trägt `form: 'kurve' | 'splash' | 'froesche' |
'buchstaben' | 'pfad' | 'kegel' | 'noten' | 'regen' | 'kreuz' | 'ringe' | 'waage'`,
ein `tier` (Kosten/Stärke) und `freischalt: { wissen, niveau }`. Pfad-Zauber liefern
den Pfad über `pfad(params)`, Kegel-Zauber über `reichweite`/`oeffnung`. Die
**zufälligen** Formen `noten` (Frosch-Mechanik) und `regen` laufen über
`faecher/zauberformen.js` (stabile Vorschau, frischer Zufall beim Wirken).

---

## ➕ Erweitern

### a) Neues Fach hinzufügen

1. Eine Datei `src/faecher/meinfach.js` anlegen und ein Objekt exportieren, das
   die **FachModul-Schnittstelle** erfüllt (am einfachsten `src/faecher/mathe.js`
   als Vorlage nehmen; `wirkeZauber` darf die gemeinsame `core/ernte.js` nutzen).
2. In `src/main.js` registrieren:
   ```js
   import { meinFachModul } from './faecher/meinfach.js';
   registriereFach(meinFachModul);
   ```
3. Fertig — implementierte Fächer erscheinen automatisch als **Chip** in der
   Steuerung (direktes Umschalten). Der Kern bleibt unverändert. (Die Stubs in
   `stubs.js` zeigen die Minimalform.)

### b) Neue Funktion (Zauber) hinzufügen

In `src/faecher/mathe.js` im Objekt `ZAUBER` einen Eintrag ergänzen:

```js
wurzel: {
  id: 'wurzel', name: 'Wurzelzauber', themaId: 'analysis', icon: '√',
  beschreibung: 'f(x) = a·√x',
  istIntegral: false, form: 'kurve', tier: 2, freischalt: { wissen: 40, niveau: 2 },
  basis: { a: 2, b: 1, c: 0, bereichMin: 0, bereichMax: 6 },
  upgrades: [STD_UPGRADES.bereichRechts, STD_UPGRADES.amplitude],
  f: (p) => (x) => (x >= 0 ? p.a * Math.sqrt(x) : NaN),
},
```

`f(params)` liefert den Funktions-Evaluator; `upgrades` bestimmt, welche
Parameter mit Geld aufgewertet werden. `tier` skaliert Upgrade-Kosten,
`freischalt.niveau` verlangt ein Mindest-Thema-Niveau. Mehr ist nicht nötig —
Erntemechanik, Kurvendarstellung und UI funktionieren automatisch.

**Splash-/Flächen-Zauber** (wie in `chemie.js`): einfach `form: 'splash'` setzen
und in `basis` `reichweite` (Distanz des Mittelpunkts) + `radius` (Splash-Größe)
angeben; als `upgrades` werten `reichweite`/`radius` die Fläche auf. `f` entfällt —
`berechneErnteForm()` erntet die Kreisfläche und `zeigeVisual()` zeichnet sie.

### c) Neue Spezialpflanze hinzufügen

In `src/data/spezialpflanzen.js` im Objekt `SPEZIALPFLANZEN` ergänzen:

```js
regenbogenkaktus: {
  id: 'regenbogenkaktus', name: 'Regenbogenkaktus', emoji: '🌵', farbe: 0x88e0c0,
  wachstumMs: 1000 * 60 * 100, seltenheit: 4,
  belohnung: { geld: 480, wissen: 95 },
  text: 'Blüht in allen Farben des Zahlenstrahls.',
},
```

Sie taucht sofort im Codex auf und kann an Meilensteinen droppen.

---

## ✅ Akzeptanzkriterien → wo umgesetzt

- **Aufgabe lösen → Wissen → Funktion freischalten:** `ui.js` (Aufgaben/Zauberbuch), `mathe.js`, `main.js: zauberFreischalten`.
- **Funktion wählen, drehen, wirken, punktweise Ernte + sichtbare Kurve:** `core/ernte.js`, `mathe.js: wirkeZauber`, `render/welt.js: zeigeKurve`.
- **Markt & Upgrades (Definitionsbereich + Parameter):** `spielzustand.js`, `main.js: verkaufen/upgradeKaufen`.
- **Integral = Flächenernte:** Zauber `integral` (`istIntegral: true`) + `berechneZielFelder`.
- **Splash-/Flächen-Zauber (Chemie):** `chemie.js` (`form:'splash'`) + `core/ernte.js: berechneSplashFelder/berechneErnteForm` + `render/welt.js: zeigeSplash`.
- **Frosch-Zauber (Biologie):** `biologie.js` (`form:'froesche'`) + `core/ernte.js: berechneFroschFelder` + `render/welt.js: zeigeFroesche`.
- **Acker vergrößern (fach-übergreifend):** `core/spielfeld.js: wachse`, `render/welt.js: setzeRadius`, `main.js: ackerVergroessern` (UI im Upgrade-Menü).
- **Reset-Knopf (Entwicklung/Test):** `main.js: resetSpielstand` (UI im Upgrade-Menü).
- **Progression (leichter Start, linear, Streak, teurere/bessere Zauber):** `core/progression.js`, `main.js: antwortAbgeben`.
- **Spezialpflanzen alle 100 Ernten, Gewächshaus-Echtzeitwachstum (offline), Boost durch Aufgaben:** `core/gewaechshaus.js`, `main.js: pruefeMeilensteine/antwortAbgeben`.
- **Adaptive Schwierigkeit:** `core/progression.js` + `mathe.js/chemie.js: niveauAnpassen/niveauFuer`.
- **Persistenz über Neuladen (inkl. Gewächshaus-Zeit):** `spielzustand.js` (localStorage + Zeitstempel).
- **Zweites Fach allein durch neue FachModul-Implementierung:** belegt durch `chemie.js` (voll) sowie `stubs.js` + `fachregister.js`.

---

## 🛠️ Technik

- **Three.js** (WebGL), Flat-Shaded Low-Poly, `THREE.Fog`, InstancedMesh fürs Gitter & die Pflanzen.
- **Vanilla JS (ES-Module)**, kein Build-Tool nötig.
- **localStorage** für Auto-Save (alle 10 s sowie beim Schließen) und Idle-Wachstum.
- **math.js** (optional) zur robusten Auswertung von Antwort-Termen/Brüchen.
