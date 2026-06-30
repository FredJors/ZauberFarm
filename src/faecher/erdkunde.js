// =============================================================================
// erdkunde.js — Vollständiges Fach Erdkunde (Physisch, Human, Topographie)
// -----------------------------------------------------------------------------
// Zauberformen:
//   • Klimakurve     (form 'kurve')  — ein Klimadiagramm-Graph erntet entlang der Kurve.
//   • Monsunregen    (form 'regen')  — Regen fällt auf zufällige Felder im Umkreis.
//   • Erdrutsch      (form 'kegel')  — ein Hang-Kegel rutscht über den Acker (Sektor-Ernte).
//   • Vulkanausbruch (form 'splash') — eine Eruption erntet eine Kreisfläche.
// Aufgaben prozedural (Gradnetz, Hauptstädte) + große MC-Banken (Abitur-Niveau).
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
function neueAufgabe(daten) { return { id: `erd_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — prozedural
// =============================================================================
const GRADNETZ = [
  { frage: 'Bei wie viel Grad nördlicher Breite liegt der Nordpol?', l: 90 },
  { frage: 'Bei wie viel Grad Breite liegt der Äquator?', l: 0 },
  { frage: 'Wie viele Breitengrade liegen zwischen Äquator und Pol?', l: 90 },
  { frage: 'Über wie viele Längengrade erstreckt sich die Erde insgesamt?', l: 360 },
  { frage: 'In wie viele Zeitzonen ist die Erde grob eingeteilt?', l: 24 },
];
function genGradnetz(n) {
  const g = wahl(GRADNETZ);
  return neueAufgabe({
    themaId: 'physisch', typ: 'numerisch', niveau: n,
    frage: g.frage, loesung: g.l, toleranz: 0.001,
    hinweis: `Antwort: ${g.l}.`,
  });
}
function genKontinente(n) {
  return neueAufgabe({
    themaId: 'topographie', typ: 'numerisch', niveau: n,
    frage: 'Wie viele Kontinente gibt es?',
    loesung: 7, toleranz: 0.001,
    hinweis: 'Asien, Afrika, Nordamerika, Südamerika, Antarktika, Europa, Australien/Ozeanien = 7.',
  });
}
const HAUPTSTAEDTE = [
  { land: 'Frankreich', stadt: 'Paris' }, { land: 'Italien', stadt: 'Rom' },
  { land: 'Spanien', stadt: 'Madrid' }, { land: 'Japan', stadt: 'Tokio' },
  { land: 'Russland', stadt: 'Moskau' }, { land: 'Ägypten', stadt: 'Kairo' },
  { land: 'Kanada', stadt: 'Ottawa' }, { land: 'Australien', stadt: 'Canberra' },
  { land: 'Griechenland', stadt: 'Athen' }, { land: 'Norwegen', stadt: 'Oslo' },
];
function genHauptstadt(n) {
  const ziel = wahl(HAUPTSTAEDTE);
  const falsche = shuffle(HAUPTSTAEDTE.filter((h) => h.stadt !== ziel.stadt)).slice(0, 3).map((h) => h.stadt);
  const optionen = shuffle([ziel.stadt, ...falsche]);
  return neueAufgabe({
    themaId: 'topographie', typ: 'mc', niveau: n,
    frage: `Wie heißt die Hauptstadt von ${ziel.land}?`,
    optionen, richtigeOption: optionen.indexOf(ziel.stadt),
    hinweis: `Die Hauptstadt von ${ziel.land} ist ${ziel.stadt}.`,
  });
}

// ---- Konzept-Banken ---------------------------------------------------------
const PHYSISCH_BANK = [
  { q: 'Wie heißt die äußerste, feste Schicht der Erde?', r: 'die Erdkruste', f: ['der Erdkern', 'der Erdmantel', 'die Atmosphäre'], h: 'Darunter folgen Erdmantel und Erdkern.' },
  { q: 'Womit misst man die Stärke eines Erdbebens?', r: 'mit der Richterskala', f: ['mit der Beaufortskala', 'mit der Mohshärte', 'in Grad Celsius'], h: 'Die Beaufortskala misst Windstärke.' },
  { q: 'Was entsteht, wo zwei ozeanische Platten auseinanderdriften?', r: 'neue ozeanische Kruste (Mittelozeanischer Rücken)', f: ['ein Hochgebirge', 'eine Wüste', 'ein Gletscher'], h: 'Aufsteigendes Magma bildet neue Kruste.' },
  { q: 'Welche Klimazone liegt rund um den Äquator?', r: 'die Tropen', f: ['die Polarzone', 'die gemäßigte Zone', 'die Subpolarzone'], h: 'Am Äquator: ganzjährig warm und feucht.' },
  { q: 'Wie heißt der ständige Kreislauf aus Verdunstung, Niederschlag und Abfluss?', r: 'der Wasserkreislauf', f: ['der Kohlenstoffkreislauf', 'die Gezeiten', 'der Treibhauseffekt'], h: 'Wasser verdunstet, kondensiert, regnet ab und fließt zurück.' },
  { q: 'Wie nennt man die Auffaltung von Gebirgen an Plattengrenzen?', r: 'Gebirgsbildung (Orogenese)', f: ['Erosion', 'Sedimentation', 'Verwitterung'], h: 'Kollidierende Platten falten die Kruste auf.' },
  { q: 'Was beschreibt der Treibhauseffekt?', r: 'Erwärmung durch Gase, die Wärmestrahlung zurückhalten', f: ['die Abkühlung der Pole', 'die Bewegung der Platten', 'die Gezeiten durch den Mond'], h: 'CO₂ und Methan verstärken den Effekt.' },
  { q: 'Wie heißt die Lufthülle der Erde?', r: 'die Atmosphäre', f: ['die Hydrosphäre', 'die Lithosphäre', 'die Biosphäre'], h: 'Hydrosphäre = Wasser, Lithosphäre = Gestein.' },
  { q: 'Was ist Erosion?', r: 'der Abtrag von Gestein/Boden durch Wasser, Wind oder Eis', f: ['die Auffaltung von Gebirgen', 'der Ausstoß von Lava', 'die Entstehung von Wolken'], h: 'Fließendes Wasser, Wind und Gletscher tragen Material ab.' },
  { q: 'Welche Klimazone herrscht an den Polen?', r: 'die polare (kalte) Zone', f: ['die Tropen', 'die Subtropen', 'die gemäßigte Zone'], h: 'Sehr kalt, mit Polartag und Polarnacht.' },
];
const HUMAN_BANK = [
  { q: 'Was zählt zum PRIMÄREN Wirtschaftssektor?', r: 'Landwirtschaft und Rohstoffgewinnung', f: ['Industrie und Handwerk', 'Dienstleistungen', 'Forschung und IT'], h: 'Primär = Urproduktion, sekundär = Industrie, tertiär = Dienstleistung.' },
  { q: 'Was zählt zum TERTIÄREN Sektor?', r: 'Dienstleistungen (Handel, Banken)', f: ['Bergbau', 'Fischerei', 'Fabrikproduktion'], h: 'Tertiär = Dienstleistungssektor.' },
  { q: 'Was bezeichnet „Verstädterung" (Urbanisierung)?', r: 'die Zunahme der Stadtbevölkerung', f: ['die Abwanderung aus Städten', 'den Bau von Autobahnen', 'die Schrumpfung der Erde'], h: 'Immer mehr Menschen leben in Städten.' },
  { q: 'Welches Land hat aktuell die meisten Einwohner?', r: 'Indien', f: ['China', 'USA', 'Indonesien'], h: 'Indien hat China bei der Bevölkerung überholt.' },
  { q: 'Wie nennt man eine Stadt mit über 10 Millionen Einwohnern?', r: 'Megastadt (Megacity)', f: ['Metropole', 'Hauptstadt', 'Provinzstadt'], h: 'Ab 10 Mio. Einwohnern spricht man von einer Megastadt.' },
  { q: 'Was beschreibt der Begriff „Migration"?', r: 'die Wanderung von Menschen über Grenzen/Räume', f: ['die Wanderung von Zugvögeln', 'den Anbau von Getreide', 'den Handel mit Rohstoffen'], h: 'Zuwanderung (Immigration) und Abwanderung (Emigration).' },
  { q: 'Wodurch unterscheidet man Industrie- und Entwicklungsländer u. a.?', r: 'am Pro-Kopf-Einkommen und Lebensstandard', f: ['allein an der Fläche', 'allein an der Sprache', 'an der Himmelsrichtung'], h: 'Indikatoren: BIP/Kopf, Bildung, Lebenserwartung (HDI).' },
  { q: 'Was zählt zum SEKUNDÄREN Wirtschaftssektor?', r: 'Industrie und Handwerk', f: ['Landwirtschaft', 'Dienstleistungen', 'Fischerei'], h: 'Sekundär = Verarbeitung und Produktion.' },
  { q: 'Wie nennt man die Abwanderung vom Land in die Stadt?', r: 'Landflucht', f: ['Suburbanisierung', 'Auswanderung ins Ausland', 'Tourismus'], h: 'Menschen ziehen für Arbeit und Bildung in die Städte.' },
  { q: 'Was misst der HDI (Human Development Index)?', r: 'den Entwicklungsstand (Einkommen, Bildung, Lebenserwartung)', f: ['nur das Einkommen', 'nur die Fläche', 'nur die Einwohnerzahl'], h: 'Kombinierter Wohlstands- und Entwicklungsindikator.' },
];
const TOPO_BANK = [
  { q: 'Welcher ist der größte Ozean der Erde?', r: 'der Pazifik', f: ['der Atlantik', 'der Indische Ozean', 'das Mittelmeer'], h: 'Der Pazifik ist der größte und tiefste Ozean.' },
  { q: 'Welcher ist der größte Kontinent?', r: 'Asien', f: ['Afrika', 'Nordamerika', 'Europa'], h: 'Asien ist nach Fläche und Bevölkerung der größte Kontinent.' },
  { q: 'Welches ist das höchste Gebirge der Erde?', r: 'der Himalaya', f: ['die Alpen', 'die Anden', 'die Rocky Mountains'], h: 'Im Himalaya liegt der Mount Everest (8849 m).' },
  { q: 'Auf welchem Kontinent liegt Ägypten?', r: 'Afrika', f: ['Asien', 'Europa', 'Südamerika'], h: 'Ägypten liegt im Nordosten Afrikas.' },
  { q: 'Welcher Kontinent ist am dünnsten besiedelt?', r: 'die Antarktis', f: ['Europa', 'Asien', 'Afrika'], h: 'Die Antarktis hat keine ständige Bevölkerung.' },
  { q: 'Welcher Fluss fließt durch Ägypten?', r: 'der Nil', f: ['der Amazonas', 'die Donau', 'der Mississippi'], h: 'Der Nil ist einer der längsten Flüsse der Erde.' },
  { q: 'Durch welche Länder verläuft die Donau u. a.?', r: 'Deutschland, Österreich, Ungarn', f: ['Spanien, Portugal', 'Norwegen, Schweden', 'Ägypten, Sudan'], h: 'Die Donau mündet ins Schwarze Meer.' },
  { q: 'Was ist die Hauptstadt von Frankreich?', r: 'Paris', f: ['Lyon', 'Marseille', 'Madrid'], h: 'Paris liegt an der Seine.' },
  { q: 'Welcher Kontinent liegt vollständig auf der Südhalbkugel?', r: 'die Antarktis', f: ['Europa', 'Asien', 'Nordamerika'], h: 'Die Antarktis liegt am Südpol.' },
  { q: 'Welches Gebirge gilt als Ostgrenze Europas?', r: 'der Ural', f: ['die Alpen', 'die Pyrenäen', 'der Apennin'], h: 'Das Uralgebirge trennt Europa von Asien.' },
];
function genPhysischKonzept(n) { return mcBank('physisch', n, PHYSISCH_BANK); }
function genHumanKonzept(n) { return mcBank('human', n, HUMAN_BANK); }
function genTopoKonzept(n) { return mcBank('topographie', n, TOPO_BANK); }

const POOLS = {
  physisch: [
    { min: 1, gen: genPhysischKonzept }, { min: 2, gen: genGradnetz },
  ],
  human: [
    { min: 1, gen: genHumanKonzept },
  ],
  topographie: [
    { min: 1, gen: genTopoKonzept }, { min: 1, gen: genHauptstadt },
    { min: 2, gen: genKontinente },
  ],
};

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_BEREICH_BEIDE = { name: 'Reichweite (beidseitig)', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_AMPLITUDE = { name: 'Amplitude (a)', schluessel: 'a', step: 0.4, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_FREQUENZ = { name: 'Frequenz (b)', schluessel: 'b', step: 0.25, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_TROPFEN = { name: 'Regentropfen (Anzahl)', schluessel: 'anzahl', step: 2, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REGEN_RADIUS = { name: 'Regen-Umkreis', schluessel: 'radius', step: 1, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_KEGEL_LAENGE = { name: 'Hang-Länge (Reichweite)', schluessel: 'reichweite', step: 1, max: 8, kosten: (s) => 18 * (s + 1) };
const UP_OEFFNUNG = { name: 'Hang-Breite (Öffnungswinkel)', schluessel: 'oeffnung', step: 0.2, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_REICHWEITE = { name: 'Wurfweite (Reichweite)', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Krater-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };

export const ZAUBER = {
  klimakurve: {
    id: 'klimakurve', name: 'Klimakurve', themaId: 'physisch', icon: '🌡️',
    form: 'kurve', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Eine kurze Klimadiagramm-Kurve f(x) = a·sin(b·x) erntet entlang des Jahresgangs (per Upgrade weiter).',
    basis: { a: 1.4, b: 0.9, c: 0, bereichMin: -2, bereichMax: 2 },
    upgrades: [UP_BEREICH_BEIDE, UP_AMPLITUDE, UP_FREQUENZ],
    f: (p) => (x) => p.a * Math.sin(p.b * x) + p.c,
  },
  monsunregen: {
    id: 'monsunregen', name: 'Monsunregen', themaId: 'human', icon: '🌧️',
    form: 'regen', tier: 3, freischalt: { wissen: 230, niveau: 3 }, symbol: '💧',
    beschreibung: 'Monsunregen fällt auf zufällige Felder im Umkreis. Anfangs 3 Felder im Umkreis 3 — beides aufwertbar.',
    basis: { anzahl: 3, radius: 3 },
    upgrades: [UP_TROPFEN, UP_REGEN_RADIUS],
  },
  vulkanausbruch: {
    id: 'vulkanausbruch', name: 'Vulkanausbruch', themaId: 'physisch', icon: '🌋',
    form: 'splash', tier: 3, freischalt: { wissen: 250, niveau: 3 },
    beschreibung: 'Eine Eruption schleudert Lava über eine Kreisfläche und erntet sie.',
    basis: { reichweite: 4, radius: 2.4 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  erdrutsch: {
    id: 'erdrutsch', name: 'Erdrutsch', themaId: 'topographie', icon: '⛰️',
    form: 'kegel', tier: 4, freischalt: { wissen: 400, niveau: 4 },
    beschreibung: 'Ein abrutschender Hang legt sich als Kegel über den Acker und erntet den Sektor.',
    basis: { reichweite: 5, oeffnung: 0.9 },
    upgrades: [UP_KEGEL_LAENGE, UP_OEFFNUNG],
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
export const erdkundeModul = {
  id: 'erdkunde', name: 'Erdkunde', icon: '🌍', farbe: '#5aa86b',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Klimakurve, Monsunregen, Vulkanausbruch & Erdrutsch (Kegel); Aufgaben zu physischer, Human- und Topographie-Geographie.',

  themen() {
    return [
      { id: 'physisch', name: 'Physische Geographie' },
      { id: 'human', name: 'Humangeographie' },
      { id: 'topographie', name: 'Topographie' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.physisch;
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
  // Kegel laufen über die gemeinsame deterministische Pipeline.
  berechneVorschau(zauber, params) { return formVorschau(zauber, params); },
  wirkeZauber(zauber, params, spielfeld) { return wirkeMitForm(zauber, params, spielfeld); },
};

export default erdkundeModul;
