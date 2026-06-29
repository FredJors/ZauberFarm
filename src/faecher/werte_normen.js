// =============================================================================
// werte_normen.js — Vollständiges Fach Werte und Normen (Logik, Ethik, Philosophie)
// -----------------------------------------------------------------------------
// NEUE Zauberform: "Waage" — zwei Waagschalen wägen ein Dilemma ab und ernten
// beide Seiten. Dazu: Schlusskette (kleiner Treppen-Pfad als Starter), Meinungs-
// regen (Regen) und Diskurswelle (Kurve).
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
  return parseFloat(s);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function neueAufgabe(daten) { return { id: `wn_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — prozeduraler Syllogismus (gültiger Schluss)
// =============================================================================
const SYLLOGISMEN = [
  { ober: 'Alle Menschen sind sterblich', unter: 'Sokrates ist ein Mensch', schluss: 'Sokrates ist sterblich' },
  { ober: 'Alle Vögel können fliegen', unter: 'Ein Spatz ist ein Vogel', schluss: 'Ein Spatz kann fliegen' },
  { ober: 'Alle Quadrate haben vier Ecken', unter: 'Diese Figur ist ein Quadrat', schluss: 'Diese Figur hat vier Ecken' },
];
function genSyllogismus(n) {
  const s = wahl(SYLLOGISMEN);
  const falsche = shuffle(SYLLOGISMEN.filter((x) => x.schluss !== s.schluss)).slice(0, 2).map((x) => x.schluss);
  const optionen = shuffle([s.schluss, ...falsche, 'Es folgt nichts Sicheres']);
  return neueAufgabe({
    themaId: 'logik', typ: 'mc', niveau: n,
    frage: `Logischer Schluss — was folgt zwingend?\n1) ${s.ober}.\n2) ${s.unter}.`,
    optionen, richtigeOption: optionen.indexOf(s.schluss),
    hinweis: `Aus Ober- und Untersatz folgt: ${s.schluss}.`,
  });
}

// ---- Konzept-Banken ---------------------------------------------------------
const LOGIK_BANK = [
  { q: 'Was ist eine Prämisse?', r: 'eine Voraussetzung/Annahme eines Arguments', f: ['die Schlussfolgerung', 'ein Gegenbeispiel', 'ein Widerspruch'], h: 'Aus Prämissen wird die Konklusion gezogen.' },
  { q: 'Was ist die Konklusion?', r: 'die Schlussfolgerung eines Arguments', f: ['die Voraussetzung', 'der Oberbegriff', 'die Definition'], h: 'Sie folgt aus den Prämissen.' },
  { q: 'Wann ist ein logischer Schluss gültig?', r: 'wenn die Konklusion zwingend aus den Prämissen folgt', f: ['wenn er sich gut anhört', 'wenn viele zustimmen', 'wenn er neu ist'], h: 'Gültigkeit betrifft die Form, nicht den Inhalt.' },
  { q: 'Wie nennt man einen logischen Fehlschluss?', r: 'Trugschluss (Fehlschluss)', f: ['Syllogismus', 'Axiom', 'Beweis'], h: 'Scheinbar gültig, tatsächlich fehlerhaft.' },
  { q: 'Was ist ein Widerspruch?', r: 'eine Aussage und ihre Verneinung zugleich zu behaupten', f: ['zwei gleiche Aussagen', 'eine Frage', 'eine Definition'], h: 'A und Nicht-A können nicht beide wahr sein.' },
  { q: 'Was bedeutet „objektiv"?', r: 'sachlich, unabhängig von persönlichen Meinungen', f: ['rein gefühlsmäßig', 'immer falsch', 'nur eine Vermutung'], h: 'Gegenteil: subjektiv.' },
  { q: 'Was ist ein Argument?', r: 'eine Begründung aus Prämissen für eine These', f: ['eine bloße Behauptung', 'ein Streit', 'eine Beleidigung'], h: 'These + Begründung + ggf. Beleg.' },
];
const ETHIK_BANK = [
  { q: 'Womit beschäftigt sich die Ethik?', r: 'mit dem moralisch richtigen Handeln', f: ['mit der Entstehung des Universums', 'mit Grammatik', 'mit Zahlen'], h: 'Ethik ist die Theorie der Moral.' },
  { q: 'Worin unterscheiden sich Werte und Normen?', r: 'Werte sind Leitvorstellungen, Normen konkrete Handlungsregeln', f: ['sie sind dasselbe', 'Normen sind Gefühle', 'Werte sind Gesetze'], h: 'Aus Werten leiten sich Normen ab.' },
  { q: 'Was besagt der Utilitarismus?', r: 'richtig ist, was den größten Nutzen für möglichst viele bringt', f: ['richtig ist, was Gott befiehlt', 'richtig ist, was der Stärkere will', 'richtig ist, was Tradition ist'], h: 'Folgenethik (Bentham, Mill).' },
  { q: 'Was fordert Kants kategorischer Imperativ (vereinfacht)?', r: 'handle so, dass deine Maxime allgemeines Gesetz werden könnte', f: ['handle immer zu deinem Vorteil', 'tue, was andere tun', 'vermeide jede Anstrengung'], h: 'Pflichtethik: das Prinzip muss verallgemeinerbar sein.' },
  { q: 'Was bedeutet Verantwortung?', r: 'für die Folgen des eigenen Handelns einstehen', f: ['Schuld immer abzustreiten', 'Entscheidungen anderen zu überlassen', 'nichts zu tun'], h: 'Antwort geben für sein Tun.' },
  { q: 'Was meint „Toleranz"?', r: 'andere Überzeugungen achten und gelten lassen', f: ['alle Meinungen verbieten', 'nur die eigene Meinung zählt', 'Gleichgültigkeit gegenüber allem'], h: 'Grenze: die Würde und Rechte anderer.' },
  { q: 'Was ist die Grundidee der Gerechtigkeit?', r: 'jedem das ihm Zustehende geben / faire Behandlung', f: ['der Stärkere bekommt alles', 'Zufall entscheidet', 'jeder für sich'], h: 'Z. B. Gleichheit vor dem Gesetz.' },
  { q: 'Was ist ein moralisches Dilemma?', r: 'eine Lage, in der zwei Pflichten miteinander kollidieren', f: ['eine einfache Wahl', 'ein Rechenfehler', 'ein Naturgesetz'], h: 'Jede Option verletzt eine Pflicht.' },
];
const PHILOSOPHEN_BANK = [
  { q: 'Wer war der Lehrer von Platon?', r: 'Sokrates', f: ['Aristoteles', 'Kant', 'Descartes'], h: 'Sokrates → Platon → Aristoteles.' },
  { q: 'Wer formulierte den „kategorischen Imperativ"?', r: 'Immanuel Kant', f: ['Platon', 'Jeremy Bentham', 'Friedrich Nietzsche'], h: 'Aufklärungsphilosoph aus Königsberg.' },
  { q: 'Von wem stammt „Ich denke, also bin ich" (Cogito ergo sum)?', r: 'René Descartes', f: ['Sokrates', 'Kant', 'Sartre'], h: 'Ausgangspunkt seiner Erkenntnistheorie.' },
  { q: 'Wer war ein Schüler Platons und Lehrer Alexanders des Großen?', r: 'Aristoteles', f: ['Sokrates', 'Pythagoras', 'Epikur'], h: 'Begründer u. a. der Logik.' },
  { q: 'Wer prägte den Satz „Der Mensch ist zur Freiheit verurteilt"?', r: 'Jean-Paul Sartre', f: ['Kant', 'Platon', 'Descartes'], h: 'Existenzialismus.' },
  { q: 'Was bedeutet das Wort „Philosophie" wörtlich?', r: 'Liebe zur Weisheit', f: ['Wissen über Götter', 'Lehre vom Staat', 'Kunst der Rede'], h: 'Aus dem Griechischen: philia + sophia.' },
  { q: 'Wer gilt als Mitbegründer des Utilitarismus?', r: 'Jeremy Bentham', f: ['Immanuel Kant', 'Platon', 'Thomas von Aquin'], h: 'Zusammen mit John Stuart Mill.' },
];
function genLogikKonzept(n) { return mcBank('logik', n, LOGIK_BANK); }
function genEthikKonzept(n) { return mcBank('ethik', n, ETHIK_BANK); }
function genPhilosophenKonzept(n) { return mcBank('philosophen', n, PHILOSOPHEN_BANK); }

const POOLS = {
  logik: [
    { min: 1, gen: genLogikKonzept }, { min: 2, gen: genSyllogismus },
  ],
  ethik: [
    { min: 1, gen: genEthikKonzept },
  ],
  philosophen: [
    { min: 1, gen: genPhilosophenKonzept },
  ],
};

// =============================================================================
// PFAD-GENERATOR — Schlusskette als Treppe (schrittweises Folgern)
// =============================================================================
function treppePunkte(stufen) {
  const pts = [{ x: 0, y: 0 }];
  let x = 0, y = 0;
  for (let i = 0; i < stufen; i++) {
    x += 1; pts.push({ x, y });
    y += 1; pts.push({ x, y });
  }
  return pts;
}

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_STUFEN = { name: 'Schritte der Kette', schluessel: 'stufen', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_ABSTAND = { name: 'Abstand der Schalen', schluessel: 'abstand', step: 1, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_SCHALEN = { name: 'Schalengröße', schluessel: 'groesse', step: 0.5, max: 5, kosten: (s) => 20 * (s + 1) };
const UP_TROPFEN = { name: 'Meinungs-Tropfen (Anzahl)', schluessel: 'anzahl', step: 2, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REGEN_RADIUS = { name: 'Regen-Umkreis', schluessel: 'radius', step: 1, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_BEREICH_BEIDE = { name: 'Reichweite (beidseitig)', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_AMPLITUDE = { name: 'Amplitude (a)', schluessel: 'a', step: 0.4, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_FREQUENZ = { name: 'Frequenz (b)', schluessel: 'b', step: 0.25, max: 6, kosten: (s) => 20 * (s + 1) };

export const ZAUBER = {
  schlusskette: {
    id: 'schlusskette', name: 'Schlusskette', themaId: 'logik', icon: '🪜',
    form: 'pfad', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Eine Argumentationskette steigt Schritt für Schritt als Treppe über den Acker (per Upgrade länger).',
    basis: { stufen: 2 },
    upgrades: [UP_STUFEN],
    pfad: (p) => treppePunkte(Math.max(1, Math.round(p.stufen))),
  },
  dilemma: {
    id: 'dilemma', name: 'Dilemma-Waage', themaId: 'ethik', icon: '⚖️',
    form: 'waage', tier: 3, freischalt: { wissen: 230, niveau: 3 },
    beschreibung: 'Zwei Waagschalen wägen ein Dilemma ab und ernten beide Seiten gleichzeitig.',
    basis: { abstand: 3, groesse: 1 },
    upgrades: [UP_ABSTAND, UP_SCHALEN],
  },
  meinungsregen: {
    id: 'meinungsregen', name: 'Meinungsregen', themaId: 'ethik', icon: '💭',
    form: 'regen', tier: 3, freischalt: { wissen: 240, niveau: 3 }, symbol: '💭',
    beschreibung: 'Verschiedene Meinungen regnen auf zufällige Felder im Umkreis. Anfangs 3 im Umkreis 3 — beides aufwertbar.',
    basis: { anzahl: 3, radius: 3 },
    upgrades: [UP_TROPFEN, UP_REGEN_RADIUS],
  },
  diskurswelle: {
    id: 'diskurswelle', name: 'Diskurswelle', themaId: 'philosophen', icon: '〰️',
    form: 'kurve', tier: 4, freischalt: { wissen: 380, niveau: 4 },
    beschreibung: 'These und Antithese wogen als Welle f(x) = a·sin(b·x) über den Acker.',
    basis: { a: 2, b: 1, c: 0, bereichMin: -6, bereichMax: 6 },
    upgrades: [UP_BEREICH_BEIDE, UP_AMPLITUDE, UP_FREQUENZ],
    f: (p) => (x) => p.a * Math.sin(p.b * x) + p.c,
  },
};

export const ZAUBER_LISTE = Object.values(ZAUBER);

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
export const werteNormenModul = {
  id: 'werte_normen', name: 'Werte und Normen', icon: '🤔', farbe: '#8f7cc8',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Schlusskette, Dilemma-Waage, Meinungsregen & Diskurswelle; Aufgaben zu Logik, Ethik und Philosophiegeschichte.',

  themen() {
    return [
      { id: 'logik', name: 'Logik & Argumentation' },
      { id: 'ethik', name: 'Ethik & Moral' },
      { id: 'philosophen', name: 'Philosophie & Denker' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.logik;
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

  berechneVorschau(zauber, params) { return formVorschau(zauber, params); },
  wirkeZauber(zauber, params, spielfeld) { return wirkeMitForm(zauber, params, spielfeld); },
};

export default werteNormenModul;
