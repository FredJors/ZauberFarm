// =============================================================================
// musik.js — Vollständiges Fach Musik (Notenlehre, Theorie, Musikgeschichte)
// -----------------------------------------------------------------------------
// Zauberformen:
//   • Notentanz   (form 'noten')  — tanzende Noten hüpfen zufällig über den Acker
//                                   (Frosch-Mechanik, Noten-Optik) und ernten.
//   • Notenregen  (form 'regen')  — es regnet Noten auf zufällige Felder im Umkreis.
//   • Melodiewelle(form 'kurve')  — eine Melodie als sinusförmiger Graph (Klavierrolle).
//   • Akkordschlag(form 'splash') — ein voller Akkord erntet eine Kreisfläche.
// Aufgaben prozedural + große MC-Banken (Abitur-Niveau).
// =============================================================================

import { wirkeMitForm, formVorschau } from './zauberformen.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

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
function neueAufgabe(daten) { return { id: `mus_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — Notenlehre (prozedural)
// =============================================================================
function genTaktSchlaege(n) {
  const z = wahl([2, 3, 4, 6]);
  return neueAufgabe({
    themaId: 'noten', typ: 'numerisch', niveau: n,
    frage: `Wie viele Viertelnoten passen in einen ${z}/4-Takt?`,
    loesung: z, toleranz: 0.001,
    hinweis: `Der Nenner 4 bedeutet „Viertel", der Zähler ${z} die Anzahl ⇒ ${z} Viertel.`,
  });
}
const NOTENWERTE = [
  { name: 'eine ganze Note', val: 4 }, { name: 'eine halbe Note', val: 2 },
  { name: 'eine Viertelnote', val: 1 }, { name: 'eine punktierte halbe Note', val: 3 },
  { name: 'zwei Achtelnoten', val: 1 },
];
function genNotenwert(n) {
  const w = wahl(NOTENWERTE);
  return neueAufgabe({
    themaId: 'noten', typ: 'numerisch', niveau: n,
    frage: `Wie viele Viertel-Schläge dauert ${w.name}?`,
    loesung: w.val, toleranz: 0.001,
    hinweis: `${w.name} entspricht ${w.val} Viertel-Schlägen.`,
  });
}
function genAchtelImTakt(n) {
  const z = wahl([2, 3, 4]);
  return neueAufgabe({
    themaId: 'noten', typ: 'numerisch', niveau: n,
    frage: `Wie viele Achtelnoten passen in einen ${z}/4-Takt?`,
    loesung: z * 2, toleranz: 0.001,
    hinweis: `Eine Viertel = zwei Achtel ⇒ ${z}·2 = ${z * 2} Achtel.`,
  });
}

// =============================================================================
// AUFGABEN — Theorie (prozedural)
// =============================================================================
const INTERVALLE = [
  { name: 'eine Oktave', ht: 12 }, { name: 'eine reine Quinte', ht: 7 },
  { name: 'eine reine Quarte', ht: 5 }, { name: 'eine große Terz', ht: 4 },
  { name: 'eine kleine Terz', ht: 3 }, { name: 'ein Ganzton (große Sekunde)', ht: 2 },
  { name: 'ein Halbtonschritt', ht: 1 },
];
function genHalbtoene(n) {
  const iv = wahl(INTERVALLE);
  return neueAufgabe({
    themaId: 'theorie', typ: 'numerisch', niveau: n,
    frage: `Aus wie vielen Halbtonschritten besteht ${iv.name}?`,
    loesung: iv.ht, toleranz: 0.001,
    hinweis: `${iv.name} umfasst ${iv.ht} Halbtonschritte.`,
  });
}

// ---- Konzept-Banken ---------------------------------------------------------
const NOTEN_BANK = [
  { q: 'Welche Stammtöne gibt es in der Musik?', r: 'C D E F G A H', f: ['A B C D E F G H', 'do re mi fa', 'C D E F G A B C'], h: 'Im Deutschen: C, D, E, F, G, A, H (statt B).' },
  { q: 'Welcher Notenschlüssel wird für hohe Töne (z. B. Geige) verwendet?', r: 'Violinschlüssel (G-Schlüssel)', f: ['Bassschlüssel (F-Schlüssel)', 'Bratschenschlüssel (C-Schlüssel)', 'Schlagzeugschlüssel'], h: 'Der Violinschlüssel umkreist die Linie des Tons g.' },
  { q: 'Welcher Schlüssel wird für tiefe Töne (z. B. Kontrabass) genutzt?', r: 'Bassschlüssel (F-Schlüssel)', f: ['Violinschlüssel', 'C-Schlüssel', 'Tenorschlüssel'], h: 'Der Bassschlüssel markiert die Linie des Tons f.' },
  { q: 'Was zeigt ein Punkt RECHTS neben einer Note an?', r: 'die Note dauert die Hälfte länger', f: ['die Note wird kürzer', 'die Note wird lauter', 'eine Pause'], h: 'Punktierung: + die Hälfte des Notenwerts.' },
  { q: 'Was bedeutet das Symbol „𝄽" (Viertelpause)?', r: 'eine Pause von einem Viertel', f: ['eine besonders laute Stelle', 'ein Wiederholungszeichen', 'einen Akkord'], h: 'Pausen sind Stille mit fester Dauer.' },
  { q: 'Wie heißt die längste der üblichen Noten?', r: 'die ganze Note', f: ['die Viertelnote', 'die Achtelnote', 'die Sechzehntelnote'], h: 'Ganze (4) > Halbe (2) > Viertel (1) > Achtel (½).' },
];
const THEORIE_BANK = [
  { q: 'Welche Töne bilden den C-Dur-Dreiklang?', r: 'C – E – G', f: ['C – F – G', 'D – F – A', 'C – E – A'], h: 'Dur-Dreiklang: Grundton, große Terz, Quinte.' },
  { q: 'Wie viele Vorzeichen hat die Tonart C-Dur?', r: 'keine', f: ['eines (Fis)', 'zwei', 'drei'], h: 'C-Dur nutzt nur die weißen Tasten.' },
  { q: 'Was bewirkt ein Kreuz (♯) vor einer Note?', r: 'es erhöht den Ton um einen Halbton', f: ['es erniedrigt den Ton um einen Halbton', 'es verdoppelt die Dauer', 'es macht den Ton leiser'], h: 'Aus c wird cis.' },
  { q: 'Was bewirkt ein b (♭) vor einer Note?', r: 'es erniedrigt den Ton um einen Halbton', f: ['es erhöht um einen Halbton', 'es verkürzt die Note', 'es ist eine Pause'], h: 'Aus h wird b, aus e wird es.' },
  { q: 'Welche Tonart hat (wie C-Dur) keine Vorzeichen, klingt aber „moll"?', r: 'a-Moll', f: ['d-Moll', 'e-Moll', 'g-Moll'], h: 'a-Moll ist die Paralleltonart von C-Dur.' },
  { q: 'Welches Intervall liegt zwischen C und G?', r: 'eine Quinte', f: ['eine Quarte', 'eine Terz', 'eine Oktave'], h: 'C–G sind 7 Halbtöne = reine Quinte.' },
  { q: 'Dur-Tonarten klingen im Vergleich zu Moll meist eher …', r: 'hell und fröhlich', f: ['immer leiser', 'immer schneller', 'dunkel und traurig'], h: 'Der Unterschied liegt in der Terz (groß vs. klein).' },
  { q: 'Wie nennt man den Abstand zwischen zwei Tönen?', r: 'Intervall', f: ['Akkord', 'Takt', 'Tonart'], h: 'z. B. Terz, Quarte, Quinte, Oktave.' },
];
const EPOCHEN_BANK = [
  { q: 'Aus welcher Epoche stammt Johann Sebastian Bach?', r: 'Barock', f: ['Klassik', 'Romantik', 'Moderne'], h: 'Bach (1685–1750) ist ein Hauptmeister des Barock.' },
  { q: 'Wer komponierte die 9. Sinfonie mit der „Ode an die Freude"?', r: 'Ludwig van Beethoven', f: ['Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Frédéric Chopin'], h: 'Beethoven steht am Übergang von Klassik zu Romantik.' },
  { q: 'Welcher Komponist gilt als Wunderkind der Wiener Klassik?', r: 'Wolfgang Amadeus Mozart', f: ['Richard Wagner', 'Claude Debussy', 'Johannes Brahms'], h: 'Mozart (1756–1791) komponierte schon als Kind.' },
  { q: 'Zu welcher Instrumentenfamilie gehört die Geige?', r: 'Streichinstrumente', f: ['Blasinstrumente', 'Schlaginstrumente', 'Tasteninstrumente'], h: 'Geige, Bratsche, Cello, Kontrabass = Streicher.' },
  { q: 'Zu welcher Familie gehört die Trompete?', r: 'Blechblasinstrumente', f: ['Holzblasinstrumente', 'Streichinstrumente', 'Schlaginstrumente'], h: 'Trompete, Posaune, Horn, Tuba = Blechbläser.' },
  { q: 'Wie nennt man ein großes mehrsätziges Orchesterwerk?', r: 'Sinfonie', f: ['Etüde', 'Arie', 'Präludium'], h: 'Meist viersätzig (z. B. bei Haydn, Beethoven).' },
  { q: 'Aus welcher Epoche stammt Frédéric Chopin?', r: 'Romantik', f: ['Barock', 'Klassik', 'Renaissance'], h: 'Chopin (1810–1849) ist ein Romantiker am Klavier.' },
  { q: 'Was ist eine Oper?', r: 'ein durchkomponiertes Bühnenwerk mit Gesang', f: ['ein Tanz ohne Musik', 'ein reines Orchesterstück', 'ein Volkslied'], h: 'Oper verbindet Musik, Gesang und Theater.' },
];
function genNotenKonzept(n) { return mcBank('noten', n, NOTEN_BANK); }
function genTheorieKonzept(n) { return mcBank('theorie', n, THEORIE_BANK); }
function genEpochenKonzept(n) { return mcBank('epochen', n, EPOCHEN_BANK); }

const POOLS = {
  noten: [
    { min: 1, gen: genNotenKonzept }, { min: 1, gen: genTaktSchlaege },
    { min: 2, gen: genNotenwert }, { min: 3, gen: genAchtelImTakt },
  ],
  theorie: [
    { min: 1, gen: genTheorieKonzept }, { min: 3, gen: genHalbtoene },
  ],
  epochen: [
    { min: 1, gen: genEpochenKonzept },
  ],
};

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_NOTEN = { name: 'Noten (Anzahl)', schluessel: 'anzahl', step: 1, max: 5, kosten: (s) => 28 * (s + 1) };
const UP_SPRUENGE = { name: 'Sprünge je Note (Felder)', schluessel: 'spruenge', step: 1, max: 8, kosten: (s) => 18 * (s + 1) };
const UP_WEITE = { name: 'Sprungweite', schluessel: 'weite', step: 0.5, max: 5, kosten: (s) => 16 * (s + 1) };
const UP_TROPFEN = { name: 'Noten-Tropfen (Anzahl)', schluessel: 'anzahl', step: 2, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REGEN_RADIUS = { name: 'Regen-Umkreis', schluessel: 'radius', step: 1, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_REICHWEITE = { name: 'Wurfweite (Reichweite)', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Splash-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };
const UP_BEREICH_BEIDE = { name: 'Reichweite (beidseitig)', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_AMPLITUDE = { name: 'Amplitude (a)', schluessel: 'a', step: 0.4, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_FREQUENZ = { name: 'Frequenz (b)', schluessel: 'b', step: 0.25, max: 6, kosten: (s) => 20 * (s + 1) };

export const ZAUBER = {
  notentanz: {
    id: 'notentanz', name: 'Notentanz', themaId: 'noten', icon: '🎵',
    form: 'noten', tier: 1, freischalt: { wissen: 0, niveau: 1 }, symbol: '🎵',
    beschreibung: 'Eine Note tanzt nah um den Bauern und erntet die Landefelder. Upgrades: mehr Noten, mehr Sprünge, weitere Sprünge.',
    basis: { anzahl: 1, spruenge: 2, weite: 1.5 },
    upgrades: [UP_NOTEN, UP_SPRUENGE, UP_WEITE],
  },
  notenregen: {
    id: 'notenregen', name: 'Notenregen', themaId: 'theorie', icon: '🌧️',
    form: 'regen', tier: 3, freischalt: { wissen: 230, niveau: 3 }, symbol: '🎵',
    beschreibung: 'Es regnet Noten auf zufällige Felder im Umkreis. Anfangs 3 Noten im Umkreis 3 — beides aufwertbar.',
    basis: { anzahl: 3, radius: 3 },
    upgrades: [UP_TROPFEN, UP_REGEN_RADIUS],
  },
  melodiewelle: {
    id: 'melodiewelle', name: 'Melodiewelle', themaId: 'epochen', icon: '〰️',
    form: 'kurve', tier: 4, freischalt: { wissen: 380, niveau: 4 },
    beschreibung: 'Eine Melodie f(x) = a·sin(b·x) wogt wie eine Klavierrolle über den Acker.',
    basis: { a: 2, b: 1, c: 0, bereichMin: -6, bereichMax: 6 },
    upgrades: [UP_BEREICH_BEIDE, UP_AMPLITUDE, UP_FREQUENZ],
    f: (p) => (x) => p.a * Math.sin(p.b * x) + p.c,
  },
  akkordschlag: {
    id: 'akkordschlag', name: 'Akkordschlag', themaId: 'theorie', icon: '🎹',
    form: 'splash', tier: 5, freischalt: { wissen: 540, niveau: 5 },
    beschreibung: 'Ein voller Akkord erklingt und erntet eine große Kreisfläche.',
    basis: { reichweite: 5, radius: 2.8 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
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
export const musikModul = {
  id: 'musik', name: 'Musik', icon: '🎵', farbe: '#7c5cff',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Tanzende Noten, Notenregen, Melodiewelle & Akkordschlag; Aufgaben zu Notenlehre, Theorie und Musikgeschichte.',

  themen() {
    return [
      { id: 'noten', name: 'Notenlehre' },
      { id: 'theorie', name: 'Harmonielehre' },
      { id: 'epochen', name: 'Musikgeschichte' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.noten;
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

  // 'noten'/'regen' sind zufällig (stabile Vorschau über zauberformen.js); die
  // übrigen Formen laufen über die gemeinsame deterministische Pipeline.
  berechneVorschau(zauber, params) { return formVorschau(zauber, params); },
  wirkeZauber(zauber, params, spielfeld) { return wirkeMitForm(zauber, params, spielfeld); },
};

export default musikModul;
