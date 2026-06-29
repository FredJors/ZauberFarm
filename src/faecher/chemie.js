// =============================================================================
// chemie.js — Vollständiges Fach Chemie (zweite echte FachModul-Implementierung)
// -----------------------------------------------------------------------------
// Belegt, dass ein neues Fach allein durch eine FachModul-Implementierung
// entsteht — ohne Eingriff in den Kern. Chemie bringt eine NEUE Zauberform mit:
//   "Splash"-Zauber werfen eine reaktive Kugel an eine Stelle und ernten eine
//   ganze KREISFLÄCHE (statt einer Kurve wie in Mathe). Mechanik & Rendering
//   teilen sich beide Fächer über core/ernte.js (berechneErnteForm) und welt.js.
//
// Inhaltlich an der Oberstufen-Chemie orientiert: Atombau, Stöchiometrie/
// Reaktionsgleichungen, Säuren & Basen (pH).
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
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function neueAufgabe(daten) { return { id: `chem_${++aufgabenZaehler}`, ...daten }; }

// =============================================================================
// CHEMIE-DATEN (datengetrieben, leicht erweiterbar)
// =============================================================================
const ATOMMASSE = { H: 1, C: 12, N: 14, O: 16, Na: 23, S: 32, Cl: 35.5, K: 39, Ca: 40 };

const VERBINDUNGEN = [
  { formel: 'H₂O',   teile: { H: 2, O: 1 } },
  { formel: 'CO₂',   teile: { C: 1, O: 2 } },
  { formel: 'NaCl',  teile: { Na: 1, Cl: 1 } },
  { formel: 'CH₄',   teile: { C: 1, H: 4 } },
  { formel: 'NH₃',   teile: { N: 1, H: 3 } },
  { formel: 'O₂',    teile: { O: 2 } },
  { formel: 'H₂SO₄', teile: { H: 2, S: 1, O: 4 } },
  { formel: 'CaCO₃', teile: { Ca: 1, C: 1, O: 3 } },
];
const masse = (teile) => Object.entries(teile).reduce((s, [el, k]) => s + ATOMMASSE[el] * k, 0);
const atomzahl = (teile) => Object.values(teile).reduce((s, k) => s + k, 0);

// Kleine Elementtabelle (Symbol, Name, Ordnungszahl) für Grundlagen-Aufgaben.
const ELEMENTE = [
  { sym: 'H', name: 'Wasserstoff', z: 1 }, { sym: 'He', name: 'Helium', z: 2 },
  { sym: 'C', name: 'Kohlenstoff', z: 6 }, { sym: 'N', name: 'Stickstoff', z: 7 },
  { sym: 'O', name: 'Sauerstoff', z: 8 }, { sym: 'Na', name: 'Natrium', z: 11 },
  { sym: 'Cl', name: 'Chlor', z: 17 }, { sym: 'Ca', name: 'Calcium', z: 20 },
  { sym: 'Fe', name: 'Eisen', z: 26 }, { sym: 'Au', name: 'Gold', z: 79 },
];

// Ausgeglichene Reaktionsgleichungen mit EINEM versteckten Koeffizienten.
const GLEICHUNGEN = [
  { text: '__ H₂ + O₂ → 2 H₂O',            loesung: 2 },
  { text: '2 H₂ + __ O₂ → 2 H₂O',          loesung: 1 },
  { text: 'C + __ O₂ → CO₂',               loesung: 1 },
  { text: 'N₂ + __ H₂ → 2 NH₃',            loesung: 3 },
  { text: '2 Na + Cl₂ → __ NaCl',          loesung: 2 },
  { text: 'CH₄ + __ O₂ → CO₂ + 2 H₂O',     loesung: 2 },
  { text: '2 C₂H₆ + __ O₂ → 4 CO₂ + 6 H₂O', loesung: 7 },
];

// =============================================================================
// AUFGABEN-GENERATOREN — drei Themen, leicht → schwer
// =============================================================================

// ---- Atombau & Grundlagen (sehr leichter Einstieg) --------------------------
function genTeilchen(n) {
  const teilchen = wahl([
    { name: 'Proton', ladung: '+1' }, { name: 'Elektron', ladung: '−1' }, { name: 'Neutron', ladung: '0' },
  ]);
  const optionen = shuffle(['+1', '−1', '0']);
  return neueAufgabe({
    themaId: 'aufbau', typ: 'mc', niveau: n,
    frage: `Welche elektrische Ladung trägt ein ${teilchen.name}?`,
    optionen, richtigeOption: optionen.indexOf(teilchen.ladung),
    hinweis: `Ein ${teilchen.name} trägt die Ladung ${teilchen.ladung}.`,
  });
}
function genAtomzahl(n) {
  const v = wahl(VERBINDUNGEN.filter((x) => atomzahl(x.teile) > 1));
  return neueAufgabe({
    themaId: 'aufbau', typ: 'numerisch', niveau: n,
    frage: `Aus wie vielen Atomen besteht ein Molekül ${v.formel}?`,
    loesung: atomzahl(v.teile), toleranz: 0.001,
    hinweis: `${v.formel} enthält ${Object.entries(v.teile).map(([e, k]) => `${k}×${e}`).join(' + ')} = ${atomzahl(v.teile)} Atome.`,
  });
}

// ---- Stöchiometrie / Reaktionsgleichungen -----------------------------------
function genKoeffizient(n) {
  const g = wahl(GLEICHUNGEN);
  return neueAufgabe({
    themaId: 'stoechiometrie', typ: 'numerisch', niveau: n,
    frage: `Gleiche die Reaktion aus — welcher Koeffizient gehört in die Lücke?\n${g.text}`,
    loesung: g.loesung, toleranz: 0.001,
    hinweis: `Es müssen links und rechts gleich viele Atome jeder Sorte stehen ⇒ ${g.loesung}.`,
  });
}
function genMolareMasse(n) {
  const v = wahl(VERBINDUNGEN);
  return neueAufgabe({
    themaId: 'stoechiometrie', typ: 'numerisch', niveau: n,
    frage: `Berechne die molare Masse M von ${v.formel} in g/mol. (H=1, C=12, N=14, O=16, Na=23, S=32, Cl=35,5, Ca=40)`,
    loesung: masse(v.teile), toleranz: 0.6,
    hinweis: `M(${v.formel}) = ${Object.entries(v.teile).map(([e, k]) => `${k}·${ATOMMASSE[e]}`).join(' + ')} = ${masse(v.teile)} g/mol.`,
  });
}
function genStoffmenge(n) {
  const v = wahl(VERBINDUNGEN);
  const M = masse(v.teile);
  const nMol = rndInt(1, 3 + n); // Vielfaches → glatte Masse
  const m = +(nMol * M).toFixed(1);
  return neueAufgabe({
    themaId: 'stoechiometrie', typ: 'numerisch', niveau: n,
    frage: `Wie viel Stoffmenge n (in mol) sind ${m} g ${v.formel}? (M = ${M} g/mol)`,
    loesung: m / M, toleranz: 0.05,
    hinweis: `n = m / M = ${m} / ${M} = ${(m / M).toFixed(2)} mol.`,
  });
}

// ---- Säuren & Basen ---------------------------------------------------------
function genSaeureBaseMC(n) {
  const stoff = wahl([
    { name: 'HCl (Salzsäure)', art: 'Säure' }, { name: 'NaOH (Natronlauge)', art: 'Base' },
    { name: 'H₂SO₄ (Schwefelsäure)', art: 'Säure' }, { name: 'NH₃ (Ammoniak)', art: 'Base' },
  ]);
  const optionen = shuffle(['Säure', 'Base', 'neutral']);
  return neueAufgabe({
    themaId: 'saeurebase', typ: 'mc', niveau: n,
    frage: `Ist ${stoff.name} eine Säure oder eine Base?`,
    optionen, richtigeOption: optionen.indexOf(stoff.art),
    hinweis: `${stoff.name} reagiert als ${stoff.art}.`,
  });
}
function genPH(n) {
  const k = rndInt(1, Math.min(6, 1 + n)); // pH = k, c = 10^-k
  const c = `1·10⁻${k}`;
  return neueAufgabe({
    themaId: 'saeurebase', typ: 'numerisch', niveau: n,
    frage: `Eine Säure hat die H₃O⁺-Konzentration c = ${c} mol/L. Wie groß ist der pH-Wert? (pH = −log₁₀ c)`,
    loesung: k, toleranz: 0.05,
    hinweis: `pH = −log₁₀(10⁻${k}) = ${k}.`,
  });
}
function genNeutralisation(n) {
  // c·V (Säure, einprotonig) = c·V (Base) → gesuchtes Volumen Base
  const cS = wahl([0.1, 0.2, 0.5]), vS = rndInt(10, 40), cB = wahl([0.1, 0.2, 0.5]);
  const vB = (cS * vS) / cB;
  return neueAufgabe({
    themaId: 'saeurebase', typ: 'numerisch', niveau: n,
    frage: `${vS} mL Salzsäure (c = ${String(cS).replace('.', ',')} mol/L) werden mit Natronlauge (c = ${String(cB).replace('.', ',')} mol/L) neutralisiert. Welches Volumen (mL) Lauge braucht man?`,
    loesung: vB, toleranz: 0.2,
    hinweis: `n(Säure) = n(Base) ⇒ c_S·V_S = c_B·V_B ⇒ V_B = (${cS}·${vS})/${cB} = ${vB} mL.`,
  });
}

// ---- weitere Grundlagen- & Aufbau-Aufgaben ----------------------------------
function genElementSymbol(n) {
  const e = wahl(ELEMENTE);
  const falsche = shuffle(ELEMENTE.filter((x) => x.sym !== e.sym)).slice(0, 3).map((x) => x.sym);
  const optionen = shuffle([e.sym, ...falsche]);
  return neueAufgabe({
    themaId: 'aufbau', typ: 'mc', niveau: n,
    frage: `Welches Elementsymbol gehört zu ${e.name}?`,
    optionen, richtigeOption: optionen.indexOf(e.sym),
    hinweis: `${e.name} hat das Symbol ${e.sym}.`,
  });
}
function genOrdnungszahl(n) {
  const e = wahl(ELEMENTE.filter((x) => x.z <= 20));
  return neueAufgabe({
    themaId: 'aufbau', typ: 'numerisch', niveau: n,
    frage: `Wie viele Protonen hat ein Atom von ${e.name} (${e.sym})? (Ordnungszahl)`,
    loesung: e.z, toleranz: 0.001,
    hinweis: `Die Ordnungszahl von ${e.name} ist ${e.z} — so viele Protonen.`,
  });
}

// ---- weitere Stöchiometrie-Aufgaben -----------------------------------------
function genMassenanteil(n) {
  const v = wahl(VERBINDUNGEN.filter((x) => atomzahl(x.teile) > 1));
  const el = wahl(Object.keys(v.teile));
  const anteil = (ATOMMASSE[el] * v.teile[el]) / masse(v.teile) * 100;
  return neueAufgabe({
    themaId: 'stoechiometrie', typ: 'numerisch', niveau: n,
    frage: `Wie groß ist der Massenanteil von ${el} in ${v.formel} (in %)? (H=1, C=12, N=14, O=16, Na=23, S=32, Cl=35,5, Ca=40)`,
    loesung: anteil, toleranz: 1,
    hinweis: `w(${el}) = (${v.teile[el]}·${ATOMMASSE[el]}) / ${masse(v.teile)} = ${anteil.toFixed(1)} %.`,
  });
}

// ---- weitere Säure/Base-Aufgaben --------------------------------------------
function genPOH(n) {
  const pH = rndInt(1, 6);
  return neueAufgabe({
    themaId: 'saeurebase', typ: 'numerisch', niveau: n,
    frage: `Eine Lösung hat den pH-Wert ${pH}. Wie groß ist der pOH-Wert? (pH + pOH = 14)`,
    loesung: 14 - pH, toleranz: 0.05,
    hinweis: `pOH = 14 − pH = 14 − ${pH} = ${14 - pH}.`,
  });
}
function genIndikatorMC(n) {
  const fall = wahl([
    { milieu: 'einer Säure', farbe: 'rot' },
    { milieu: 'einer Lauge (Base)', farbe: 'blau' },
    { milieu: 'einer neutralen Lösung', farbe: 'grün' },
  ]);
  const optionen = shuffle(['rot', 'grün', 'blau']);
  return neueAufgabe({
    themaId: 'saeurebase', typ: 'mc', niveau: n,
    frage: `Welche Farbe zeigt Universalindikator in ${fall.milieu}?`,
    optionen, richtigeOption: optionen.indexOf(fall.farbe),
    hinweis: `In ${fall.milieu} färbt sich Universalindikator ${fall.farbe}.`,
  });
}

// ---- Konzept-Banken: viele unterschiedliche MC-Fragen je Thema --------------
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({
    themaId, typ: 'mc', niveau: n,
    frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '',
  });
}
const AUFBAU_BANK = [
  { q: 'Wie heißt ein elektrisch geladenes Atom?', r: 'Ion', f: ['Isotop', 'Molekül', 'Element'], h: 'Durch Abgabe/Aufnahme von Elektronen entsteht ein Ion.' },
  { q: 'Woraus besteht der Atomkern?', r: 'Protonen und Neutronen', f: ['nur Elektronen', 'Protonen und Elektronen', 'nur Neutronen'], h: 'Die Elektronen umkreisen den Kern in der Hülle.' },
  { q: 'Was sind Isotope?', r: 'Atome mit gleicher Protonen-, aber anderer Neutronenzahl', f: ['geladene Atome', 'Atome mit gleicher Masse', 'chemische Verbindungen'], h: 'Isotope unterscheiden sich nur in der Neutronenzahl.' },
  { q: 'Welche Elektronen sind für chemische Reaktionen entscheidend?', r: 'die Außenelektronen (Valenzelektronen)', f: ['die Kernelektronen', 'die Neutronen', 'die Protonen'], h: 'Die äußerste Schale bestimmt die Reaktivität.' },
  { q: 'Was gibt die Ordnungszahl eines Elements an?', r: 'die Anzahl der Protonen', f: ['die Anzahl der Neutronen', 'die Atommasse', 'die Anzahl der Moleküle'], h: 'Ordnungszahl = Protonenzahl = Kernladungszahl.' },
];
const SAEURE_BANK = [
  { q: 'Welche Ionen geben Säuren in Wasser ab?', r: 'H⁺ bzw. H₃O⁺ (Oxonium)', f: ['OH⁻', 'Na⁺', 'Cl⁻'], h: 'Säuren sind Protonendonatoren.' },
  { q: 'Welche Ionen sind typisch für Laugen (Basen)?', r: 'OH⁻ (Hydroxid)', f: ['H⁺', 'H₃O⁺', 'CO₂'], h: 'Basen liefern Hydroxid-Ionen.' },
  { q: 'Welchen pH-Wert hat eine neutrale Lösung?', r: '7', f: ['0', '14', '1'], h: 'pH 7 ist neutral, < 7 sauer, > 7 basisch.' },
  { q: 'Was entsteht bei einer Neutralisation von Säure und Lauge?', r: 'Salz und Wasser', f: ['nur ein Gas', 'ein Metall', 'eine stärkere Säure'], h: 'H⁺ + OH⁻ → H₂O, dazu das Salz.' },
  { q: 'Je kleiner der pH-Wert, desto …', r: 'saurer die Lösung', f: ['basischer die Lösung', 'neutraler die Lösung', 'wärmer die Lösung'], h: 'Kleiner pH = hohe H₃O⁺-Konzentration = sauer.' },
];
function genAufbauKonzept(n) { return mcBank('aufbau', n, AUFBAU_BANK); }
function genSaeureKonzept(n) { return mcBank('saeurebase', n, SAEURE_BANK); }

const POOLS = {
  aufbau: [
    { min: 1, gen: genTeilchen }, { min: 1, gen: genAtomzahl },
    { min: 1, gen: genElementSymbol }, { min: 1, gen: genAufbauKonzept },
    { min: 2, gen: genOrdnungszahl },
  ],
  stoechiometrie: [
    { min: 1, gen: genKoeffizient }, { min: 3, gen: genMolareMasse },
    { min: 4, gen: genMassenanteil }, { min: 5, gen: genStoffmenge },
  ],
  saeurebase: [
    { min: 1, gen: genSaeureBaseMC }, { min: 1, gen: genIndikatorMC },
    { min: 1, gen: genSaeureKonzept }, { min: 2, gen: genPH },
    { min: 3, gen: genPOH }, { min: 5, gen: genNeutralisation },
  ],
};

// =============================================================================
// SPLASH-ZAUBER-KATALOG  (form: 'splash' → Kreisflächen-Ernte)
// =============================================================================
// Upgrades: Wurfweite (Reichweite des Mittelpunkts) und Splash-Radius (Fläche).
const UP_REICHWEITE = { name: 'Wurfweite (Reichweite)', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Splash-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };

export const ZAUBER = {
  saeure_splash: {
    id: 'saeure_splash', name: 'Säure-Splash', themaId: 'saeurebase', icon: '💧',
    form: 'splash', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Wirf eine Säurekugel — erntet eine kleine Kreisfläche nah am Bauern (per Upgrade größer).',
    basis: { reichweite: 2, radius: 1.0 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  basen_schwall: {
    id: 'basen_schwall', name: 'Basen-Schwall', themaId: 'saeurebase', icon: '🌊',
    form: 'splash', tier: 2, freischalt: { wissen: 130, niveau: 2 },
    beschreibung: 'Eine Laugenwelle mit größerem Splash-Radius.',
    basis: { reichweite: 4, radius: 2.0 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  faellung: {
    id: 'faellung', name: 'Fällungs-Streuung', themaId: 'stoechiometrie', icon: '🧂',
    form: 'splash', tier: 3, freischalt: { wissen: 280, niveau: 3 },
    beschreibung: 'Ein ausfallendes Salz bedeckt eine breite Fläche.',
    basis: { reichweite: 4, radius: 2.4 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  reaktions_explosion: {
    id: 'reaktions_explosion', name: 'Reaktions-Explosion', themaId: 'stoechiometrie', icon: '💥',
    form: 'splash', tier: 5, freischalt: { wissen: 540, niveau: 5 },
    beschreibung: 'Eine exotherme Explosion — großer Radius, hohe Reichweite.',
    basis: { reichweite: 5, radius: 3.0 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
};

export const ZAUBER_LISTE = Object.values(ZAUBER);

// Effektive Parameter aus den Upgrade-Stufen (Reichweite + Radius).
function paramsFuer(zauber, stufen = {}) {
  const b = zauber.basis;
  const p = { reichweite: b.reichweite, radius: b.radius };
  for (const up of zauber.upgrades || []) {
    const s = stufen[up.schluessel] || 0;
    p[up.schluessel] = b[up.schluessel] + s * up.step;
  }
  return p;
}

// =============================================================================
// DAS FACHMODUL
// =============================================================================
export const chemieModul = {
  id: 'chemie', name: 'Chemie', icon: '🧪', farbe: '#6fbf73',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Splash-Zauber werfen reaktive Kugeln und ernten Kreisflächen; Aufgaben zu Atombau, Stöchiometrie und Säuren/Basen.',

  themen() {
    return [
      { id: 'aufbau', name: 'Atombau' },
      { id: 'stoechiometrie', name: 'Stöchiometrie' },
      { id: 'saeurebase', name: 'Säuren & Basen' },
    ];
  },

  niveauFuer(state, themaId) {
    return niveauVon(state.meisterung, themaId, this.startNiveau);
  },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.aufbau;
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

  // Splash-Zauber teilen sich die Form-/Ernte-Pipeline mit Mathe.
  berechneVorschau(zauber, params) {
    return berechneErnteForm(zauber, params);
  },
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

export default chemieModul;
