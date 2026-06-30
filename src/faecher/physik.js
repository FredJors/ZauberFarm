// =============================================================================
// physik.js — Vollständiges Fach Physik (Mechanik, Elektrik, Quanten/Kerne)
// -----------------------------------------------------------------------------
// Zauberformen:
//   • Wurfparabel  (form 'kurve')  — ein schräger Wurf erntet entlang der Parabel.
//   • Schockwelle  (form 'splash') — eine Explosion erntet eine Kreisfläche.
//   • Lichtkegel   (form 'kegel')  — ein Kegel/Sektor legt sich über den Acker.
//   • Materiewelle (form 'kurve')  — eine sinusförmige Welle (de Broglie / EM).
// Aufgaben prozedural + große MC-Banken (Abitur-Niveau, Oberstufe Niedersachsen).
// =============================================================================

import { berechneErnteForm } from '../core/ernte.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

// --------------------------------------------------------- kleine Helfer
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
const G = 9.81; // Fallbeschleunigung in m/s²
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
function neueAufgabe(daten) { return { id: `phy_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — Mechanik (prozedural, eindeutig berechenbar)
// =============================================================================
function genGeschwindigkeit(n) {
  const s = rndInt(2, 6 + n) * 10, t = rndInt(2, 8);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Ein Körper legt ${s} m in ${t} s zurück. Welche Geschwindigkeit v (in m/s) hat er?`,
    loesung: s / t, toleranz: 0.05,
    hinweis: `v = s / t = ${s} m / ${t} s = ${(s / t).toFixed(2)} m/s.`,
  });
}
function genStrecke(n) {
  const v = rndInt(3, 5 + n), t = rndInt(3, 10);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Ein Auto fährt mit v = ${v} m/s über t = ${t} s. Welche Strecke s (in m) legt es zurück?`,
    loesung: v * t, toleranz: 0.05,
    hinweis: `s = v · t = ${v} · ${t} = ${v * t} m.`,
  });
}
function genKraft(n) {
  const m = rndInt(2, 5 + n), a = rndInt(1, 6);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Welche Kraft F (in N) beschleunigt eine Masse m = ${m} kg mit a = ${a} m/s²?`,
    loesung: m * a, toleranz: 0.05,
    hinweis: `F = m · a = ${m} · ${a} = ${m * a} N (2. Newton'sches Gesetz).`,
  });
}
function genGewichtskraft(n) {
  const m = rndInt(2, 8 + n);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Welche Gewichtskraft F_G (in N) wirkt auf m = ${m} kg? (g = 9,81 m/s²)`,
    loesung: m * G, toleranz: 0.6,
    hinweis: `F_G = m · g = ${m} · 9,81 = ${(m * G).toFixed(1)} N.`,
  });
}
function genFallstrecke(n) {
  const t = rndInt(1, 4);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Wie tief (in m) fällt ein Stein im freien Fall in t = ${t} s? (g = 9,81 m/s²)`,
    loesung: 0.5 * G * t * t, toleranz: 0.6,
    hinweis: `h = ½·g·t² = ½·9,81·${t}² = ${(0.5 * G * t * t).toFixed(1)} m.`,
  });
}
function genFallgeschwindigkeit(n) {
  const t = rndInt(1, 5);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Welche Geschwindigkeit (in m/s) hat ein frei fallender Körper nach t = ${t} s? (g = 9,81 m/s²)`,
    loesung: G * t, toleranz: 0.5,
    hinweis: `v = g · t = 9,81 · ${t} = ${(G * t).toFixed(1)} m/s.`,
  });
}
function genKinEnergie(n) {
  const m = rndInt(1, 4), v = rndInt(2, 6);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Welche kinetische Energie E_kin (in J) hat m = ${m} kg bei v = ${v} m/s?`,
    loesung: 0.5 * m * v * v, toleranz: 0.05,
    hinweis: `E_kin = ½·m·v² = ½·${m}·${v}² = ${0.5 * m * v * v} J.`,
  });
}
function genPotEnergie(n) {
  const m = rndInt(1, 5), h = rndInt(2, 6 + n);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Welche Höhenenergie E_pot (in J) hat m = ${m} kg in h = ${h} m Höhe? (g = 9,81 m/s²)`,
    loesung: m * G * h, toleranz: 0.8,
    hinweis: `E_pot = m·g·h = ${m}·9,81·${h} = ${(m * G * h).toFixed(1)} J.`,
  });
}
function genImpuls(n) {
  const m = rndInt(2, 8), v = rndInt(2, 9);
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Welchen Impuls p (in kg·m/s) hat m = ${m} kg bei v = ${v} m/s?`,
    loesung: m * v, toleranz: 0.05,
    hinweis: `p = m · v = ${m} · ${v} = ${m * v} kg·m/s.`,
  });
}
function genDichte(n) {
  const v = rndInt(2, 6), rho = wahl([2, 5, 8, 10]);
  const m = rho * v;
  return neueAufgabe({
    themaId: 'mechanik', typ: 'numerisch', niveau: n,
    frage: `Ein Körper hat die Masse ${m} kg und das Volumen ${v} dm³. Welche Dichte ρ (in kg/dm³) hat er?`,
    loesung: m / v, toleranz: 0.05,
    hinweis: `ρ = m / V = ${m} / ${v} = ${m / v} kg/dm³.`,
  });
}

// =============================================================================
// AUFGABEN — Elektrik (Ohm'sches Gesetz, Leistung, Ladung)
// =============================================================================
function genOhmU(n) {
  const r = rndInt(2, 10), i = rndInt(1, 5);
  return neueAufgabe({
    themaId: 'elektrik', typ: 'numerisch', niveau: n,
    frage: `Welche Spannung U (in V) fällt über R = ${r} Ω bei I = ${i} A ab?`,
    loesung: r * i, toleranz: 0.05,
    hinweis: `U = R · I = ${r} · ${i} = ${r * i} V (Ohm'sches Gesetz).`,
  });
}
function genOhmI(n) {
  const r = rndInt(2, 10), u = r * rndInt(1, 5);
  return neueAufgabe({
    themaId: 'elektrik', typ: 'numerisch', niveau: n,
    frage: `Welcher Strom I (in A) fließt bei U = ${u} V durch R = ${r} Ω?`,
    loesung: u / r, toleranz: 0.05,
    hinweis: `I = U / R = ${u} / ${r} = ${u / r} A.`,
  });
}
function genLeistung(n) {
  const u = rndInt(4, 12), i = rndInt(1, 5);
  return neueAufgabe({
    themaId: 'elektrik', typ: 'numerisch', niveau: n,
    frage: `Welche elektrische Leistung P (in W) gibt ein Gerät bei U = ${u} V und I = ${i} A ab?`,
    loesung: u * i, toleranz: 0.05,
    hinweis: `P = U · I = ${u} · ${i} = ${u * i} W.`,
  });
}
function genLadung(n) {
  const i = rndInt(1, 6), t = rndInt(2, 10);
  return neueAufgabe({
    themaId: 'elektrik', typ: 'numerisch', niveau: n,
    frage: `Welche Ladung Q (in C) fließt, wenn I = ${i} A für t = ${t} s fließt?`,
    loesung: i * t, toleranz: 0.05,
    hinweis: `Q = I · t = ${i} · ${t} = ${i * t} C.`,
  });
}
function genReihenwiderstand(n) {
  const r1 = rndInt(2, 9), r2 = rndInt(2, 9);
  return neueAufgabe({
    themaId: 'elektrik', typ: 'numerisch', niveau: n,
    frage: `Zwei Widerstände R₁ = ${r1} Ω und R₂ = ${r2} Ω sind in Reihe geschaltet. Wie groß ist der Gesamtwiderstand (in Ω)?`,
    loesung: r1 + r2, toleranz: 0.05,
    hinweis: `In Reihe: R_ges = R₁ + R₂ = ${r1} + ${r2} = ${r1 + r2} Ω.`,
  });
}
function genEnergieElek(n) {
  const p = rndInt(2, 9) * 100, t = rndInt(2, 6);
  return neueAufgabe({
    themaId: 'elektrik', typ: 'numerisch', niveau: n,
    frage: `Ein Gerät mit P = ${p} W läuft t = ${t} s. Welche Energie E (in J) verbraucht es?`,
    loesung: p * t, toleranz: 0.5,
    hinweis: `E = P · t = ${p} · ${t} = ${p * t} J.`,
  });
}

// =============================================================================
// AUFGABEN — Quanten- / Atom- / Kernphysik
// =============================================================================
function genHalbwertszeit(n) {
  const N0 = wahl([800, 1000, 1600, 2400]), k = rndInt(1, Math.min(5, 1 + n));
  return neueAufgabe({
    themaId: 'quanten', typ: 'numerisch', niveau: n,
    frage: `Ein Präparat enthält N₀ = ${N0} Kerne. Wie viele sind nach ${k} Halbwertszeiten noch vorhanden?`,
    loesung: N0 / Math.pow(2, k), toleranz: 0.5,
    hinweis: `N = N₀·(½)^${k} = ${N0}·${(1 / Math.pow(2, k)).toFixed(4)} = ${N0 / Math.pow(2, k)}.`,
  });
}
function genNukleonen(n) {
  const p = rndInt(6, 30), nn = rndInt(6, 36);
  return neueAufgabe({
    themaId: 'quanten', typ: 'numerisch', niveau: n,
    frage: `Ein Atomkern hat ${p} Protonen und ${nn} Neutronen. Wie groß ist seine Massenzahl A?`,
    loesung: p + nn, toleranz: 0.001,
    hinweis: `Massenzahl A = Protonen + Neutronen = ${p} + ${nn} = ${p + nn}.`,
  });
}

// ---- Konzept-Banken ---------------------------------------------------------
const MECHANIK_BANK = [
  { q: 'Welche SI-Einheit hat die Kraft?', r: 'Newton (N)', f: ['Joule (J)', 'Watt (W)', 'Pascal (Pa)'], h: '1 N = 1 kg·m/s².' },
  { q: 'Was besagt das Trägheitsgesetz (1. Newton)?', r: 'Ohne resultierende Kraft bleibt der Bewegungszustand erhalten', f: ['Kraft = Masse · Beschleunigung', 'actio = reactio', 'Energie bleibt erhalten'], h: 'Ein kräftefreier Körper ruht oder bewegt sich gleichförmig.' },
  { q: '„actio = reactio" ist das wievielte Newtonsche Gesetz?', r: '3.', f: ['1.', '2.', '4.'], h: 'Wechselwirkungsgesetz: Kraft und Gegenkraft sind gleich groß, entgegengesetzt.' },
  { q: 'Welche Einheit hat die Energie?', r: 'Joule (J)', f: ['Newton (N)', 'Watt (W)', 'Volt (V)'], h: '1 J = 1 N·m.' },
  { q: 'Was beschreibt die Leistung P?', r: 'Energie pro Zeit', f: ['Kraft pro Fläche', 'Masse pro Volumen', 'Weg pro Zeit'], h: 'P = E / t, Einheit Watt.' },
  { q: 'Eine Bewegung mit konstanter Geschwindigkeit heißt …', r: 'gleichförmig', f: ['gleichmäßig beschleunigt', 'frei fallend', 'ungleichförmig gebremst'], h: 'a = 0 ⇒ v = const.' },
  { q: 'Welche Größe ist ein Vektor?', r: 'die Kraft', f: ['die Masse', 'die Temperatur', 'die Zeit'], h: 'Kräfte haben Betrag UND Richtung.' },
  { q: 'Die kinetische Energie hängt vom Quadrat welcher Größe ab?', r: 'der Geschwindigkeit', f: ['der Masse', 'der Höhe', 'der Zeit'], h: 'E_kin = ½·m·v².' },
  { q: 'Wie lautet das 2. Newtonsche Gesetz?', r: 'F = m · a', f: ['F = m / a', 'E = m · c²', 'p = m · v'], h: 'Kraft = Masse · Beschleunigung.' },
  { q: 'Welche SI-Einheit hat der Druck?', r: 'Pascal (Pa)', f: ['Newton (N)', 'Joule (J)', 'Watt (W)'], h: 'p = F/A, 1 Pa = 1 N/m².' },
];
const ELEKTRIK_BANK = [
  { q: 'Welche Einheit hat die elektrische Spannung?', r: 'Volt (V)', f: ['Ampere (A)', 'Ohm (Ω)', 'Watt (W)'], h: 'Spannung U wird in Volt gemessen.' },
  { q: 'Welche Einheit hat die Stromstärke?', r: 'Ampere (A)', f: ['Volt (V)', 'Coulomb (C)', 'Ohm (Ω)'], h: 'Stromstärke I in Ampere.' },
  { q: 'Wie lautet das Ohmsche Gesetz?', r: 'U = R · I', f: ['P = U / I', 'Q = U · t', 'U = R / I'], h: 'Spannung = Widerstand · Stromstärke.' },
  { q: 'Was passiert mit dem Gesamtwiderstand bei einer Reihenschaltung?', r: 'Die Widerstände addieren sich', f: ['Er wird kleiner als der kleinste', 'Er bleibt gleich', 'Er halbiert sich'], h: 'R_ges = R₁ + R₂ + …' },
  { q: 'Gleichnamige Ladungen …', r: 'stoßen sich ab', f: ['ziehen sich an', 'sind neutral', 'verschmelzen'], h: '+/+ und −/− stoßen sich ab, +/− zieht sich an.' },
  { q: 'Welches Bauteil speichert elektrische Ladung?', r: 'Kondensator', f: ['Widerstand', 'Diode', 'Spule'], h: 'Ein Kondensator speichert Ladung im elektrischen Feld.' },
  { q: 'Wodurch entsteht ein Magnetfeld?', r: 'durch bewegte Ladungen (Strom)', f: ['durch ruhende Ladungen', 'durch Wärme allein', 'durch Licht allein'], h: 'Jeder stromdurchflossene Leiter ist von einem Magnetfeld umgeben.' },
  { q: 'Wie berechnet man die elektrische Leistung?', r: 'P = U · I', f: ['P = U / I', 'P = R · I', 'P = U + I'], h: 'Leistung = Spannung · Stromstärke.' },
  { q: 'Was bewirkt die Parallelschaltung von Widerständen?', r: 'Der Gesamtwiderstand wird kleiner', f: ['Er wird größer', 'Er bleibt gleich', 'Er verdoppelt sich'], h: '1/R_ges = 1/R₁ + 1/R₂ + … → kleiner als der kleinste Einzelwiderstand.' },
  { q: 'Welche Einheit hat der elektrische Widerstand?', r: 'Ohm (Ω)', f: ['Volt (V)', 'Ampere (A)', 'Watt (W)'], h: 'R in Ohm, aus U = R·I.' },
];
const QUANTEN_BANK = [
  { q: 'Was beschreibt der Welle-Teilchen-Dualismus?', r: 'Licht/Materie zeigt je nach Versuch Wellen- ODER Teilcheneigenschaften', f: ['Licht ist nur eine Welle', 'Materie ist nur ein Teilchen', 'Wellen und Teilchen sind dasselbe Objekt immer gleichzeitig sichtbar'], h: 'Z. B. Doppelspalt (Welle) vs. Fotoeffekt (Teilchen).' },
  { q: 'Welcher Effekt belegt den Teilchencharakter des Lichts?', r: 'der Fotoeffekt', f: ['die Beugung', 'die Interferenz', 'die Brechung'], h: 'Einstein erklärte den Fotoeffekt mit Lichtquanten (Photonen).' },
  { q: 'Wovon hängt die Energie eines Photons ab?', r: 'von der Frequenz (E = h·f)', f: ['nur von der Intensität', 'von der Lichtgeschwindigkeit', 'von der Masse des Photons'], h: 'E = h·f, h = Plancksches Wirkungsquantum.' },
  { q: 'Was sendet ein Kern beim α-Zerfall aus?', r: 'einen Heliumkern (2 Protonen, 2 Neutronen)', f: ['ein Elektron', 'ein Photon', 'ein Neutron'], h: 'α-Teilchen = ⁴₂He-Kern.' },
  { q: 'Was wird beim β⁻-Zerfall ausgesendet?', r: 'ein Elektron', f: ['ein Proton', 'ein Heliumkern', 'ein Photon'], h: 'Ein Neutron wandelt sich in Proton + Elektron (+ Antineutrino) um.' },
  { q: 'Nach einer Halbwertszeit ist noch … des Stoffes vorhanden.', r: 'die Hälfte', f: ['ein Viertel', 'alles', 'nichts'], h: 'Nach n Halbwertszeiten: (½)ⁿ.' },
  { q: 'Welches Atommodell beschreibt Elektronen auf festen Bahnen?', r: 'das Bohrsche Atommodell', f: ['das Rutherford-Modell', 'das Orbitalmodell', 'das Dalton-Modell'], h: 'Bohr: diskrete Energieniveaus / Schalen.' },
  { q: 'Was besagt die Heisenbergsche Unschärferelation?', r: 'Ort und Impuls sind nicht beliebig genau gleichzeitig messbar', f: ['Energie ist immer erhalten', 'Licht ist immer eine Welle', 'Elektronen haben keine Masse'], h: 'Δx·Δp ≥ ħ/2.' },
  { q: 'Welche radioaktive Strahlung ist am stärksten durchdringend?', r: 'γ-Strahlung', f: ['α-Strahlung', 'β-Strahlung', 'alle gleich'], h: 'α stoppt Papier, β Aluminium, γ erst dickes Blei.' },
  { q: 'Was ist ein Photon?', r: 'ein Lichtquant (Energieportion des Lichts)', f: ['ein geladenes Teilchen', 'ein Atomkern', 'ein Elektron'], h: 'Licht besteht aus Energiequanten E = h·f.' },
];
function genMechanikKonzept(n) { return mcBank('mechanik', n, MECHANIK_BANK); }
function genElektrikKonzept(n) { return mcBank('elektrik', n, ELEKTRIK_BANK); }
function genQuantenKonzept(n) { return mcBank('quanten', n, QUANTEN_BANK); }

const POOLS = {
  mechanik: [
    { min: 1, gen: genGeschwindigkeit }, { min: 1, gen: genStrecke },
    { min: 1, gen: genMechanikKonzept }, { min: 2, gen: genKraft },
    { min: 2, gen: genGewichtskraft }, { min: 3, gen: genImpuls },
    { min: 3, gen: genDichte }, { min: 4, gen: genFallstrecke },
    { min: 4, gen: genFallgeschwindigkeit }, { min: 5, gen: genKinEnergie },
    { min: 5, gen: genPotEnergie },
  ],
  elektrik: [
    { min: 1, gen: genOhmU }, { min: 1, gen: genElektrikKonzept },
    { min: 2, gen: genOhmI }, { min: 2, gen: genLadung },
    { min: 3, gen: genLeistung }, { min: 4, gen: genReihenwiderstand },
    { min: 5, gen: genEnergieElek },
  ],
  quanten: [
    { min: 1, gen: genQuantenKonzept }, { min: 2, gen: genNukleonen },
    { min: 4, gen: genHalbwertszeit },
  ],
};

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_BEREICH_RECHTS = { name: 'Wurfweite (Reichweite)', schluessel: 'bereich', richtung: 'rechts', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_BEREICH_BEIDE = { name: 'Reichweite (beidseitig)', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_ABWURF = { name: 'Abwurfschwung (b)', schluessel: 'b', step: 0.4, max: 6, kosten: (s) => 15 * (s + 1) };
const UP_AMPLITUDE = { name: 'Amplitude (a)', schluessel: 'a', step: 0.4, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_FREQUENZ = { name: 'Frequenz (b)', schluessel: 'b', step: 0.25, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REICHWEITE = { name: 'Wurfweite (Reichweite)', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Splash-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };
const UP_KEGEL_LAENGE = { name: 'Kegel-Länge (Reichweite)', schluessel: 'reichweite', step: 1, max: 8, kosten: (s) => 18 * (s + 1) };
const UP_OEFFNUNG = { name: 'Öffnungswinkel', schluessel: 'oeffnung', step: 0.2, max: 6, kosten: (s) => 18 * (s + 1) };

export const ZAUBER = {
  wurfparabel: {
    id: 'wurfparabel', name: 'Wurfparabel-Zauber', themaId: 'mechanik', icon: '🏹',
    form: 'kurve', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Ein kurzer schräger Wurf f(x) = b·x − a·x² erntet entlang der Wurfparabel (per Upgrade weiter).',
    basis: { a: 0.4, b: 1.3, c: 0, bereichMin: 0, bereichMax: 3 },
    upgrades: [UP_BEREICH_RECHTS, UP_ABWURF, UP_AMPLITUDE],
    f: (p) => (x) => p.b * x - p.a * x * x,
  },
  schockwelle: {
    id: 'schockwelle', name: 'Schockwellen-Zauber', themaId: 'mechanik', icon: '💥',
    form: 'splash', tier: 3, freischalt: { wissen: 230, niveau: 3 },
    beschreibung: 'Eine Druckwelle dehnt sich kreisförmig aus und erntet die Fläche.',
    basis: { reichweite: 4, radius: 2.0 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  lichtkegel: {
    id: 'lichtkegel', name: 'Lichtkegel-Zauber', themaId: 'elektrik', icon: '🔦',
    form: 'kegel', tier: 4, freischalt: { wissen: 380, niveau: 4 },
    beschreibung: 'Ein Scheinwerfer legt einen leuchtenden Kegel über den Acker und erntet den Sektor.',
    basis: { reichweite: 5, oeffnung: 0.9 },
    upgrades: [UP_KEGEL_LAENGE, UP_OEFFNUNG],
  },
  materiewelle: {
    id: 'materiewelle', name: 'Materiewellen-Zauber', themaId: 'quanten', icon: '〰️',
    form: 'kurve', tier: 5, freischalt: { wissen: 560, niveau: 5 },
    beschreibung: 'Eine Wellenfunktion f(x) = a·sin(b·x) wogt über den Acker.',
    basis: { a: 2, b: 1, c: 0, bereichMin: -6, bereichMax: 6 },
    upgrades: [UP_BEREICH_BEIDE, UP_AMPLITUDE, UP_FREQUENZ],
    f: (p) => (x) => p.a * Math.sin(p.b * x) + p.c,
  },
};

export const ZAUBER_LISTE = Object.values(ZAUBER);

// Effektive Parameter aus den Upgrade-Stufen (Definitionsbereich gesondert).
function paramsFuer(zauber, stufen = {}) {
  const b = zauber.basis;
  const p = { ...b };
  for (const up of zauber.upgrades || []) {
    const s = stufen[up.schluessel] || 0;
    if (up.schluessel === 'bereich') {
      if (up.richtung === 'beide') { p.bereichMin = b.bereichMin - s; p.bereichMax = b.bereichMax + s; }
      else { p.bereichMax = b.bereichMax + s; }
    } else {
      p[up.schluessel] = (b[up.schluessel] ?? 0) + s * up.step;
    }
  }
  return p;
}

// =============================================================================
// DAS FACHMODUL
// =============================================================================
export const physikModul = {
  id: 'physik', name: 'Physik', icon: '⚛️', farbe: '#2ec5c0',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Wurfparabel, Schockwelle, Lichtkegel & Materiewelle; Aufgaben zu Mechanik, Elektrik und Quanten-/Kernphysik.',

  themen() {
    return [
      { id: 'mechanik', name: 'Mechanik' },
      { id: 'elektrik', name: 'Elektrizität & Felder' },
      { id: 'quanten', name: 'Quanten- & Kernphysik' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.mechanik;
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

  // Alle Formen (Kurve, Splash, Kegel) sind deterministisch → gemeinsame Pipeline.
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

export default physikModul;
