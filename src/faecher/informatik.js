// =============================================================================
// informatik.js — Vollständiges Fach Informatik (Algorithmen, Daten, Theorie)
// -----------------------------------------------------------------------------
// NEUE Zauberform: "Pfad" — ein Algorithmus zeichnet einen Pfad über das Gitter
// und erntet die berührten Felder:
//   • Schleifen-Zauber  — eine Schleife zeichnet eine wachsende Spirale.
//   • Raster-Zauber      — zwei verschachtelte Schleifen füllen einen Block (Mäander).
//   • Rekursions-Zauber  — eine rekursive Verzweigung zeichnet einen Baum.
// Aufgaben prozedural + MC-Banken (Programmierung, Datenstrukturen, Zahlensysteme,
// Logik, Komplexität — Oberstufen-Informatik).
// =============================================================================

import { berechneErnteForm } from '../core/ernte.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

// --------------------------------------------------------- kleine Helfer
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
let aufgabenZaehler = 0;

function parseZahl(eingabe) {
  if (typeof eingabe === 'number') return eingabe;
  if (typeof eingabe !== 'string') return NaN;
  const s = eingabe.trim().replace(',', '.');
  if (s === '') return NaN;
  if (typeof window !== 'undefined' && window.math) {
    try { const v = window.math.evaluate(s); if (Number.isFinite(v)) return v; } catch (_) { /* */ }
  }
  return parseFloat(s);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function neueAufgabe(daten) { return { id: `inf_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — Algorithmen & Programmierung
// =============================================================================
function genSchleifensumme(n) {
  const k = rndInt(3, 5 + n);
  const summe = (k * (k + 1)) / 2;
  return neueAufgabe({
    themaId: 'algorithmen', typ: 'numerisch', niveau: n,
    frage: `Eine Schleife addiert s = 1 + 2 + … + ${k}. Welchen Wert hat s am Ende?`,
    loesung: summe, toleranz: 0.001,
    hinweis: `Gauß-Summe: s = k·(k+1)/2 = ${k}·${k + 1}/2 = ${summe}.`,
  });
}
function genSchleifenDurchlaeufe(n) {
  const a = rndInt(2, 4 + n), b = rndInt(2, 5);
  return neueAufgabe({
    themaId: 'algorithmen', typ: 'numerisch', niveau: n,
    frage: `Wie oft wird die innere Anweisung ausgeführt?\nfor i in 1..${a}:\n  for j in 1..${b}:\n    print(i, j)`,
    loesung: a * b, toleranz: 0.001,
    hinweis: `Verschachtelte Schleifen: ${a} · ${b} = ${a * b} Durchläufe.`,
  });
}
function genZaehlschleife(n) {
  const start = rndInt(0, 3), schritt = wahl([1, 2]), bis = start + schritt * rndInt(3, 5 + n);
  const anzahl = Math.floor((bis - start) / schritt) + 1;
  return neueAufgabe({
    themaId: 'algorithmen', typ: 'numerisch', niveau: n,
    frage: `Wie oft läuft die Schleife? \nfor i = ${start} to ${bis} step ${schritt}`,
    loesung: anzahl, toleranz: 0.001,
    hinweis: `Werte ${start}, ${start + schritt}, … bis ${bis}: (${bis}−${start})/${schritt} + 1 = ${anzahl}.`,
  });
}
function genModulo(n) {
  const a = rndInt(10, 30 + n * 3), b = rndInt(2, 7);
  return neueAufgabe({
    themaId: 'algorithmen', typ: 'numerisch', niveau: n,
    frage: `Welchen Wert liefert ${a} mod ${b} (der Rest der Division)?`,
    loesung: a % b, toleranz: 0.001,
    hinweis: `${a} = ${Math.floor(a / b)}·${b} + ${a % b}, also Rest ${a % b}.`,
  });
}

// =============================================================================
// AUFGABEN — Datenstrukturen, Datenbanken, Zahlensysteme
// =============================================================================
function genBinaerZuDezimal(n) {
  const z = rndInt(5, 31 + n * 8);
  const bin = z.toString(2);
  return neueAufgabe({
    themaId: 'daten', typ: 'numerisch', niveau: n,
    frage: `Welche Dezimalzahl ist die Binärzahl ${bin}₂?`,
    loesung: z, toleranz: 0.001,
    hinweis: `${bin}₂ = ${bin.split('').map((b, i) => `${b}·2^${bin.length - 1 - i}`).join(' + ')} = ${z}.`,
  });
}
function genDezimalZuBinaer(n) {
  const z = rndInt(5, 31);
  const bin = z.toString(2);
  const falsch = new Set();
  while (falsch.size < 3) {
    const f = (z + wahl([-3, -2, -1, 1, 2, 3, 4])).toString(2);
    if (f !== bin && Number(f) >= 0) falsch.add(f);
  }
  const optionen = shuffle([bin, ...falsch]);
  return neueAufgabe({
    themaId: 'daten', typ: 'mc', niveau: n,
    frage: `Wie lautet die Dezimalzahl ${z} im Binärsystem?`,
    optionen, richtigeOption: optionen.indexOf(bin),
    hinweis: `${z}₁₀ = ${bin}₂ (fortgesetztes Teilen durch 2 mit Rest).`,
  });
}
function genBytes(n) {
  const bytes = rndInt(2, 8 + n);
  return neueAufgabe({
    themaId: 'daten', typ: 'numerisch', niveau: n,
    frage: `Wie viele Bit sind ${bytes} Byte?`,
    loesung: bytes * 8, toleranz: 0.001,
    hinweis: `1 Byte = 8 Bit ⇒ ${bytes}·8 = ${bytes * 8} Bit.`,
  });
}
function genBitKombinationen(n) {
  const bits = rndInt(2, Math.min(8, 3 + n));
  return neueAufgabe({
    themaId: 'daten', typ: 'numerisch', niveau: n,
    frage: `Wie viele verschiedene Werte kann man mit ${bits} Bit darstellen?`,
    loesung: Math.pow(2, bits), toleranz: 0.001,
    hinweis: `Mit n Bit: 2ⁿ = 2^${bits} = ${Math.pow(2, bits)} Werte.`,
  });
}
function genHexZuDezimal(n) {
  const z = rndInt(10, 15 + n * 10);
  const hex = z.toString(16).toUpperCase();
  return neueAufgabe({
    themaId: 'daten', typ: 'numerisch', niveau: n,
    frage: `Welche Dezimalzahl ist die Hexadezimalzahl ${hex}₁₆? (A=10 … F=15)`,
    loesung: z, toleranz: 0.001,
    hinweis: `${hex}₁₆ = ${z}₁₀.`,
  });
}

// =============================================================================
// AUFGABEN — Theoretische Informatik (Logik, Komplexität)
// =============================================================================
function genLogikAuswertung(n) {
  const a = wahl([true, false]), b = wahl([true, false]);
  const op = wahl([
    { name: 'UND (AND)', f: a && b }, { name: 'ODER (OR)', f: a || b },
    { name: 'XOR (entweder-oder)', f: a !== b },
  ]);
  const optionen = shuffle(['wahr (true)', 'falsch (false)']);
  const richtig = op.f ? 'wahr (true)' : 'falsch (false)';
  return neueAufgabe({
    themaId: 'theorie', typ: 'mc', niveau: n,
    frage: `Was ergibt ${a ? 'wahr' : 'falsch'} ${op.name} ${b ? 'wahr' : 'falsch'}?`,
    optionen, richtigeOption: optionen.indexOf(richtig),
    hinweis: `Die Verknüpfung ${op.name} liefert hier ${richtig}.`,
  });
}
function genZweierpotenz(n) {
  const k = rndInt(2, Math.min(10, 4 + n));
  return neueAufgabe({
    themaId: 'theorie', typ: 'numerisch', niveau: n,
    frage: `Welchen Wert hat 2^${k}?`,
    loesung: Math.pow(2, k), toleranz: 0.001,
    hinweis: `2^${k} = ${Math.pow(2, k)}.`,
  });
}

// ---- Konzept-Banken ---------------------------------------------------------
const ALGO_BANK = [
  { q: 'Welcher Index hat das ERSTE Element eines Arrays in den meisten Sprachen?', r: '0', f: ['1', '−1', 'das letzte'], h: 'Arrays sind üblicherweise 0-indiziert.' },
  { q: 'Was ist eine Schleife (Iteration)?', r: 'wiederholtes Ausführen eines Codeblocks', f: ['eine einmalige Verzweigung', 'das Speichern eines Werts', 'ein Funktionsaufruf von außen'], h: 'for/while wiederholen Anweisungen.' },
  { q: 'Wozu dient eine if-Anweisung?', r: 'zur Verzweigung abhängig von einer Bedingung', f: ['zum Wiederholen', 'zum Deklarieren einer Variablen', 'zum Beenden des Programms'], h: 'if/else steuert den Programmfluss.' },
  { q: 'Was macht der Zuweisungsoperator x = x + 1?', r: 'er erhöht x um 1', f: ['er prüft, ob x gleich x+1 ist', 'er verdoppelt x', 'er löscht x'], h: 'Rechte Seite wird berechnet und x zugewiesen (Inkrement).' },
  { q: 'Was ist ein Algorithmus?', r: 'eine endliche, eindeutige Handlungsvorschrift zur Lösung eines Problems', f: ['eine Programmiersprache', 'ein Computer', 'ein Datentyp'], h: 'Schrittfolge mit eindeutigem Ablauf und Ende.' },
  { q: 'Welche Struktur eignet sich für „so lange wiederholen, bis eine Bedingung gilt"?', r: 'while-Schleife', f: ['if-Abfrage', 'Funktionsdefinition', 'Konstante'], h: 'Kopf- oder fußgesteuerte Schleife.' },
  { q: 'Was bezeichnet eine Variable?', r: 'einen benannten Speicherplatz für einen Wert', f: ['einen festen, unveränderlichen Wert', 'eine Schleife', 'einen Drucker'], h: 'Variablen speichern veränderbare Werte.' },
];
const DATEN_BANK = [
  { q: 'Nach welchem Prinzip arbeitet ein Stack (Stapel)?', r: 'LIFO – last in, first out', f: ['FIFO – first in, first out', 'zufällig', 'sortiert nach Größe'], h: 'Zuletzt Abgelegtes wird zuerst entnommen.' },
  { q: 'Nach welchem Prinzip arbeitet eine Queue (Warteschlange)?', r: 'FIFO – first in, first out', f: ['LIFO – last in, first out', 'zufällig', 'nach Priorität immer'], h: 'Wie eine Schlange an der Kasse.' },
  { q: 'Welches Zahlensystem nutzt ein Computer intern?', r: 'das Binärsystem (Basis 2)', f: ['das Dezimalsystem (Basis 10)', 'das Hexadezimalsystem (Basis 16)', 'das Oktalsystem (Basis 8)'], h: 'Nur zwei Zustände: 0 und 1.' },
  { q: 'Wie viele Werte kann 1 Bit annehmen?', r: '2', f: ['8', '1', '10'], h: '0 oder 1.' },
  { q: 'Welcher SQL-Befehl fragt Daten aus einer Tabelle ab?', r: 'SELECT', f: ['DELETE', 'INSERT', 'UPDATE'], h: 'SELECT … FROM … WHERE … liest Datensätze.' },
  { q: 'Was ist ein Primärschlüssel in einer Datenbank?', r: 'ein Attribut, das jeden Datensatz eindeutig identifiziert', f: ['ein Passwort', 'eine Verschlüsselung', 'ein zufälliger Wert'], h: 'Eindeutige Kennung jeder Zeile.' },
  { q: 'Welche Datenstruktur verweist mit jedem Element auf das nächste?', r: 'verkettete Liste', f: ['Array fester Größe', 'Hashtabelle', 'Stack'], h: 'Knoten enthalten Daten + Zeiger auf den Nachfolger.' },
  { q: 'Ein Baum, bei dem jeder Knoten höchstens zwei Kinder hat, heißt …', r: 'Binärbaum', f: ['Liste', 'Graph', 'Ring'], h: 'Linkes und rechtes Kind je Knoten.' },
];
const THEORIE_BANK = [
  { q: 'Was beschreibt die O-Notation?', r: 'das Wachstum des Aufwands bei großen Eingaben', f: ['die Programmiersprache', 'die Speicheradresse', 'die Taktfrequenz'], h: 'z. B. O(n), O(n²), O(log n).' },
  { q: 'Welche Komplexität hat die binäre Suche?', r: 'O(log n)', f: ['O(n)', 'O(n²)', 'O(1)'], h: 'Der Suchbereich halbiert sich pro Schritt.' },
  { q: 'Welche Komplexität hat eine einfache lineare Suche?', r: 'O(n)', f: ['O(log n)', 'O(n²)', 'O(1)'], h: 'Im schlimmsten Fall jedes Element prüfen.' },
  { q: 'Was ergibt „wahr UND falsch"?', r: 'falsch', f: ['wahr', 'unbestimmt', 'beides'], h: 'AND ist nur wahr, wenn beide Operanden wahr sind.' },
  { q: 'Was ergibt „NICHT wahr" (Negation)?', r: 'falsch', f: ['wahr', 'unbestimmt', '1'], h: 'Die Negation kehrt den Wahrheitswert um.' },
  { q: 'Was beschreibt ein endlicher Automat?', r: 'ein Modell mit Zuständen und Übergängen', f: ['eine konkrete CPU', 'eine Programmiersprache', 'ein Betriebssystem'], h: 'Zustände + Eingaben ⇒ Zustandsübergänge.' },
  { q: 'Was ist eine Rekursion?', r: 'eine Funktion, die sich selbst aufruft', f: ['eine Schleife ohne Ende', 'ein Datentyp', 'ein Compilerfehler'], h: 'Mit Abbruchbedingung (Basisfall) terminiert sie.' },
];
function genAlgoKonzept(n) { return mcBank('algorithmen', n, ALGO_BANK); }
function genDatenKonzept(n) { return mcBank('daten', n, DATEN_BANK); }
function genTheorieKonzept(n) { return mcBank('theorie', n, THEORIE_BANK); }

const POOLS = {
  algorithmen: [
    { min: 1, gen: genAlgoKonzept }, { min: 1, gen: genModulo },
    { min: 2, gen: genZaehlschleife }, { min: 2, gen: genSchleifensumme },
    { min: 4, gen: genSchleifenDurchlaeufe },
  ],
  daten: [
    { min: 1, gen: genDatenKonzept }, { min: 1, gen: genBytes },
    { min: 2, gen: genBinaerZuDezimal }, { min: 2, gen: genBitKombinationen },
    { min: 3, gen: genDezimalZuBinaer }, { min: 5, gen: genHexZuDezimal },
  ],
  theorie: [
    { min: 1, gen: genTheorieKonzept }, { min: 1, gen: genLogikAuswertung },
    { min: 2, gen: genZweierpotenz },
  ],
};

// =============================================================================
// PFAD-GENERATOREN — Algorithmen, die einen Pfad über das Gitter zeichnen
// =============================================================================
// Wachsende quadratische Spirale (klassisches Schleifen-Muster).
function spiralePunkte(schritte) {
  const pts = [{ x: 0, y: 0 }];
  let x = 0, y = 0, len = 1, dir = 0, count = 0;
  const dx = [1, 0, -1, 0], dy = [0, 1, 0, -1];
  while (count < schritte) {
    for (let seg = 0; seg < 2; seg++) {
      for (let i = 0; i < len; i++) {
        x += dx[dir]; y += dy[dir];
        pts.push({ x, y }); count++;
        if (count >= schritte) return pts;
      }
      dir = (dir + 1) % 4;
    }
    len++;
  }
  return pts;
}
// Verschachtelte Schleifen füllen einen Block zeilenweise (Mäander/Boustrophedon).
function rasterPunkte(breite, hoehe) {
  const pts = [{ x: 0, y: 0 }];
  for (let row = 1; row <= hoehe; row++) {
    const vor = row % 2 === 1;
    for (let i = 0; i < breite; i++) {
      const col = vor ? i : breite - 1 - i;
      pts.push({ x: col, y: row });
    }
  }
  return pts;
}
// Rekursive Verzweigung zeichnet einen Baum (jeder Ast gabelt sich in zwei).
function baumPfade(tiefe, laenge) {
  const pfade = [];
  function ast(x, y, winkel, len, t) {
    const ex = x + Math.cos(winkel) * len;
    const ey = y + Math.sin(winkel) * len;
    pfade.push([{ x, y }, { x: ex, y: ey }]);
    if (t <= 0) return;
    ast(ex, ey, winkel + 0.5, len * 0.72, t - 1);
    ast(ex, ey, winkel - 0.5, len * 0.72, t - 1);
  }
  ast(0, 0, 0, laenge, tiefe); // wächst entlang +x, wird anschließend per θ gedreht
  return pfade;
}

// =============================================================================
// ZAUBER-KATALOG  (form 'pfad' → Algorithmus-Trails)
// =============================================================================
const UP_SCHRITTE = { name: 'Schleifen-Durchläufe', schluessel: 'schritte', step: 3, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_BREITE = { name: 'Array-Breite', schluessel: 'breite', step: 1, max: 5, kosten: (s) => 18 * (s + 1) };
const UP_HOEHE = { name: 'Array-Höhe', schluessel: 'hoehe', step: 1, max: 5, kosten: (s) => 18 * (s + 1) };
const UP_TIEFE = { name: 'Rekursionstiefe', schluessel: 'tiefe', step: 1, max: 3, kosten: (s) => 26 * (s + 1) };
const UP_ASTLAENGE = { name: 'Astlänge', schluessel: 'laenge', step: 0.4, max: 5, kosten: (s) => 16 * (s + 1) };

export const ZAUBER = {
  schleife: {
    id: 'schleife', name: 'Schleifen-Zauber', themaId: 'algorithmen', icon: '🔁',
    form: 'pfad', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Eine Schleife zeichnet eine wachsende Spirale über den Acker und erntet ihren Pfad.',
    basis: { schritte: 8 },
    upgrades: [UP_SCHRITTE],
    pfad: (p) => spiralePunkte(Math.max(1, Math.round(p.schritte))),
  },
  rasterlauf: {
    id: 'rasterlauf', name: 'Raster-Zauber', themaId: 'daten', icon: '🔢',
    form: 'pfad', tier: 3, freischalt: { wissen: 240, niveau: 3 },
    beschreibung: 'Zwei verschachtelte Schleifen füllen einen Block Feld für Feld (Mäander).',
    basis: { breite: 3, hoehe: 3 },
    upgrades: [UP_BREITE, UP_HOEHE],
    pfad: (p) => rasterPunkte(Math.max(1, Math.round(p.breite)), Math.max(1, Math.round(p.hoehe))),
  },
  rekursion: {
    id: 'rekursion', name: 'Rekursions-Zauber', themaId: 'theorie', icon: '🌿',
    form: 'pfad', tier: 4, freischalt: { wissen: 420, niveau: 4 },
    beschreibung: 'Eine rekursive Verzweigung zeichnet einen Baum — jeder Ast gabelt sich erneut.',
    basis: { tiefe: 2, laenge: 1.6 },
    upgrades: [UP_TIEFE, UP_ASTLAENGE],
    pfad: (p) => baumPfade(Math.max(0, Math.round(p.tiefe)), Math.max(0.6, p.laenge)),
  },
};

export const ZAUBER_LISTE = Object.values(ZAUBER);

// Effektive Parameter aus den Upgrade-Stufen (rein additiv).
function paramsFuer(zauber, stufen = {}) {
  const b = zauber.basis;
  const p = { ...b };
  for (const up of zauber.upgrades || []) {
    const s = stufen[up.schluessel] || 0;
    p[up.schluessel] = (b[up.schluessel] ?? 0) + s * up.step;
  }
  return p;
}

// =============================================================================
// DAS FACHMODUL
// =============================================================================
export const informatikModul = {
  id: 'informatik', name: 'Informatik', icon: '💻', farbe: '#5b6dd6',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Algorithmen zeichnen Pfade über das Gitter (Spirale, Raster, Rekursionsbaum); Aufgaben zu Programmierung, Datenstrukturen und Theorie.',

  themen() {
    return [
      { id: 'algorithmen', name: 'Algorithmen & Programmierung' },
      { id: 'daten', name: 'Daten & Zahlensysteme' },
      { id: 'theorie', name: 'Theoretische Informatik' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.algorithmen;
    const erlaubt = pool.filter((e) => e.min <= niveau);
    return wahl(erlaubt.length ? erlaubt : pool).gen(niveau);
  },

  prüfeAntwort(aufgabe, antwort) {
    let korrekt = false;
    if (aufgabe.typ === 'mc') {
      korrekt = Number(antwort) === aufgabe.richtigeOption;
    } else {
      const z = parseZahl(antwort);
      korrekt = Number.isFinite(z) && Math.abs(z - aufgabe.loesung) <= (aufgabe.toleranz ?? 0.001);
    }
    return {
      korrekt,
      erhalteneXP: korrekt ? basisBelohnung(aufgabe.niveau || 1) : 0,
      feedback: (korrekt ? '' : 'Leider falsch. ') + (aufgabe.hinweis || ''),
    };
  },

  niveauAnpassen(state, themaId, korrekt) {
    if (!state.meisterung) state.meisterung = {};
    passeNiveauAn(state.meisterung, themaId, korrekt, this.startNiveau);
  },

  listeZauber(themaId) { return ZAUBER_LISTE.filter((z) => !themaId || z.themaId === themaId); },
  alleZauber() { return ZAUBER_LISTE; },
  zauberAn(id) { return ZAUBER[id] || null; },
  paramsFuer,
  upgradeKosten(zauber, schluessel, stufe) {
    const up = zauber.upgrades.find((u) => u.schluessel === schluessel);
    return up ? kostenFuer(zauber.tier || 1, up, stufe) : 0;
  },

  // Pfad-Zauber sind deterministisch → gemeinsame Vorschau-/Ernte-Pipeline.
  berechneVorschau(zauber, params) { return berechneErnteForm(zauber, params); },
  wirkeZauber(zauber, params, spielfeld) {
    const { ziele, visual } = berechneErnteForm(zauber, params);
    const now = params.now ?? Date.now();
    const geerntet = [];
    for (const z of ziele) {
      const feld = spielfeld.feldAn(z.gx, z.gy);
      if (!feld) continue;
      const p = spielfeld.ernte(feld, now);
      if (p) geerntet.push({ feld, pflanze: p });
    }
    return { geerntet, ziele, visual };
  },
};

export default informatikModul;
