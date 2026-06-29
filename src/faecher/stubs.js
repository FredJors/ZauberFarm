// =============================================================================
// stubs.js — Registrierte, aber noch nicht implementierte Fächer (Oberstufe)
// -----------------------------------------------------------------------------
// Diese Stubs belegen die Modularität: Sie erfüllen die FachModul-Schnittstelle
// formal, werfen aber "noch nicht implementiert". Die UI listet sie auswählbar,
// und ein vollständiges Fach entsteht später allein durch das Ersetzen eines
// Stubs durch eine echte FachModul-Implementierung — ohne Eingriff in den Kern.
//
// Abgedeckt sind die Fächer der gymnasialen Oberstufe (Niedersachsen),
// gegliedert nach den drei Aufgabenfeldern (A sprachlich-künstlerisch,
// B gesellschaftswissenschaftlich, C math.-naturwiss.-technisch) sowie Sport.
// Jeder Eintrag trägt eine Konzeptnotiz, die die Kopplung an die Gitter-/
// Ernte-Mechanik skizziert (in der UI sichtbar).
// =============================================================================

function nichtImplementiert(name) {
  return () => { throw new Error(`${name}: Dieses Fach ist noch nicht implementiert.`); };
}

function stub(id, name, icon, farbe, konzept) {
  return {
    id, name, icon, farbe, implementiert: false, startNiveau: 1,
    konzept, // Konzeptnotiz für die spätere Implementierung
    themen: () => [],
    erzeugeAufgabe: nichtImplementiert(name),
    prüfeAntwort: nichtImplementiert(name),
    listeZauber: () => [],
    alleZauber: () => [],
    wirkeZauber: nichtImplementiert(name),
    niveauAnpassen: () => {},
    niveauFuer: () => 1,
  };
}

// --- Aufgabenfeld C: math.-naturwissenschaftlich-technisch -------------------
// (Mathematik, Physik, Chemie & Biologie sind voll ausgebaut → eigene Dateien.)

// --- Aufgabenfeld A: sprachlich-literarisch-künstlerisch ---------------------
// (Deutsch, Englisch, Französisch, Latein, Spanisch, Musik & Kunst sind voll
//  ausgebaut → eigene Dateien; die Sprachfächer teilen sich sprachfabrik.js.)
export const darstellendesSpielModul = stub(
  'darstellendes_spiel', 'Darstellendes Spiel', '🎭', '#c85ca0',
  'Bewegungs- und Choreografiepfade über die Felder; Szenenaufbau als Sequenz.'
);

// --- Aufgabenfeld B: gesellschaftswissenschaftlich ---------------------------
// (Geschichte, Erdkunde, Politik-Wirtschaft, Religion & Werte/Normen sind voll
//  ausgebaut → eigene Dateien.)
export const paedagogikModul = stub(
  'paedagogik', 'Pädagogik', '🧑‍🏫', '#d98f6a',
  'Entwicklungsmodelle & Lerntheorien; Phasen als Sequenz über die Felder.'
);
export const psychologieModul = stub(
  'psychologie', 'Psychologie', '🧠', '#c76fa0',
  'Experimente & Statistik; teilt die Stochastik-Mechanik (Verteilungen) der ' +
  'Mathematik.'
);

// --- Ohne Aufgabenfeld -------------------------------------------------------
export const sportModul = stub(
  'sport', 'Sport', '🏅', '#e07a3a',
  'Bewegungslehre: Wurf & Sprung als Parabel-Ernte; Trainingsdaten als Kurven.'
);

// Sammlung aller Stub-Fächer in sinnvoller Reihenfolge (für die Registrierung).
// Ein neues Fach ergänzt man, indem man hier einen Stub einträgt — oder ihn
// durch eine echte FachModul-Implementierung (wie mathe.js) ersetzt.
export const STUB_FAECHER = [
  // Aufgabenfeld C  (Mathe, Physik, Chemie & Biologie sind voll ausgebaut)
  // Aufgabenfeld A  (Sprachen, Musik & Kunst sind voll ausgebaut)
  darstellendesSpielModul,
  // Aufgabenfeld B  (Geschichte, Erdkunde, Politik-Wirtschaft, Religion &
  //                  Werte/Normen sind voll ausgebaut)
  paedagogikModul, psychologieModul,
  // ohne Aufgabenfeld
  sportModul,
];
