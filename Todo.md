# 📝 ZauberAcker — TODO & Ideen

Kurze, lebende Liste. Nichts davon ist fest beschlossen — als Auswahl/Notizen
für die nächsten Sitzungen gedacht. (Stand der fertigen Features: siehe README.md.)

## Als Nächstes (naheliegend)
- [x] Weitere Stub-Fächer voll ausbauen — die Spell-Formen sind wiederverwendbar:
  - [x] **Physik** — Wurfparabel (Kurve), Schockwelle (Splash), **Lichtkegel**
        (neue Kegel-/Sektor-Form), Materiewelle.
  - [x] **Informatik** — Algorithmen/Schleifen zeichnen Pfade übers Gitter (neue
        **Pfad-Form**: Spirale, Raster, Rekursionsbaum).
  - [x] **Geschichte** — Zeitstrahl (Pfad), Ausgrabung (Splash), Epochen-Welle (Kurve).
  - [x] **Französisch / Latein / Spanisch** — Buchstaben-Zauber wiederverwendet;
        gemeinsamer Bauplan `faecher/sprachfabrik.js`.
  - [x] **Erdkunde** — Klimakurve (Kurve), Monsunregen (Regen), Vulkanausbruch
        (Splash), **Erdrutsch** (Kegel, wiederverwendet).
  - [x] **Musik** — **Notentanz** (tanzende Noten, Frosch-Mechanik), Notenregen
        (Regen), Melodiewelle (Kurve), Akkordschlag (Splash).
  - [x] **Kunst** — Pinselstrich (Kurve), Farbklecks (Splash), Farbregen (Regen),
        Lissajous-Muster (Pfad).
  - [x] **Politik-Wirtschaft** — **Marktgleichgewicht** (neue **Kreuz**-Form),
        Subventionsregen, Konjunkturwelle, Nachfragekurve.
  - [x] **Religion** — **Glockenklang** (neue **Ringe**-Form), Mannaregen,
        Himmelslicht (Kegel), Kerzenschein.
  - [x] **Werte und Normen** — **Dilemma-Waage** (neue **Waage**-Form),
        Meinungsregen, Diskurswelle, Schlusskette (Treppen-Pfad).
  - ⇒ Insgesamt sieben wiederverwendbare Zauberformen ergänzt: `pfad`, `kegel`,
     `noten`, `regen`, `kreuz`, `ringe`, `waage`. Mehrere werden fachübergreifend
     genutzt. Zufalls-Formen (`noten`/`regen`) in `faecher/zauberformen.js`.
  - [x] **Startzauber-Balance:** jeder Gratis-Starter reicht jetzt ≤ ~3 Felder
        (auch Chemie/Biologie angeglichen) — erst Upgrades machen ihn stark.
  - Verbleibende Stubs: Darstellendes Spiel, Pädagogik, Psychologie, Sport.
- [ ] Mehr Aufgaben in den bestehenden Fächern ergänzen (laufend, hält die Varianz hoch).

## Datenbank / Backend (UMGESETZT — Supabase live, siehe HOSTING.md/DATENBANK.md)
- [x] Persistenz-Adapter + Auth-Adapter (`core/cloud.js`, `auth.setzeAdapter`).
- [x] Speichern **asynchron + entprellt** (4 s) + Dirty-Check (nur bei Änderung).
- [x] Backend = **Supabase** (Auth + Postgres `jsonb`), Hosting via Netlify/GitHub.
- [x] Offline-Sync + Konfliktauflösung per `letzterZeitstempel` (Last-Write-Wins).
- [x] Cloud-Spielstand + **Bestenliste** (eigene Tabelle, RLS, Index, Pagination).

## Gameplay / Inhalt
- [~] Mehr **Spezialpflanzen** (Ziel 100+) — **42/100** (thematisch zu den Fächern,
      Seltenheit 1–5 ausbalanciert). Nächste Charge: weiter Richtung 100.
- [x] **Tutorial / Onboarding** — Spotlight-Tour (16 Schritte): Rest abgedunkelt +
      verschwommen, Ziel mit leuchtendem Ring + Text-Popup. Startet automatisch beim
      ersten Login (`tutorialGesehen`), jederzeit neu über den ?-Knopf oben rechts.
      `ui/tutorial.js`.
- [x] **Erfolge/Achievements** — 26 Erfolge mit **dauerhaften Prozent-Boni** je
      Kategorie (💰 Verkauf, 📘 Wissen, 🔮 Essenz, ⭐ XP); schwerere Erfolge geben
      mehr. 🏆-Panel; `data/erfolge.js` + `core/erfolge.js`, fließt in `skillEffekte`.
- [x] **Zauber kosten Wissen** (`zauberWirkKosten`, steigt mit Tier) — zwingt zum
      Aufgabenlösen statt nur zu klicken.
- [x] **Pop-up-Blitzfrage** alle 5 Min (30 s): richtig ⇒ 5 s gratis zaubern
      (`ui.starteQuiz`, `spiel.quizAntwort`/`starteGratisZaubern`).
- [x] **Bugfix:** Zauber-Freischalt-Gate nutzt jetzt das *gerundete* Thema-Niveau
      (konsistent mit der Anzeige) — „Niveau 3 angezeigt, aber gesperrt" behoben.
- [x] **Kegel-Zauber:** nur noch flacher Boden-Sektor + Umriss (kein 3D-Kegel in der Luft).
- [x] **Charakter-Menü** (🧙): 3D-Avatar-Vorschau (Low-Poly-Männchen), **Titel**
      level-abhängig (Zauber-Novize → Meister-Zauberer) und **kosmetische Items**
      (1 pro Fach, frei ab Niveau 5 in allen Bereichen; Stab/Hut/Kutte, z. B.
      Mathe → Lineal-Zauberstab). `render/avatar.js` + `data/kosmetik.js`; der Avatar
      wird auch als Bauer im Spiel angezeigt.
- [x] **Tages-Streak** über mehrere Tage (zusätzlich zur Aufgaben-Serie):
      Login-Belohnung wächst mit der Streak; HUD-Badge 📅. `core/tagesstreak.js`.
- [x] **Spaced Repetition**: falsch beantwortete Aufgaben werden gemerkt und
      gezielt wiederholt (🔁-Hinweis); richtige entfernen sie wieder.
- [ ] Mehr Tiefe im Skill-Baum / optional „Prestige".

## Politur
- [ ] **Sound/Musik** (Ernte-, Treffer-, UI-Sounds; cozy Hintergrundmusik).
- [ ] **Mobile/Touch** feinschleifen (Zielen, Buttons, Panels).
- [ ] Echte **Low-Poly-Assets** statt Primitiven-Platzhalter.
- [ ] Aufgaben-Feedback mit ausführlicherem **Lösungsweg/Erklärung**.

## Bekannte Hinweise (kein Bug im Spiel)
- ℹ️ `auth.js` ist nur ein **lokaler Platzhalter** — echte Sicherheit erst mit Backend.
- ℹ️ Beim Testen: Preview-Tab geht oft in „hidden" → `preview_screenshot` hängt
  dann (Tooling). Lieber per `eval`/DOM verifizieren. Nach Tests Spielstand
  zurücksetzen (Upgrade-Menü → „♻️ Zurücksetzen").
