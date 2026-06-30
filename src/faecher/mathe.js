// =============================================================================
// mathe.js — Vollständige Referenzimplementierung der FachModul-Schnittstelle
// -----------------------------------------------------------------------------
// Enthält: Themen (Analysis/Geometrie/Stochastik), prozedurale Aufgaben mit
// eindeutiger Lösung, Antwortprüfung im Browser (mit math.js, wenn vorhanden),
// adaptive Schwierigkeit, den Zauber-Katalog (Funktionstypen + Upgrades) und
// das Wirken eines Zaubers über die gemeinsame Erntemechanik (core/ernte.js).
//
// Inhaltlich an der gymnasialen Oberstufe (Niedersachsen) orientiert.
// =============================================================================

import { berechneErnteForm } from '../core/ernte.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

// --------------------------------------------------------- kleine Helfer
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Vorzeichen-Term für lesbare Funktionsgleichungen ("+ 3" / "− 3").
const vz = (n) => (n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`);
let aufgabenZaehler = 0;

// Wandelt eine Nutzereingabe robust in eine Zahl um (Komma erlaubt, Terme via
// math.js wie "1/2" oder "sqrt(2)" werden ausgewertet, falls verfügbar).
function parseZahl(eingabe) {
  if (typeof eingabe === 'number') return eingabe;
  if (typeof eingabe !== 'string') return NaN;
  const s = eingabe.trim().replace(',', '.');
  if (s === '') return NaN;
  if (typeof window !== 'undefined' && window.math) {
    try {
      const v = window.math.evaluate(s);
      if (typeof v === 'number' && Number.isFinite(v)) return v;
    } catch (_) { /* fällt unten auf parseFloat zurück */ }
  }
  const v = parseFloat(s);
  return v;
}

// =============================================================================
// ZAUBER-KATALOG  (Funktionstyp → Erntemuster, freischalt- & aufwertbar)
// =============================================================================
// Jeder Zauber liefert über f(params) einen Funktions-Evaluator. params enthält
// die durch Upgrades veränderten Werte a, b, c sowie bereichMin/bereichMax.
const STD_UPGRADES = {
  bereichBeide: { name: 'Definitionsbereich', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) },
  bereichRechts: { name: 'Definitionsbereich', schluessel: 'bereich', richtung: 'rechts', max: 8, kosten: (s) => 18 * (s + 1) },
  amplitude: { name: 'Amplitude / Streckung (a)', schluessel: 'a', step: 0.5, max: 6, kosten: (s) => 15 * (s + 1) },
  frequenz: { name: 'Frequenz / Stauchung (b)', schluessel: 'b', step: 0.25, max: 6, kosten: (s) => 20 * (s + 1) },
  steigung: { name: 'Steigung (a)', schluessel: 'a', step: 0.5, max: 6, kosten: (s) => 15 * (s + 1) },
  verschiebung: { name: 'Verschiebung (c)', schluessel: 'c', step: 1, max: 5, kosten: (s) => 12 * (s + 1) },
};

export const ZAUBER = {
  linear: {
    id: 'linear', name: 'Geradenzauber', themaId: 'analysis', icon: '📈',
    beschreibung: 'f(x) = a·x + c — erntet entlang einer Geraden.',
    istIntegral: false, form: 'kurve', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    // Bewusst kurzer Start-Definitionsbereich [0,2] (nur 3 Felder); wächst per
    // "Definitionsbereich"-Upgrade nach rechts.
    basis: { a: 1, b: 1, c: 0, bereichMin: 0, bereichMax: 2 },
    upgrades: [STD_UPGRADES.bereichRechts, STD_UPGRADES.steigung, STD_UPGRADES.verschiebung],
    f: (p) => (x) => p.a * x + p.c,
  },
  quadrat: {
    id: 'quadrat', name: 'Parabelzauber', themaId: 'analysis', icon: '🥣',
    beschreibung: 'f(x) = a·x² + c — bogenförmige Ernte.',
    istIntegral: false, form: 'kurve', tier: 2, freischalt: { wissen: 70, niveau: 2 },
    basis: { a: 0.5, b: 1, c: 0, bereichMin: -3, bereichMax: 3 },
    upgrades: [STD_UPGRADES.bereichBeide, STD_UPGRADES.amplitude, STD_UPGRADES.verschiebung],
    f: (p) => (x) => p.a * x * x + p.c,
  },
  sinus: {
    id: 'sinus', name: 'Wellenzauber', themaId: 'analysis', icon: '🌊',
    beschreibung: 'f(x) = a·sin(b·x) + c — wellenförmiges Muster.',
    istIntegral: false, form: 'kurve', tier: 3, freischalt: { wissen: 170, niveau: 3 },
    basis: { a: 2, b: 1, c: 0, bereichMin: -6, bereichMax: 6 },
    upgrades: [STD_UPGRADES.bereichBeide, STD_UPGRADES.amplitude, STD_UPGRADES.frequenz, STD_UPGRADES.verschiebung],
    f: (p) => (x) => p.a * Math.sin(p.b * x) + p.c,
  },
  exp: {
    id: 'exp', name: 'Wachstumszauber', themaId: 'analysis', icon: '🚀',
    beschreibung: 'f(x) = a·e^(b·x) — schnell steigendes Muster.',
    istIntegral: false, form: 'kurve', tier: 3, freischalt: { wissen: 300, niveau: 4 },
    basis: { a: 1, b: 0.5, c: 0, bereichMin: 0, bereichMax: 4 },
    upgrades: [STD_UPGRADES.bereichRechts, STD_UPGRADES.frequenz],
    f: (p) => (x) => p.a * Math.exp(p.b * x),
  },
  log: {
    id: 'log', name: 'Logarithmuszauber', themaId: 'analysis', icon: '🐌',
    beschreibung: 'f(x) = a·ln(b·x) — langsam steigendes Muster.',
    istIntegral: false, form: 'kurve', tier: 4, freischalt: { wissen: 470, niveau: 5 },
    basis: { a: 2, b: 1, c: 0, bereichMin: 1, bereichMax: 7 },
    upgrades: [STD_UPGRADES.bereichRechts, STD_UPGRADES.amplitude],
    f: (p) => (x) => (p.b * x > 0 ? p.a * Math.log(p.b * x) : NaN),
  },
  integral: {
    id: 'integral', name: 'Flächenzauber (Integral)', themaId: 'analysis', icon: '🟧',
    beschreibung: '∫ f(x) dx — erntet die ganze Fläche zwischen Kurve und x-Achse.',
    istIntegral: true, form: 'kurve', tier: 5, freischalt: { wissen: 700, niveau: 6 },
    basis: { a: -0.4, b: 1, c: 4, bereichMin: -3, bereichMax: 3 },
    upgrades: [STD_UPGRADES.bereichBeide, STD_UPGRADES.verschiebung],
    f: (p) => (x) => p.a * x * x + p.c,
  },
};

export const ZAUBER_LISTE = Object.values(ZAUBER);

// Berechnet die effektiven Parameter eines Zaubers aus seinen Upgrade-Stufen.
function paramsFuer(zauber, stufen = {}) {
  const b = zauber.basis;
  const p = { a: b.a, b: b.b, c: b.c, bereichMin: b.bereichMin, bereichMax: b.bereichMax };
  for (const up of zauber.upgrades || []) {
    const s = stufen[up.schluessel] || 0;
    if (up.schluessel === 'bereich') {
      if (up.richtung === 'beide') { p.bereichMin = b.bereichMin - s; p.bereichMax = b.bereichMax + s; }
      else { p.bereichMax = b.bereichMax + s; }
    } else {
      p[up.schluessel] = b[up.schluessel] + s * up.step;
    }
  }
  return p;
}

// =============================================================================
// AUFGABEN — prozedural, mit eindeutig berechenbarer Lösung
// =============================================================================
function neueAufgabe(daten) {
  return { id: `aufg_${++aufgabenZaehler}`, ...daten };
}

// ---- Analysis-Generatoren ---------------------------------------------------
// Sehr leichter Einstieg (Niveau 1): triviale Aufgaben für schnelle Erfolge.
function genGrundrechnen(n) {
  const a = rndInt(1, 9), b = rndInt(1, 9), op = wahl(['+', '−', '·']);
  const loesung = op === '+' ? a + b : op === '−' ? a - b : a * b;
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Berechne: ${a} ${op} ${b}.`,
    loesung, toleranz: 0.001,
    hinweis: `${a} ${op} ${b} = ${loesung}.`,
  });
}
function genEinfacherWert(n) {
  const c = rndInt(1, 8), x0 = rndInt(1, 6);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Es gilt f(x) = x ${vz(c)}. Was ist f(${x0})?`,
    loesung: x0 + c, toleranz: 0.001,
    hinweis: `Setze x = ${x0} ein: ${x0} ${vz(c)} = ${x0 + c}.`,
  });
}

function genFunktionswert(n) {
  const r = 2 + n; // Zahlenbereich wächst linear mit dem Niveau
  const m = rndInt(-r, r) || 2, b = rndInt(-2 * r, 2 * r), x0 = rndInt(-r, r);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Berechne f(${x0}) für f(x) = ${m}·x ${vz(b)}.`,
    loesung: m * x0 + b, toleranz: 0.001,
    hinweis: `Setze x = ${x0} ein: ${m}·${x0} ${vz(b)} = ${m * x0 + b}.`,
  });
}
function genNullstelleLinear(n) {
  const m = (rndInt(-5, 5) || 3), b = rndInt(-8, 8);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Bestimme die Nullstelle von f(x) = ${m}·x ${vz(b)}.`,
    loesung: -b / m, toleranz: 0.01,
    hinweis: `${m}·x ${vz(b)} = 0  ⇒  x = ${-b}/${m} = ${(-b / m).toFixed(2)}.`,
  });
}
function genSteigung(n) {
  const x1 = rndInt(-4, 0), x2 = rndInt(1, 5), y1 = rndInt(-5, 5), y2 = rndInt(-5, 5);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Welche Steigung hat die Gerade durch P(${x1}|${y1}) und Q(${x2}|${y2})?`,
    loesung: (y2 - y1) / (x2 - x1), toleranz: 0.01,
    hinweis: `m = (y₂−y₁)/(x₂−x₁) = (${y2}−${y1})/(${x2}−${x1}) = ${((y2 - y1) / (x2 - x1)).toFixed(2)}.`,
  });
}
function genAbleitung(n) {
  const a = rndInt(1, 2 + n), x0 = rndInt(-2 - n, 3 + n);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Gegeben f(x) = ${a}·x². Bestimme f′(${x0}).`,
    loesung: 2 * a * x0, toleranz: 0.001,
    hinweis: `f′(x) = ${2 * a}·x, also f′(${x0}) = ${2 * a}·${x0} = ${2 * a * x0}.`,
  });
}
function genNullstellenQuadrat(n) {
  const r1 = rndInt(-4, 1), r2 = rndInt(2, 5); // zwei verschiedene Nullstellen
  const p = -(r1 + r2), q = r1 * r2;
  const falsch1 = `x = ${-r1}; x = ${-r2}`;
  const falsch2 = `x = ${r1 + 1}; x = ${r2 - 1}`;
  const richtig = `x = ${r1}; x = ${r2}`;
  const optionen = shuffle([richtig, falsch1, falsch2, 'keine reellen Nullstellen']);
  return neueAufgabe({
    themaId: 'analysis', typ: 'mc', niveau: n,
    frage: `Welche Nullstellen hat f(x) = x² ${vz(p)}·x ${vz(q)}?`,
    optionen, richtigeOption: optionen.indexOf(richtig),
    hinweis: `Faktorisiert: (x ${vz(-r1)})·(x ${vz(-r2)}) = 0 ⇒ x = ${r1} und x = ${r2}.`,
  });
}
function genIntegralLinear(n) {
  const m = rndInt(1, 4), b = rndInt(2, 5);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Berechne das bestimmte Integral ∫₀^${b} ${m}·x dx.`,
    loesung: (m * b * b) / 2, toleranz: 0.01,
    hinweis: `Stammfunktion ${m}/2·x². Eingesetzt: ${m}/2·${b}² = ${(m * b * b) / 2}.`,
  });
}
function genExpWert(n) {
  const a = rndInt(1, 3), k = rndInt(1, 4);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Eine Größe wächst gemäß f(x) = ${a}·2^x. Berechne f(${k}).`,
    loesung: a * Math.pow(2, k), toleranz: 0.01,
    hinweis: `${a}·2^${k} = ${a}·${Math.pow(2, k)} = ${a * Math.pow(2, k)}.`,
  });
}
// Schwerere Aufgaben für hohe Niveaus.
function genAbleitungPolynom(n) {
  const a = rndInt(1, 3), b = rndInt(1, 4), c = rndInt(-5, 5), x0 = rndInt(-3, 3);
  // f(x) = a·x³ + b·x² + c  ⇒  f′(x) = 3a·x² + 2b·x
  const fs = 3 * a * x0 * x0 + 2 * b * x0;
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Gegeben f(x) = ${a}·x³ + ${b}·x² ${vz(c)}. Bestimme f′(${x0}).`,
    loesung: fs, toleranz: 0.001,
    hinweis: `f′(x) = ${3 * a}·x² + ${2 * b}·x ⇒ f′(${x0}) = ${3 * a}·${x0}² + ${2 * b}·${x0} = ${fs}.`,
  });
}
function genIntegralQuadrat(n) {
  const a = rndInt(1, 3), b = rndInt(2, 4);
  // ∫₀^b a·x² dx = a/3·b³
  const loesung = (a * b * b * b) / 3;
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Berechne ∫₀^${b} ${a}·x² dx.`,
    loesung, toleranz: 0.05,
    hinweis: `Stammfunktion ${a}/3·x³. Eingesetzt: ${a}/3·${b}³ = ${loesung.toFixed(2)}.`,
  });
}
function genSinusKonzept(n) {
  const a = rndInt(2, 5), b = rndInt(2, 4);
  const optionen = shuffle([`${a}`, `${b}`, `${a * b}`, `${a + b}`]);
  return neueAufgabe({
    themaId: 'analysis', typ: 'mc', niveau: n,
    frage: `Welche Amplitude hat f(x) = ${a}·sin(${b}·x)?`,
    optionen, richtigeOption: optionen.indexOf(`${a}`),
    hinweis: `Die Amplitude ist der Faktor vor dem Sinus, also ${a}. (b = ${b} ändert die Periode.)`,
  });
}
function genIntegralKonzept(n) {
  const richtig = 'der Flächeninhalt zwischen Graph und x-Achse';
  const optionen = shuffle([
    richtig, 'die Steigung des Graphen', 'der höchste Funktionswert', 'die Anzahl der Nullstellen',
  ]);
  return neueAufgabe({
    themaId: 'analysis', typ: 'mc', niveau: n,
    frage: 'Was beschreibt das bestimmte Integral ∫ₐᵇ f(x) dx (für f ≥ 0)?',
    optionen, richtigeOption: optionen.indexOf(richtig),
    hinweis: 'Das Integral misst die Fläche zwischen Kurve und x-Achse — genau das erntet der Flächenzauber.',
  });
}

function genScheitelStelle(n) {
  const b = 2 * (rndInt(-4, 4) || 1), c = rndInt(-6, 6);
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Bestimme die x-Koordinate des Scheitelpunkts von f(x) = x² ${vz(b)}·x ${vz(c)}.`,
    loesung: -b / 2, toleranz: 0.01,
    hinweis: `Scheitel bei x = −b/(2a) = −(${b})/2 = ${-b / 2}.`,
  });
}
function genSymmetrie(n) {
  const k = wahl([2, 3, 4]);
  const richtig = k % 2 === 0 ? 'achsensymmetrisch zur y-Achse' : 'punktsymmetrisch zum Ursprung';
  const optionen = shuffle(['achsensymmetrisch zur y-Achse', 'punktsymmetrisch zum Ursprung', 'keine Symmetrie']);
  return neueAufgabe({
    themaId: 'analysis', typ: 'mc', niveau: n,
    frage: `Welche Symmetrie hat der Graph von f(x) = x^${k}?`,
    optionen, richtigeOption: optionen.indexOf(richtig),
    hinweis: `x^${k} ist eine ${k % 2 === 0 ? 'gerade' : 'ungerade'} Funktion ⇒ ${richtig}.`,
  });
}
function genGrenzwert(n) {
  const faelle = [
    { f: 'e^(−x)', ziel: '0' }, { f: 'e^(x)', ziel: '+∞' },
    { f: '1/x', ziel: '0' }, { f: 'ln(x)', ziel: '+∞' },
  ];
  const c = wahl(faelle);
  const optionen = shuffle(['0', '+∞', '−∞', '1']);
  return neueAufgabe({
    themaId: 'analysis', typ: 'mc', niveau: n,
    frage: `Wogegen strebt f(x) = ${c.f} für x → +∞?`,
    optionen, richtigeOption: optionen.indexOf(c.ziel),
    hinweis: `Für x → +∞ strebt ${c.f} gegen ${c.ziel}.`,
  });
}
function genQuadratWert(n) {
  const a = rndInt(1, 1 + n), b = rndInt(-n - 2, n + 2), c = rndInt(-5, 5), x0 = rndInt(-3, 3);
  const y = a * x0 * x0 + b * x0 + c;
  return neueAufgabe({
    themaId: 'analysis', typ: 'numerisch', niveau: n,
    frage: `Berechne f(${x0}) für f(x) = ${a}·x² ${vz(b)}·x ${vz(c)}.`,
    loesung: y, toleranz: 0.001,
    hinweis: `${a}·${x0}² ${vz(b)}·${x0} ${vz(c)} = ${y}.`,
  });
}

// ---- Geometrie-Generatoren --------------------------------------------------
function genSkalarprodukt(n) {
  const v = [rndInt(-4, 4), rndInt(-4, 4)], w = [rndInt(-4, 4), rndInt(-4, 4)];
  return neueAufgabe({
    themaId: 'geometrie', typ: 'numerisch', niveau: n,
    frage: `Berechne das Skalarprodukt (${v[0]}, ${v[1]}) · (${w[0]}, ${w[1]}).`,
    loesung: v[0] * w[0] + v[1] * w[1], toleranz: 0.001,
    hinweis: `${v[0]}·${w[0]} + ${v[1]}·${w[1]} = ${v[0] * w[0] + v[1] * w[1]}.`,
  });
}
function genBetrag(n) {
  const paare = [[3, 4], [6, 8], [5, 12], [8, 15]];
  const [x, y] = wahl(paare);
  return neueAufgabe({
    themaId: 'geometrie', typ: 'numerisch', niveau: n,
    frage: `Wie lang ist der Vektor (${x}, ${y})? (Betrag)`,
    loesung: Math.hypot(x, y), toleranz: 0.05,
    hinweis: `|v| = √(${x}² + ${y}²) = √${x * x + y * y} = ${Math.hypot(x, y)}.`,
  });
}
function genSkalarprodukt3D(n) {
  const v = [rndInt(-4, 4), rndInt(-4, 4), rndInt(-4, 4)];
  const w = [rndInt(-4, 4), rndInt(-4, 4), rndInt(-4, 4)];
  const erg = v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
  return neueAufgabe({
    themaId: 'geometrie', typ: 'numerisch', niveau: n,
    frage: `Berechne das Skalarprodukt (${v.join(', ')}) · (${w.join(', ')}).`,
    loesung: erg, toleranz: 0.001,
    hinweis: `${v[0]}·${w[0]} + ${v[1]}·${w[1]} + ${v[2]}·${w[2]} = ${erg}.`,
  });
}
function genBetrag3D(n) {
  const tripel = [[2, 3, 6], [1, 2, 2], [2, 6, 9], [4, 4, 7], [1, 4, 8]];
  const [x, y, z] = wahl(tripel);
  const L = Math.sqrt(x * x + y * y + z * z);
  return neueAufgabe({
    themaId: 'geometrie', typ: 'numerisch', niveau: n,
    frage: `Wie lang ist der Vektor (${x}, ${y}, ${z})?`,
    loesung: L, toleranz: 0.05,
    hinweis: `|v| = √(${x}²+${y}²+${z}²) = √${x * x + y * y + z * z} = ${L}.`,
  });
}
function genMittelpunkt(n) {
  const x1 = 2 * rndInt(-4, 4), x2 = 2 * rndInt(-4, 4), y1 = rndInt(-5, 5), y2 = rndInt(-5, 5);
  return neueAufgabe({
    themaId: 'geometrie', typ: 'numerisch', niveau: n,
    frage: `Welche x-Koordinate hat der Mittelpunkt von P(${x1}|${y1}) und Q(${x2}|${y2})?`,
    loesung: (x1 + x2) / 2, toleranz: 0.01,
    hinweis: `x_M = (x_P + x_Q)/2 = (${x1} + ${x2})/2 = ${(x1 + x2) / 2}.`,
  });
}
function genOrthogonalMC(n) {
  const a = rndInt(1, 4), b = rndInt(1, 4);
  const orthogonal = Math.random() < 0.5;
  const w = orthogonal ? [-b, a] : [rndInt(1, 4), rndInt(1, 4)];
  const dot = a * w[0] + b * w[1];
  const wirklich = dot === 0;
  const optionen = ['ja, sie stehen senkrecht', 'nein, sie stehen nicht senkrecht'];
  return neueAufgabe({
    themaId: 'geometrie', typ: 'mc', niveau: n,
    frage: `Stehen die Vektoren (${a}, ${b}) und (${w[0]}, ${w[1]}) senkrecht aufeinander?`,
    optionen, richtigeOption: wirklich ? 0 : 1,
    hinweis: `Skalarprodukt = ${a}·${w[0]} + ${b}·${w[1]} = ${dot}. Senkrecht ⇔ Skalarprodukt = 0.`,
  });
}
function genGeradenpunkt(n) {
  const s = [rndInt(-3, 3), rndInt(-3, 3)], r = [rndInt(1, 3), rndInt(-3, 3)], t = rndInt(1, 4);
  const px = s[0] + t * r[0];
  return neueAufgabe({
    themaId: 'geometrie', typ: 'numerisch', niveau: n,
    frage: `Eine Gerade ist g: x⃗ = (${s[0]}, ${s[1]}) + t·(${r[0]}, ${r[1]}). Welche x-Koordinate hat der Punkt für t = ${t}?`,
    loesung: px, toleranz: 0.01,
    hinweis: `x = ${s[0]} + ${t}·${r[0]} = ${px}.`,
  });
}

// ---- Stochastik-Generatoren -------------------------------------------------
function genErwartungswert(n) {
  return neueAufgabe({
    themaId: 'stochastik', typ: 'numerisch', niveau: n,
    frage: 'Welchen Erwartungswert hat der Augenwert eines fairen Würfels?',
    loesung: 3.5, toleranz: 0.01,
    hinweis: 'E = (1+2+3+4+5+6)/6 = 21/6 = 3,5.',
  });
}
function genWkeit(n) {
  const k = rndInt(2, 5);
  return neueAufgabe({
    themaId: 'stochastik', typ: 'numerisch', niveau: n,
    frage: `Mit welcher Wahrscheinlichkeit zeigt ein fairer Würfel eine Zahl ≤ ${k}? (als Dezimalzahl)`,
    loesung: k / 6, toleranz: 0.02,
    hinweis: `Günstige/mögliche = ${k}/6 = ${(k / 6).toFixed(3)}.`,
  });
}
const fakultaet = (m) => { let r = 1; for (let i = 2; i <= m; i++) r *= i; return r; };
const binom = (m, k) => fakultaet(m) / (fakultaet(k) * fakultaet(m - k));
function genGegenWk(n) {
  const p = wahl([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.75, 0.8]);
  return neueAufgabe({
    themaId: 'stochastik', typ: 'numerisch', niveau: n,
    frage: `Ein Ereignis A hat die Wahrscheinlichkeit P(A) = ${String(p).replace('.', ',')}. Wie groß ist die Gegenwahrscheinlichkeit P(Ā)?`,
    loesung: 1 - p, toleranz: 0.001,
    hinweis: `P(Ā) = 1 − P(A) = 1 − ${p} = ${(1 - p).toFixed(2)}.`,
  });
}
function genUndWk(n) {
  const p = wahl([0.2, 0.3, 0.4, 0.5, 0.6]), q = wahl([0.2, 0.5, 0.4, 0.3]);
  return neueAufgabe({
    themaId: 'stochastik', typ: 'numerisch', niveau: n,
    frage: `Zwei unabhängige Ereignisse haben P(A) = ${String(p).replace('.', ',')} und P(B) = ${String(q).replace('.', ',')}. Wie groß ist P(A und B)?`,
    loesung: p * q, toleranz: 0.005,
    hinweis: `Bei Unabhängigkeit: P(A∩B) = P(A)·P(B) = ${p}·${q} = ${(p * q).toFixed(2)}.`,
  });
}
function genFakultaet(n) {
  const m = rndInt(3, 6);
  return neueAufgabe({
    themaId: 'stochastik', typ: 'numerisch', niveau: n,
    frage: `Auf wie viele Arten kann man ${m} verschiedene Bücher anordnen? (${m}!)`,
    loesung: fakultaet(m), toleranz: 0.001,
    hinweis: `${m}! = ${Array.from({ length: m }, (_, i) => m - i).join('·')} = ${fakultaet(m)}.`,
  });
}
function genBinomKoeff(n) {
  const m = rndInt(4, 6), k = rndInt(2, m - 1);
  return neueAufgabe({
    themaId: 'stochastik', typ: 'numerisch', niveau: n,
    frage: `Wie viele Möglichkeiten gibt es, aus ${m} Personen ${k} auszuwählen? (Binomialkoeffizient C(${m}, ${k}))`,
    loesung: binom(m, k), toleranz: 0.001,
    hinweis: `C(${m},${k}) = ${m}! / (${k}!·${m - k}!) = ${binom(m, k)}.`,
  });
}
function genLaplace(n) {
  const faelle = [
    { f: 'eine gerade Zahl', g: 3 }, { f: 'eine durch 3 teilbare Zahl', g: 2 },
    { f: 'eine Primzahl (2,3,5)', g: 3 }, { f: 'eine Zahl größer als 4', g: 2 },
  ];
  const c = wahl(faelle);
  return neueAufgabe({
    themaId: 'stochastik', typ: 'numerisch', niveau: n,
    frage: `Mit welcher Wahrscheinlichkeit würfelt man ${c.f}? (Dezimalzahl)`,
    loesung: c.g / 6, toleranz: 0.02,
    hinweis: `Günstige/mögliche = ${c.g}/6 = ${(c.g / 6).toFixed(3)}.`,
  });
}
function genBinomialKonzept(n) {
  const richtig = 'bei n unabhängigen Versuchen mit je zwei Ausgängen';
  const optionen = shuffle([richtig, 'bei stetigen Messgrößen', 'wenn es unendlich viele Ausgänge gibt', 'nur bei fairen Würfeln']);
  return neueAufgabe({
    themaId: 'stochastik', typ: 'mc', niveau: n,
    frage: 'Wann verwendet man die Binomialverteilung?',
    optionen, richtigeOption: optionen.indexOf(richtig),
    hinweis: 'Die Binomialverteilung beschreibt n unabhängige Bernoulli-Versuche (je Treffer/Niete).',
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Konzept-Banken: zusätzliche MC-Fragen je Thema (mehr Abwechslung) ------
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({
    themaId, typ: 'mc', niveau: n,
    frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '',
  });
}
const ANALYSIS_BANK = [
  { q: 'Was beschreibt die erste Ableitung f′(x) an einer Stelle?', r: 'die Steigung des Graphen', f: ['den Funktionswert', 'die Krümmung', 'die Nullstelle'], h: 'f′(x) ist die Steigung der Tangente.' },
  { q: 'Wie nennt man eine Stelle, an der f(x) = 0 ist?', r: 'Nullstelle', f: ['Extremstelle', 'Wendestelle', 'Polstelle'], h: 'Dort schneidet der Graph die x-Achse.' },
  { q: 'Was gilt an einem Hochpunkt für f′(x)?', r: 'f′(x) = 0', f: ['f′(x) > 0', 'f′(x) < 0', 'f′(x) = 1'], h: 'Notwendige Bedingung für Extrema: f′(x) = 0.' },
  { q: 'Welche Funktion wächst für große x am schnellsten?', r: 'e^x', f: ['x²', 'ln(x)', 'x'], h: 'Exponentialfunktionen wachsen schneller als jede Potenz.' },
  { q: 'Die Stammfunktion von f(x) = 2x ist …', r: 'x² + C', f: ['2', 'x²', '2x² + C'], h: 'Integrieren: ∫2x dx = x² + C.' },
  { q: 'Was beschreibt die zweite Ableitung f″(x)?', r: 'die Krümmung des Graphen', f: ['die Steigung', 'den Funktionswert', 'die Nullstelle'], h: 'f″ > 0: Linkskurve, f″ < 0: Rechtskurve.' },
  { q: 'Welche Bedingung gilt notwendig an einer Wendestelle?', r: 'f″(x) = 0', f: ['f′(x) = 0', 'f(x) = 0', 'f″(x) > 0'], h: 'Notwendig: f″(x) = 0, dazu Vorzeichenwechsel von f″.' },
  { q: 'Die Ableitung von f(x) = x³ ist …', r: '3x²', f: ['x²', '3x', 'x⁴/4'], h: 'Potenzregel: (xⁿ)′ = n·xⁿ⁻¹.' },
  { q: 'Was ist ∫ x² dx?', r: 'x³/3 + C', f: ['2x + C', '3x² + C', 'x³ + C'], h: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C, hier n = 2.' },
  { q: 'Die Ableitung von f(x) = sin(x) ist …', r: 'cos(x)', f: ['−cos(x)', '−sin(x)', 'tan(x)'], h: '(sin x)′ = cos x, (cos x)′ = −sin x.' },
];
const GEO_BANK = [
  { q: 'Zwei Vektoren stehen senkrecht, wenn ihr Skalarprodukt …', r: '0 ist', f: ['1 ist', 'negativ ist', 'maximal ist'], h: 'a⃗·b⃗ = 0 ⇔ a⃗ ⟂ b⃗.' },
  { q: 'Wie ist eine Gerade in Parameterform aufgebaut?', r: 'Stützvektor + t · Richtungsvektor', f: ['nur ein Punkt', 'zwei Stützvektoren', 'Skalarprodukt zweier Punkte'], h: 'g: x⃗ = a⃗ + t·u⃗.' },
  { q: 'Was beschreibt der Betrag |v⃗| eines Vektors?', r: 'seine Länge', f: ['seine Richtung', 'seinen Winkel', 'seinen Mittelpunkt'], h: '|v⃗| = √(x²+y²+z²).' },
  { q: 'Zwei Vektoren heißen kollinear, wenn sie …', r: 'parallel (Vielfache voneinander) sind', f: ['senkrecht sind', 'gleich lang sind', 'sich schneiden'], h: 'a⃗ = r·b⃗ für ein r.' },
  { q: 'Das Skalarprodukt zweier Vektoren ergibt …', r: 'eine Zahl (Skalar)', f: ['einen Vektor', 'eine Matrix', 'eine Gerade'], h: 'a⃗·b⃗ = a₁b₁ + a₂b₂ + a₃b₃ — eine Zahl.' },
  { q: 'Wie viele Koordinaten hat ein Vektor im Raum ℝ³?', r: 'drei', f: ['zwei', 'eine', 'vier'], h: 'ℝ³: (x, y, z).' },
  { q: 'Wie berechnet man den Mittelpunkt M von A und B?', r: '½·(A⃗ + B⃗)', f: ['A⃗ − B⃗', 'A⃗ · B⃗', 'A⃗ + B⃗'], h: 'M = (A+B)/2, komponentenweise.' },
  { q: 'Eine Ebene in Parameterform braucht …', r: 'einen Stützvektor und zwei Richtungsvektoren', f: ['nur einen Punkt', 'drei Stützvektoren', 'ein Skalarprodukt'], h: 'E: x⃗ = a⃗ + s·u⃗ + t·v⃗.' },
  { q: 'Der Normalenvektor n⃗ einer Ebene steht zur Ebene …', r: 'senkrecht', f: ['parallel', 'schräg', 'in der Ebene'], h: 'n⃗ ⟂ zu jeder Richtung in der Ebene.' },
];
const STOCH_BANK = [
  { q: 'Welchen Wert hat die Summe aller Wahrscheinlichkeiten?', r: '1', f: ['0', '100', '6'], h: 'Alle Ausgänge zusammen ergeben 1 (100 %).' },
  { q: 'Wann verwendet man die Binomialverteilung?', r: 'bei n unabhängigen Versuchen mit je zwei Ausgängen', f: ['bei stetigen Messgrößen', 'bei unendlich vielen Ausgängen', 'nur bei Würfeln'], h: 'Bernoulli-Kette: Treffer/Niete, feste Trefferwkt.' },
  { q: 'Was beschreibt der Erwartungswert E(X)?', r: 'den durchschnittlich zu erwartenden Wert', f: ['den höchsten Wert', 'die Wahrscheinlichkeit', 'die Anzahl der Versuche'], h: 'E(X) = Σ x·P(x).' },
  { q: 'Welche Verteilung hat eine Glockenkurve?', r: 'die Normalverteilung', f: ['die Binomialverteilung', 'die Laplace-Verteilung', 'die Gleichverteilung'], h: 'Die Normalverteilung (Gauß) ist glockenförmig.' },
  { q: 'Wie berechnet man die Gegenwahrscheinlichkeit P(Ā)?', r: '1 − P(A)', f: ['P(A) − 1', '1 / P(A)', 'P(A)²'], h: 'A und Ā ergänzen sich zu 1.' },
  { q: 'Wie groß ist beim fairen Würfel P für eine bestimmte Augenzahl?', r: '1/6', f: ['1/2', '1/3', '6'], h: 'Laplace: 1 günstiger von 6 gleichwahrscheinlichen Fällen.' },
  { q: 'Für unabhängige Ereignisse gilt: P(A und B) = …', r: 'P(A) · P(B)', f: ['P(A) + P(B)', 'P(A) − P(B)', 'P(A) / P(B)'], h: 'Bei Unabhängigkeit werden die Wahrscheinlichkeiten multipliziert.' },
  { q: 'Für sich ausschließende Ereignisse gilt: P(A oder B) = …', r: 'P(A) + P(B)', f: ['P(A) · P(B)', 'P(A) − P(B)', '1'], h: 'Additionssatz bei disjunkten (unvereinbaren) Ereignissen.' },
  { q: 'Was ist die Standardabweichung σ?', r: 'die Wurzel der Varianz', f: ['das Quadrat der Varianz', 'der Erwartungswert', 'die Spannweite'], h: 'σ = √(Var(X)).' },
  { q: 'Eine Wahrscheinlichkeit liegt immer …', r: 'zwischen 0 und 1', f: ['zwischen 0 und 100', 'über 1', 'zwischen −1 und 1'], h: '0 ≤ P ≤ 1, also 0 % bis 100 %.' },
];
function genAnalysisKonzept(n) { return mcBank('analysis', n, ANALYSIS_BANK); }
function genGeoKonzept(n) { return mcBank('geometrie', n, GEO_BANK); }
function genStochKonzept(n) { return mcBank('stochastik', n, STOCH_BANK); }

// Generator-Pools je Thema; höhere Niveaus schalten anspruchsvollere Typen frei.
const POOLS = {
  analysis: [
    { min: 1, gen: genGrundrechnen }, { min: 1, gen: genEinfacherWert },
    { min: 2, gen: genFunktionswert }, { min: 2, gen: genNullstelleLinear },
    { min: 2, gen: genIntegralKonzept }, { min: 2, gen: genAnalysisKonzept },
    { min: 3, gen: genSteigung }, { min: 3, gen: genAbleitung },
    { min: 3, gen: genSinusKonzept }, { min: 3, gen: genSymmetrie },
    { min: 4, gen: genNullstellenQuadrat }, { min: 4, gen: genScheitelStelle },
    { min: 4, gen: genQuadratWert }, { min: 5, gen: genExpWert },
    { min: 5, gen: genIntegralLinear }, { min: 5, gen: genGrenzwert },
    { min: 6, gen: genAbleitungPolynom }, { min: 7, gen: genIntegralQuadrat },
  ],
  geometrie: [
    { min: 1, gen: genSkalarprodukt }, { min: 1, gen: genGeoKonzept },
    { min: 2, gen: genBetrag }, { min: 2, gen: genMittelpunkt },
    { min: 3, gen: genSkalarprodukt3D }, { min: 3, gen: genGeradenpunkt },
    { min: 4, gen: genBetrag3D }, { min: 4, gen: genOrthogonalMC },
  ],
  stochastik: [
    { min: 1, gen: genWkeit }, { min: 1, gen: genErwartungswert },
    { min: 1, gen: genLaplace }, { min: 1, gen: genStochKonzept },
    { min: 2, gen: genGegenWk }, { min: 3, gen: genUndWk },
    { min: 3, gen: genBinomialKonzept }, { min: 4, gen: genFakultaet },
    { min: 5, gen: genBinomKoeff },
  ],
};

// =============================================================================
// DAS FACHMODUL  — Implementierung der generischen Schnittstelle
// =============================================================================
export const matheModul = {
  id: 'mathe', name: 'Mathematik', icon: '🧮', farbe: '#ff8a3d',
  implementiert: true,
  startNiveau: 1,

  themen() {
    return [
      { id: 'analysis', name: 'Analysis' },
      { id: 'geometrie', name: 'Analytische Geometrie' },
      { id: 'stochastik', name: 'Stochastik' },
    ];
  },

  // Aktuelles Niveau eines Themas (gerundetes Meisterungslevel, zentrale Kurve).
  niveauFuer(state, themaId) {
    return niveauVon(state.meisterung, themaId, this.startNiveau);
  },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.analysis;
    const erlaubt = pool.filter((e) => e.min <= niveau);
    const eintrag = wahl(erlaubt.length ? erlaubt : pool);
    return eintrag.gen(niveau);
  },

  prüfeAntwort(aufgabe, antwort) {
    let korrekt = false;
    if (aufgabe.typ === 'mc') {
      korrekt = Number(antwort) === aufgabe.richtigeOption;
    } else {
      const z = parseZahl(antwort);
      korrekt = Number.isFinite(z) && Math.abs(z - aufgabe.loesung) <= (aufgabe.toleranz ?? 0.001);
    }
    // erhalteneXP = Basis-Belohnung; den Serien-Bonus rechnet der Spielkern dazu.
    return {
      korrekt,
      erhalteneXP: korrekt ? basisBelohnung(aufgabe.niveau || 1) : 0,
      feedback: (korrekt ? '' : 'Leider falsch. ') + (aufgabe.hinweis || ''),
    };
  },

  // Adaptive Schwierigkeit (zentrale Progression: leichter Start, linear steigend).
  niveauAnpassen(state, themaId, korrekt) {
    if (!state.meisterung) state.meisterung = {};
    passeNiveauAn(state.meisterung, themaId, korrekt, this.startNiveau);
  },

  // Zauber eines Themas (für Zauberbuch/Auswahl). Ohne themaId: alle.
  listeZauber(themaId) {
    return ZAUBER_LISTE.filter((z) => !themaId || z.themaId === themaId);
  },
  alleZauber() { return ZAUBER_LISTE; },
  zauberAn(id) { return ZAUBER[id] || null; },
  paramsFuer,
  upgradeKosten(zauber, schluessel, stufe) {
    const up = zauber.upgrades.find((u) => u.schluessel === schluessel);
    return up ? kostenFuer(zauber.tier || 1, up, stufe) : 0;
  },

  // Live-Vorschau der Zielfelder (ohne zu ernten) + Visual-Beschreibung.
  berechneVorschau(zauber, params) {
    return berechneErnteForm(zauber, params);
  },

  // Wirkt einen Zauber auf das Spielfeld. Nutzt die gemeinsame Form-/Erntemechanik.
  //   params: { a, b, c, bereichMin, bereichMax, theta, now }
  // Rückgabe: { geerntet:[{feld,pflanze}], ziele:[{gx,gy}], visual:{...} }
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

export default matheModul;
