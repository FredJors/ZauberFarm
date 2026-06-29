// =============================================================================
// kunst.js — Vollständiges Fach Kunst (Farbenlehre, Kunstgeschichte, Technik)
// -----------------------------------------------------------------------------
// Zauberformen:
//   • Pinselstrich (form 'kurve')  — ein schwungvoller Strich erntet entlang der Kurve.
//   • Farbklecks   (form 'splash') — ein Farbspritzer erntet eine Kreisfläche.
//   • Lissajous    (form 'pfad')   — eine parametrische Figur (sin/cos) malt ein Muster.
//   • Farbregen    (form 'regen')  — Farbtropfen fallen auf zufällige Felder im Umkreis.
// Aufgaben: prozedurale Farbmischungen + große MC-Banken (Abitur-Niveau).
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
  return parseFloat(s);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function neueAufgabe(daten) { return { id: `kun_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — Farbenlehre (prozedural)
// =============================================================================
const MISCHUNGEN = [
  { a: 'Blau', b: 'Gelb', r: 'Grün' },
  { a: 'Rot', b: 'Gelb', r: 'Orange' },
  { a: 'Rot', b: 'Blau', r: 'Violett' },
];
function genFarbmischung(n) {
  const m = wahl(MISCHUNGEN);
  const optionen = shuffle(['Grün', 'Orange', 'Violett', 'Braun']);
  return neueAufgabe({
    themaId: 'farben', typ: 'mc', niveau: n,
    frage: `Welche Sekundärfarbe ergibt sich aus ${m.a} + ${m.b}?`,
    optionen, richtigeOption: optionen.indexOf(m.r),
    hinweis: `${m.a} und ${m.b} mischen sich zu ${m.r}.`,
  });
}
const KOMPLEMENT = [
  { f: 'Rot', k: 'Grün' }, { f: 'Blau', k: 'Orange' }, { f: 'Gelb', k: 'Violett' },
];
function genKomplement(n) {
  const c = wahl(KOMPLEMENT);
  const optionen = shuffle(['Grün', 'Orange', 'Violett', 'Grau']);
  return neueAufgabe({
    themaId: 'farben', typ: 'mc', niveau: n,
    frage: `Welche Farbe ist die Komplementärfarbe von ${c.f}?`,
    optionen, richtigeOption: optionen.indexOf(c.k),
    hinweis: `${c.f} und ${c.k} liegen sich im Farbkreis gegenüber.`,
  });
}
function genPrimaerzahl(n) {
  return neueAufgabe({
    themaId: 'farben', typ: 'numerisch', niveau: n,
    frage: 'Wie viele Primärfarben gibt es in der klassischen (subtraktiven) Farbenlehre?',
    loesung: 3, toleranz: 0.001,
    hinweis: 'Die drei Primärfarben sind Rot, Gelb und Blau.',
  });
}

// ---- Konzept-Banken ---------------------------------------------------------
const FARBEN_BANK = [
  { q: 'Welche drei Farben sind die Primärfarben (subtraktiv)?', r: 'Rot, Gelb, Blau', f: ['Grün, Orange, Violett', 'Schwarz, Weiß, Grau', 'Rot, Grün, Blau'], h: 'Aus ihnen lassen sich (fast) alle anderen Farben mischen.' },
  { q: 'Welche Farben gelten als „warme" Farben?', r: 'Rot, Orange, Gelb', f: ['Blau, Grün, Violett', 'Schwarz und Weiß', 'nur Grautöne'], h: 'Warme Farben erinnern an Feuer/Sonne.' },
  { q: 'Welche Farben gelten als „kalte" Farben?', r: 'Blau, Grün, Violett', f: ['Rot, Orange, Gelb', 'alle Brauntöne', 'nur Weiß'], h: 'Kalte Farben erinnern an Wasser/Eis.' },
  { q: 'Was entsteht, wenn man eine Farbe mit Weiß aufhellt?', r: 'ein Farbton (Tint)', f: ['die Komplementärfarbe', 'eine Primärfarbe', 'immer Grau'], h: 'Aufhellen = Tint, Abdunkeln mit Schwarz = Shade.' },
  { q: 'Wie nennt man die geordnete Anordnung der Farben im Kreis?', r: 'Farbkreis', f: ['Farbskala', 'Palette', 'Spektrum'], h: 'Komplementärfarben liegen sich gegenüber.' },
  { q: 'Welche „Nicht-Farben" (unbunt) gibt es?', r: 'Schwarz, Weiß, Grau', f: ['Rot, Gelb, Blau', 'Gold und Silber', 'Grün und Braun'], h: 'Unbunte Farben haben keinen Buntton.' },
];
const EPOCHEN_BANK = [
  { q: 'Wer malte die „Mona Lisa"?', r: 'Leonardo da Vinci', f: ['Michelangelo', 'Raffael', 'Sandro Botticelli'], h: 'Ein Meisterwerk der Renaissance.' },
  { q: 'Aus welcher Epoche stammt die „Mona Lisa"?', r: 'Renaissance', f: ['Barock', 'Impressionismus', 'Moderne'], h: 'Die Renaissance betonte Perspektive und Anatomie.' },
  { q: 'Welche Stilrichtung begründete Claude Monet mit?', r: 'Impressionismus', f: ['Kubismus', 'Barock', 'Surrealismus'], h: '„Impression, soleil levant" gab der Richtung den Namen.' },
  { q: 'Wer ist ein Mitbegründer des Kubismus?', r: 'Pablo Picasso', f: ['Claude Monet', 'Leonardo da Vinci', 'Albrecht Dürer'], h: 'Picasso und Braque zerlegten Formen in Facetten.' },
  { q: 'Wer ist ein Hauptvertreter der Pop Art?', r: 'Andy Warhol', f: ['Rembrandt', 'Caspar David Friedrich', 'Edvard Munch'], h: 'Warhol nutzte Werbe- und Massenbilder (z. B. Campbell-Dosen).' },
  { q: 'Wer malte „Die Sternennacht"?', r: 'Vincent van Gogh', f: ['Claude Monet', 'Salvador Dalí', 'Henri Matisse'], h: 'Van Gogh, Postimpressionismus.' },
  { q: 'Wer schuf das Deckenfresko der Sixtinischen Kapelle?', r: 'Michelangelo', f: ['Leonardo da Vinci', 'Raffael', 'Tizian'], h: 'Michelangelo, Hochrenaissance.' },
  { q: 'Welcher Künstler malte zerfließende Uhren („Die Beständigkeit der Erinnerung")?', r: 'Salvador Dalí', f: ['Pablo Picasso', 'Claude Monet', 'Wassily Kandinsky'], h: 'Dalí war ein Hauptvertreter des Surrealismus.' },
];
const TECHNIK_BANK = [
  { q: 'Wie nennt man die Darstellung von Tiefe mit einem Fluchtpunkt?', r: 'Zentralperspektive', f: ['Vogelperspektive', 'Farbperspektive', 'Parallelprojektion'], h: 'Linien laufen auf einen Fluchtpunkt am Horizont zu.' },
  { q: 'Wie heißt ein Bild, das eine einzelne Person zeigt?', r: 'Porträt', f: ['Stillleben', 'Landschaft', 'Karikatur'], h: 'Das Porträt stellt einen Menschen dar.' },
  { q: 'Wie nennt man die Darstellung lebloser Gegenstände (Obst, Vasen)?', r: 'Stillleben', f: ['Porträt', 'Landschaft', 'Akt'], h: 'Stillleben zeigt arrangierte Dinge.' },
  { q: 'Welche Maltechnik nutzt wasserlösliche, lasierende Farben?', r: 'Aquarell', f: ['Ölmalerei', 'Fresko', 'Mosaik'], h: 'Aquarellfarben sind transparent und werden mit Wasser verdünnt.' },
  { q: 'Was bezeichnet „Chiaroscuro"?', r: 'starke Hell-Dunkel-Kontraste', f: ['eine Pinselart', 'ein Bildformat', 'eine Farbmischung'], h: 'Licht-Schatten-Malerei (z. B. bei Caravaggio).' },
  { q: 'Welches Verhältnis gilt als besonders harmonische Bildaufteilung?', r: 'der Goldene Schnitt', f: ['die Mittelteilung', 'das Quadrat', 'der rechte Winkel'], h: 'Verhältnis ca. 1 : 1,618.' },
  { q: 'Wie nennt man die Maltechnik mit frischem, feuchtem Kalkputz an Wänden?', r: 'Fresko', f: ['Aquarell', 'Collage', 'Radierung'], h: 'Farbe verbindet sich beim Trocknen mit dem Putz.' },
];
function genFarbenKonzept(n) { return mcBank('farben', n, FARBEN_BANK); }
function genEpochenKonzept(n) { return mcBank('epochen', n, EPOCHEN_BANK); }
function genTechnikKonzept(n) { return mcBank('technik', n, TECHNIK_BANK); }

const POOLS = {
  farben: [
    { min: 1, gen: genFarbenKonzept }, { min: 1, gen: genFarbmischung },
    { min: 1, gen: genPrimaerzahl }, { min: 2, gen: genKomplement },
  ],
  epochen: [
    { min: 1, gen: genEpochenKonzept },
  ],
  technik: [
    { min: 1, gen: genTechnikKonzept },
  ],
};

// =============================================================================
// PFAD-GENERATOR — Lissajous-Figur (parametrische Kurve sin/cos)
// =============================================================================
function lissajousPunkte(groesse) {
  const A = groesse, B = groesse, a = 3, b = 2, delta = Math.PI / 2;
  const pts = [];
  const N = 140;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    pts.push({ x: A * Math.sin(a * t + delta), y: B * Math.sin(b * t) });
  }
  return pts;
}

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_BEREICH_BEIDE = { name: 'Strichlänge (beidseitig)', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_AMPLITUDE = { name: 'Schwung (Amplitude a)', schluessel: 'a', step: 0.4, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_FREQUENZ = { name: 'Wellen (Frequenz b)', schluessel: 'b', step: 0.2, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REICHWEITE = { name: 'Wurfweite (Reichweite)', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Klecks-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };
const UP_GROESSE = { name: 'Figurengröße', schluessel: 'groesse', step: 0.5, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_TROPFEN = { name: 'Farbtropfen (Anzahl)', schluessel: 'anzahl', step: 2, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REGEN_RADIUS = { name: 'Regen-Umkreis', schluessel: 'radius', step: 1, max: 6, kosten: (s) => 18 * (s + 1) };

export const ZAUBER = {
  pinselstrich: {
    id: 'pinselstrich', name: 'Pinselstrich', themaId: 'technik', icon: '🖌️',
    form: 'kurve', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Ein kurzer Strich f(x) = a·sin(b·x) zieht über den Acker und erntet entlang der Kurve (per Upgrade weiter).',
    basis: { a: 1.4, b: 0.9, c: 0, bereichMin: -2, bereichMax: 2 },
    upgrades: [UP_BEREICH_BEIDE, UP_AMPLITUDE, UP_FREQUENZ],
    f: (p) => (x) => p.a * Math.sin(p.b * x) + p.c,
  },
  farbklecks: {
    id: 'farbklecks', name: 'Farbklecks', themaId: 'farben', icon: '🎨',
    form: 'splash', tier: 2, freischalt: { wissen: 120, niveau: 2 },
    beschreibung: 'Ein Farbspritzer trifft eine Kreisfläche und erntet sie.',
    basis: { reichweite: 3, radius: 1.8 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  farbregen: {
    id: 'farbregen', name: 'Farbregen', themaId: 'farben', icon: '🌈',
    form: 'regen', tier: 3, freischalt: { wissen: 240, niveau: 3 }, symbol: '🎨',
    beschreibung: 'Farbtropfen fallen auf zufällige Felder im Umkreis. Anfangs 3 Tropfen im Umkreis 3 — beides aufwertbar.',
    basis: { anzahl: 3, radius: 3 },
    upgrades: [UP_TROPFEN, UP_REGEN_RADIUS],
  },
  lissajous: {
    id: 'lissajous', name: 'Lissajous-Figur', themaId: 'technik', icon: '🌀',
    form: 'pfad', tier: 4, freischalt: { wissen: 380, niveau: 4 },
    beschreibung: 'Eine parametrische sin/cos-Figur malt ein symmetrisches Muster über den Acker.',
    basis: { groesse: 3 },
    upgrades: [UP_GROESSE],
    pfad: (p) => lissajousPunkte(Math.max(1, p.groesse)),
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
export const kunstModul = {
  id: 'kunst', name: 'Kunst', icon: '🎨', farbe: '#e36fae',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Pinselstrich, Farbklecks, Lissajous-Muster & Farbregen; Aufgaben zu Farbenlehre, Kunstgeschichte und Technik.',

  themen() {
    return [
      { id: 'farben', name: 'Farbenlehre' },
      { id: 'epochen', name: 'Kunstgeschichte' },
      { id: 'technik', name: 'Technik & Gattungen' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.farben;
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

  // 'regen' ist zufällig (stabile Vorschau über zauberformen.js); Kurve/Splash/
  // Pfad laufen über die gemeinsame deterministische Pipeline.
  berechneVorschau(zauber, params) { return formVorschau(zauber, params); },
  wirkeZauber(zauber, params, spielfeld) { return wirkeMitForm(zauber, params, spielfeld); },
};

export default kunstModul;
