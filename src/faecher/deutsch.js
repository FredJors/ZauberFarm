// =============================================================================
// deutsch.js — Vollständiges Fach Deutsch (Sprache, Stilmittel, Literatur)
// -----------------------------------------------------------------------------
// Neue Zauberform: "Buchstaben" — Buchstaben hüpfen in Bögen über den Acker und
// ernten die Landefelder (Wortlänge & Sprungweite aufwertbar). Dazu ein Flächen-
// Splash ("Buchstabensalat"). Aufgaben auf Abitur-Niveau (überwiegend MC mit
// großen Frage-Banken für viel Abwechslung).
// =============================================================================

import { berechneErnteForm } from '../core/ernte.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
let aufgabenZaehler = 0;
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function neueAufgabe(daten) { return { id: `de_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN-BANKEN
// =============================================================================
const WORTART_BANK = [
  { q: 'Welche Wortart ist „laufen"?', r: 'Verb', f: ['Nomen', 'Adjektiv', 'Adverb'] },
  { q: 'Welche Wortart ist „Haus"?', r: 'Nomen (Substantiv)', f: ['Verb', 'Adjektiv', 'Pronomen'] },
  { q: 'Welche Wortart ist „schön"?', r: 'Adjektiv', f: ['Verb', 'Nomen', 'Artikel'] },
  { q: 'Welche Wortart ist „und"?', r: 'Konjunktion', f: ['Präposition', 'Adverb', 'Nomen'] },
  { q: 'Welche Wortart ist „auf"?', r: 'Präposition', f: ['Konjunktion', 'Adjektiv', 'Verb'] },
  { q: 'Welche Wortart ist „ich"?', r: 'Pronomen', f: ['Nomen', 'Artikel', 'Adverb'] },
  { q: 'Welche Wortart ist „der"?', r: 'Artikel', f: ['Pronomen', 'Nomen', 'Präposition'] },
  { q: 'Welche Wortart ist „heute"?', r: 'Adverb', f: ['Adjektiv', 'Verb', 'Nomen'] },
];
const RECHTSCHREIB_BANK = [
  { q: 'Welche Schreibweise ist korrekt?', r: 'Rhythmus', f: ['Rytmus', 'Rhytmus', 'Rythmus'] },
  { q: 'Welche Schreibweise ist korrekt?', r: 'Standard', f: ['Standart', 'Standtard', 'Stantard'] },
  { q: 'Welche Schreibweise ist korrekt?', r: 'nämlich', f: ['nähmlich', 'nemlich', 'nämmlich'] },
  { q: 'Welche Schreibweise ist korrekt?', r: 'Aggression', f: ['Agression', 'Aggresion', 'Agresion'] },
  { q: '„Ich freue mich, ___ du kommst." Was ist richtig?', r: 'dass', f: ['das', 'dasss', 'das ß'] },
  { q: '„___ gestern bin ich hier." Was ist richtig?', r: 'Seit', f: ['Seid', 'Sait', 'Seith'] },
  { q: 'Welche Schreibweise ist korrekt?', r: 'Stegreif', f: ['Stehgreif', 'Steegreif', 'Stägreif'] },
  { q: '„Er rannte ___ die Wand." (dagegen)', r: 'wider', f: ['wieder', 'widder', 'wiider'] },
];
const GRAMMATIK_ADV_BANK = [
  { q: 'In welchem Fall steht „dem Mann" in „Ich gebe dem Mann das Buch"?', r: 'Dativ', f: ['Akkusativ', 'Genitiv', 'Nominativ'] },
  { q: 'In welchem Fall steht „des Hauses"?', r: 'Genitiv', f: ['Dativ', 'Akkusativ', 'Nominativ'] },
  { q: 'Welcher Modus liegt vor: „Er sagte, er sei krank."?', r: 'Konjunktiv I', f: ['Konjunktiv II', 'Indikativ', 'Imperativ'] },
  { q: 'Welcher Modus: „Wenn ich reich wäre, …"?', r: 'Konjunktiv II', f: ['Konjunktiv I', 'Indikativ', 'Imperativ'] },
  { q: 'Welche Zeitform ist „ich werde gegangen sein"?', r: 'Futur II', f: ['Futur I', 'Perfekt', 'Plusquamperfekt'] },
  { q: 'Welche Zeitform: „ich hatte gelesen"?', r: 'Plusquamperfekt', f: ['Perfekt', 'Präteritum', 'Futur II'] },
  { q: '„Das Buch wird gelesen." — welche Form?', r: 'Passiv', f: ['Aktiv', 'Konjunktiv', 'Imperativ'] },
  { q: 'Was ist das Subjekt in „Der Hund jagt die Katze"?', r: 'der Hund', f: ['die Katze', 'jagt', 'die'] },
];
const STILMITTEL_BANK = [
  { q: '„Das Leben ist ein Spiel." — welches Stilmittel?', r: 'Metapher', f: ['Vergleich', 'Ironie', 'Hyperbel'] },
  { q: '„stark wie ein Löwe" — welches Stilmittel?', r: 'Vergleich', f: ['Metapher', 'Personifikation', 'Symbol'] },
  { q: '„Der Wind flüstert." — welches Stilmittel?', r: 'Personifikation', f: ['Metapher', 'Hyperbel', 'Ironie'] },
  { q: '„Ich habe dir tausendmal gesagt …" — welches Stilmittel?', r: 'Hyperbel', f: ['Litotes', 'Metapher', 'Ellipse'] },
  { q: '„Milch macht müde Männer munter" — welches Stilmittel?', r: 'Alliteration', f: ['Anapher', 'Assonanz', 'Reim'] },
  { q: '„Alle reden vom Wetter. Alle reden von der Krise." — welches Stilmittel?', r: 'Anapher', f: ['Epipher', 'Alliteration', 'Klimax'] },
  { q: '„Na toll!" (gemeint ist das Gegenteil) — welches Stilmittel?', r: 'Ironie', f: ['Euphemismus', 'Metapher', 'Vergleich'] },
  { q: '„Ist das nicht offensichtlich?" (keine Antwort erwartet) — welches Stilmittel?', r: 'rhetorische Frage', f: ['Ellipse', 'Anapher', 'Metapher'] },
  { q: '„Ich kam, sah, siegte." (Steigerung) — welches Stilmittel?', r: 'Klimax', f: ['Anapher', 'Antithese', 'Ironie'] },
  { q: '„heiße Kälte" (Widerspruch in sich) — welches Stilmittel?', r: 'Oxymoron', f: ['Antithese', 'Paradoxon', 'Metapher'] },
];
const STILMITTEL_ADV_BANK = [
  { q: '„nicht schlecht" (gemeint: sehr gut) — welches Stilmittel?', r: 'Litotes', f: ['Hyperbel', 'Ironie', 'Metapher'] },
  { q: '„Er ist von uns gegangen." (für: gestorben) — welches Stilmittel?', r: 'Euphemismus', f: ['Hyperbel', 'Ironie', 'Metapher'] },
  { q: '„Reich mir mal das Glas." (Glas statt Inhalt) — welches Stilmittel?', r: 'Metonymie', f: ['Synekdoche', 'Metapher', 'Symbol'] },
  { q: '„Pro Kopf zahlt jeder 5 €." (Kopf für Person) — welches Stilmittel?', r: 'Synekdoche', f: ['Metonymie', 'Hyperbel', 'Ellipse'] },
  { q: '„Die Kunst ist lang, kurz ist das Leben." (überkreuzte Wortstellung) — welches Stilmittel?', r: 'Chiasmus', f: ['Parallelismus', 'Anapher', 'Klimax'] },
  { q: '„Wer wagt, gewinnt; wer zögert, verliert." (gleicher Bau) — welches Stilmittel?', r: 'Parallelismus', f: ['Chiasmus', 'Ellipse', 'Antithese'] },
  { q: '„Liebe und Hass, Tag und Nacht" (Gegensätze) — welches Stilmittel?', r: 'Antithese', f: ['Klimax', 'Anapher', 'Metapher'] },
  { q: '„Schneller, höher, weiter!" (Auslassung von Verben) — welches Stilmittel?', r: 'Ellipse', f: ['Klimax', 'Anapher', 'Asyndeton'] },
];
const GATTUNG_BANK = [
  { q: 'Zu welcher literarischen Gattung gehört ein Gedicht?', r: 'Lyrik', f: ['Epik', 'Dramatik', 'Prosa'] },
  { q: 'Zu welcher Gattung gehört ein Roman?', r: 'Epik', f: ['Lyrik', 'Dramatik', 'Rhetorik'] },
  { q: 'Zu welcher Gattung gehört ein Theaterstück?', r: 'Dramatik', f: ['Lyrik', 'Epik', 'Essayistik'] },
  { q: 'Was ist KEINE der drei literarischen Großgattungen?', r: 'Rhetorik', f: ['Lyrik', 'Epik', 'Dramatik'] },
  { q: 'Eine Kurzgeschichte gehört zur …', r: 'Epik', f: ['Lyrik', 'Dramatik', 'Publizistik'] },
];
const EPOCHE_BANK = [
  { q: 'Zu welcher Epoche gehört Goethes „Die Leiden des jungen Werther"?', r: 'Sturm und Drang', f: ['Klassik', 'Romantik', 'Barock'] },
  { q: 'Welche Epoche betont Vernunft und Toleranz?', r: 'Aufklärung', f: ['Romantik', 'Barock', 'Sturm und Drang'] },
  { q: 'Welche Epoche betont Gefühl, Natur und das Unheimliche?', r: 'Romantik', f: ['Aufklärung', 'Realismus', 'Klassik'] },
  { q: '„Carpe diem" und „Memento mori" prägen die Epoche …', r: 'Barock', f: ['Klassik', 'Realismus', 'Moderne'] },
  { q: 'Großstadt, Ich-Zerfall und expressive Sprache kennzeichnen den …', r: 'Expressionismus', f: ['Realismus', 'Biedermeier', 'Aufklärung'] },
  { q: 'Goethe und Schiller in Weimar stehen für die …', r: 'Weimarer Klassik', f: ['Romantik', 'Naturalismus', 'Aufklärung'] },
];
const AUTOR_WERK_BANK = [
  { q: 'Wer schrieb „Faust"?', r: 'Johann Wolfgang von Goethe', f: ['Friedrich Schiller', 'Heinrich Heine', 'Thomas Mann'] },
  { q: 'Wer schrieb „Die Räuber"?', r: 'Friedrich Schiller', f: ['Goethe', 'Lessing', 'Kafka'] },
  { q: 'Wer schrieb „Die Verwandlung"?', r: 'Franz Kafka', f: ['Bertolt Brecht', 'Thomas Mann', 'Hermann Hesse'] },
  { q: 'Wer schrieb „Der Steppenwolf"?', r: 'Hermann Hesse', f: ['Kafka', 'Goethe', 'Brecht'] },
  { q: 'Wer verfasste „Nathan der Weise"?', r: 'Gotthold Ephraim Lessing', f: ['Schiller', 'Goethe', 'Heine'] },
  { q: 'Wer schrieb „Die Buddenbrooks"?', r: 'Thomas Mann', f: ['Hermann Hesse', 'Kafka', 'Schiller'] },
];

function genWortart(n) { return mcBank('grammatik', n, WORTART_BANK); }
function genRechtschreibung(n) { return mcBank('grammatik', n, RECHTSCHREIB_BANK); }
function genGrammatikAdv(n) { return mcBank('grammatik', n, GRAMMATIK_ADV_BANK); }
function genStilmittel(n) { return mcBank('stilmittel', n, STILMITTEL_BANK); }
function genStilmittelAdv(n) { return mcBank('stilmittel', n, STILMITTEL_ADV_BANK); }
function genGattung(n) { return mcBank('literatur', n, GATTUNG_BANK); }
function genEpoche(n) { return mcBank('literatur', n, EPOCHE_BANK); }
function genAutorWerk(n) { return mcBank('literatur', n, AUTOR_WERK_BANK); }

const POOLS = {
  grammatik: [
    { min: 1, gen: genWortart }, { min: 1, gen: genRechtschreibung },
    { min: 4, gen: genGrammatikAdv },
  ],
  stilmittel: [
    { min: 1, gen: genStilmittel }, { min: 4, gen: genStilmittelAdv },
  ],
  literatur: [
    { min: 1, gen: genGattung }, { min: 1, gen: genAutorWerk },
    { min: 2, gen: genEpoche },
  ],
};

// =============================================================================
// ZAUBER-KATALOG  (Buchstaben-Sprünge + Splash)
// =============================================================================
const UP_WORTLAENGE = { name: 'Wortlänge (Buchstaben)', schluessel: 'anzahl', step: 1, max: 8, kosten: (s) => 22 * (s + 1) };
const UP_SPRUNGWEITE = { name: 'Sprungweite', schluessel: 'schrittweite', step: 0.5, max: 4, kosten: (s) => 16 * (s + 1) };
const UP_SCHWUNG = { name: 'Schwung (Bogen)', schluessel: 'amplitude', step: 0.3, max: 5, kosten: (s) => 14 * (s + 1) };
const UP_REICHWEITE = { name: 'Wurfweite', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Splash-Radius', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };

const WOERTER_KURZ = ['ERNTE', 'BLUME', 'ACKER', 'WORT', 'REIM', 'SATZ', 'VERS'];
const WOERTER_LANG = ['BUCHSTABE', 'GEDICHT', 'SPRACHE', 'METAPHER', 'POESIE', 'ROMANTIK'];

export const ZAUBER = {
  wortzauber: {
    id: 'wortzauber', name: 'Wortzauber', themaId: 'grammatik', icon: '📜',
    form: 'buchstaben', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Ein Wort hüpft Buchstabe für Buchstabe über den Acker und erntet die Landefelder.',
    basis: { anzahl: 3, schrittweite: 1, amplitude: 0.6 }, woerter: WOERTER_KURZ,
    upgrades: [UP_WORTLAENGE, UP_SPRUNGWEITE, UP_SCHWUNG],
  },
  buchstabensalat: {
    id: 'buchstabensalat', name: 'Buchstabensalat', themaId: 'stilmittel', icon: '🥗',
    form: 'splash', tier: 3, freischalt: { wissen: 130, niveau: 3 },
    beschreibung: 'Ein Wirbel aus Buchstaben bedeckt eine Kreisfläche und erntet sie.',
    basis: { reichweite: 4, radius: 2.2 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  satzzauber: {
    id: 'satzzauber', name: 'Satzzauber', themaId: 'literatur', icon: '📖',
    form: 'buchstaben', tier: 4, freischalt: { wissen: 300, niveau: 4 },
    beschreibung: 'Ein ganzer Satz springt weit über den Acker — viele Buchstaben, große Reichweite.',
    basis: { anzahl: 6, schrittweite: 1, amplitude: 0.85 }, woerter: WOERTER_LANG,
    upgrades: [UP_WORTLAENGE, UP_SPRUNGWEITE, UP_SCHWUNG],
  },
};

export const ZAUBER_LISTE = Object.values(ZAUBER);

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
export const deutschModul = {
  id: 'deutsch', name: 'Deutsch', icon: '📖', farbe: '#d4774e',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Buchstaben-Zauber hüpfen über den Acker; Aufgaben zu Grammatik, Stilmitteln und Literatur.',

  themen() {
    return [
      { id: 'grammatik', name: 'Sprache & Grammatik' },
      { id: 'stilmittel', name: 'Rhetorische Mittel' },
      { id: 'literatur', name: 'Literatur & Epochen' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.grammatik;
    const erlaubt = pool.filter((e) => e.min <= niveau);
    return wahl(erlaubt.length ? erlaubt : pool).gen(niveau);
  },

  prüfeAntwort(aufgabe, antwort) {
    const korrekt = Number(antwort) === aufgabe.richtigeOption;
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

  // Buchstaben-Zauber: festes Vorschau-Wort (kein Flackern); beim Wirken zufällig.
  berechneVorschau(zauber, params) {
    if (zauber.form === 'buchstaben') params.wort = (zauber.woerter || WOERTER_KURZ)[0];
    return berechneErnteForm(zauber, params);
  },
  wirkeZauber(zauber, params, spielfeld) {
    if (zauber.form === 'buchstaben') params.wort = wahl(zauber.woerter || WOERTER_KURZ);
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

export default deutschModul;
