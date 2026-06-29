// =============================================================================
// englisch.js — Vollständiges Fach Englisch (Grammar, Vocabulary, Literature)
// -----------------------------------------------------------------------------
// Gleiche "Buchstaben"-Zauberform wie Deutsch: Buchstaben hüpfen über den Acker
// und ernten die Landefelder. Aufgaben auf Abitur-Niveau (große MC-Banken:
// Tenses, Prepositions, False Friends, Idioms, literarische Begriffe & Autoren).
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
function neueAufgabe(daten) { return { id: `en_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN-BANKEN
// =============================================================================
const TENSE_BANK = [
  { q: 'Choose: "She ___ to school every day."', r: 'goes', f: ['go', 'going', 'gone'] },
  { q: 'Choose: "I ___ him yesterday."', r: 'saw', f: ['see', 'seen', 'have seen'] },
  { q: 'Choose: "They ___ playing football right now."', r: 'are', f: ['is', 'am', 'be'] },
  { q: 'Choose: "He has ___ his homework."', r: 'done', f: ['did', 'do', 'doing'] },
  { q: 'Choose: "I have lived here ___ 2010."', r: 'since', f: ['for', 'from', 'during'] },
  { q: 'Choose: "She had already ___ when I arrived."', r: 'left', f: ['leave', 'leaving', 'leaves'] },
  { q: 'What is the past tense of "go"?', r: 'went', f: ['goed', 'gone', 'going'] },
  { q: 'Choose: "By next year I ___ finished my studies."', r: 'will have', f: ['will', 'have', 'had'] },
];
const PREPOSITION_BANK = [
  { q: 'Choose: "He is good ___ maths."', r: 'at', f: ['in', 'on', 'for'] },
  { q: 'Choose: "I am interested ___ art."', r: 'in', f: ['on', 'at', 'for'] },
  { q: 'Choose: "It depends ___ the weather."', r: 'on', f: ['of', 'from', 'at'] },
  { q: 'Choose: "She is afraid ___ spiders."', r: 'of', f: ['from', 'for', 'to'] },
  { q: 'Choose: "They got married ___ each other."', r: 'to', f: ['with', 'at', 'on'] },
  { q: 'Choose: "We arrived ___ the airport late."', r: 'at', f: ['to', 'in', 'on'] },
  { q: 'Choose: "I am looking forward ___ the trip."', r: 'to', f: ['for', 'at', 'on'] },
];
const GRAMMAR_ADV_BANK = [
  { q: 'Reported speech: He said, "I am tired." → He said (that) he ___ tired.', r: 'was', f: ['is', 'were', 'has been'] },
  { q: 'Passive: "They build houses." → "Houses ___ built."', r: 'are', f: ['is', 'were', 'have'] },
  { q: 'Conditional III: "If I ___ known, I would have come."', r: 'had', f: ['have', 'would', 'has'] },
  { q: 'Choose the gerund: "I enjoy ___."', r: 'reading', f: ['to read', 'read', 'reads'] },
  { q: 'Choose: "She made me ___ the room." (bare infinitive)', r: 'clean', f: ['to clean', 'cleaning', 'cleaned'] },
  { q: '"Neither of them ___ here." (correct verb)', r: 'is', f: ['are', 'were', 'have'] },
  { q: 'Choose the relative pronoun: "The book ___ I read was great."', r: 'which', f: ['who', 'whose', 'where'] },
];
const VOCAB_BANK = [
  { q: 'Translate "Apfel" to English.', r: 'apple', f: ['orange', 'grape', 'pear'] },
  { q: 'Synonym of "big".', r: 'large', f: ['small', 'tiny', 'narrow'] },
  { q: 'Opposite of "happy".', r: 'sad', f: ['glad', 'joyful', 'cheerful'] },
  { q: 'Translate "Wald" to English.', r: 'forest', f: ['field', 'river', 'mountain'] },
  { q: 'Synonym of "fast".', r: 'quick', f: ['slow', 'late', 'heavy'] },
  { q: 'Opposite of "begin".', r: 'end', f: ['start', 'open', 'continue'] },
  { q: 'Translate "Buch" to English.', r: 'book', f: ['pen', 'desk', 'page'] },
  { q: 'Synonym of "smart".', r: 'clever', f: ['dull', 'slow', 'weak'] },
];
const FALSE_FRIEND_BANK = [
  { q: 'What does the English word "actually" mean?', r: 'in fact / really', f: ['currently (aktuell)', 'topically', 'up to date'] },
  { q: 'The English verb "become" means …', r: 'to turn into (werden)', f: ['to get (bekommen)', 'to begin', 'to leave'] },
  { q: 'The English word "gift" means …', r: 'a present', f: ['poison (Gift)', 'a talent only', 'wrapping paper'] },
  { q: 'The English word "rent" means …', r: 'to hire / Miete', f: ['pension (Rente)', 'to run', 'to return'] },
  { q: 'The English word "chef" means …', r: 'a (head) cook', f: ['boss (Chef)', 'a chief', 'a chemist'] },
  { q: 'The English word "sensible" means …', r: 'reasonable (vernünftig)', f: ['sensitive (sensibel)', 'senseless', 'sensory'] },
  { q: 'The English word "eventually" means …', r: 'in the end / finally', f: ['possibly (eventuell)', 'eventfully', 'evenly'] },
];
const IDIOM_BANK = [
  { q: 'What does "to break the ice" mean?', r: 'to start a conversation', f: ['to feel cold', 'to break something', 'to win easily'] },
  { q: 'What does "a piece of cake" mean?', r: 'very easy', f: ['a dessert', 'a small part', 'a hard task'] },
  { q: 'What does "once in a blue moon" mean?', r: 'very rarely', f: ['at night', 'very often', 'suddenly'] },
  { q: 'What does "to hit the books" mean?', r: 'to study hard', f: ['to read for fun', 'to throw books', 'to relax'] },
  { q: 'What does "under the weather" mean?', r: 'feeling ill', f: ['outdoors', 'very happy', 'busy'] },
  { q: 'What does "to cost an arm and a leg" mean?', r: 'to be very expensive', f: ['to be painful', 'to be cheap', 'to be far'] },
];
const LIT_TERM_BANK = [
  { q: '"as brave as a lion" is a …', r: 'simile', f: ['metaphor', 'alliteration', 'irony'] },
  { q: '"Time is a thief." is a …', r: 'metaphor', f: ['simile', 'hyperbole', 'pun'] },
  { q: '"Peter Piper picked …" (same first sound) is …', r: 'alliteration', f: ['assonance', 'rhyme', 'metaphor'] },
  { q: '"I told you a million times" is …', r: 'hyperbole', f: ['understatement', 'irony', 'simile'] },
  { q: 'Giving human traits to objects is …', r: 'personification', f: ['simile', 'metaphor', 'symbol'] },
  { q: 'A play on words with double meaning is a …', r: 'pun', f: ['metaphor', 'simile', 'irony'] },
];
const AUTHOR_BANK = [
  { q: 'Who wrote "Romeo and Juliet"?', r: 'William Shakespeare', f: ['Charles Dickens', 'George Orwell', 'Jane Austen'] },
  { q: 'Who wrote "1984"?', r: 'George Orwell', f: ['Aldous Huxley', 'Shakespeare', 'Mark Twain'] },
  { q: 'Who wrote "Pride and Prejudice"?', r: 'Jane Austen', f: ['Emily Brontë', 'Orwell', 'Dickens'] },
  { q: 'Who wrote "Hamlet"?', r: 'William Shakespeare', f: ['Christopher Marlowe', 'Dickens', 'Austen'] },
  { q: 'Who wrote "Oliver Twist"?', r: 'Charles Dickens', f: ['Orwell', 'Austen', 'Shakespeare'] },
  { q: 'Who wrote "Brave New World"?', r: 'Aldous Huxley', f: ['George Orwell', 'Mark Twain', 'Jane Austen'] },
];

function genTense(n) { return mcBank('grammar', n, TENSE_BANK); }
function genPreposition(n) { return mcBank('grammar', n, PREPOSITION_BANK); }
function genGrammarAdv(n) { return mcBank('grammar', n, GRAMMAR_ADV_BANK); }
function genVocab(n) { return mcBank('vocabulary', n, VOCAB_BANK); }
function genFalseFriend(n) { return mcBank('vocabulary', n, FALSE_FRIEND_BANK); }
function genIdiom(n) { return mcBank('vocabulary', n, IDIOM_BANK); }
function genLitTerm(n) { return mcBank('literature', n, LIT_TERM_BANK); }
function genAuthor(n) { return mcBank('literature', n, AUTHOR_BANK); }

const POOLS = {
  grammar: [
    { min: 1, gen: genTense }, { min: 1, gen: genPreposition },
    { min: 4, gen: genGrammarAdv },
  ],
  vocabulary: [
    { min: 1, gen: genVocab }, { min: 2, gen: genFalseFriend },
    { min: 3, gen: genIdiom },
  ],
  literature: [
    { min: 1, gen: genLitTerm }, { min: 1, gen: genAuthor },
  ],
};

// =============================================================================
// ZAUBER-KATALOG  (Buchstaben-Sprünge + Splash)
// =============================================================================
const UP_WORTLAENGE = { name: 'Word length (letters)', schluessel: 'anzahl', step: 1, max: 8, kosten: (s) => 22 * (s + 1) };
const UP_SPRUNGWEITE = { name: 'Jump distance', schluessel: 'schrittweite', step: 0.5, max: 4, kosten: (s) => 16 * (s + 1) };
const UP_SCHWUNG = { name: 'Bounce (arc)', schluessel: 'amplitude', step: 0.3, max: 5, kosten: (s) => 14 * (s + 1) };
const UP_REICHWEITE = { name: 'Throw range', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Splash radius', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };

const WORDS_SHORT = ['MAGIC', 'SPELL', 'GROW', 'WORD', 'POEM', 'VERB', 'NOUN'];
const WORDS_LONG = ['HARVEST', 'GRAMMAR', 'LETTER', 'MEADOW', 'STANZA', 'METAPHOR'];

export const ZAUBER = {
  spelling_spell: {
    id: 'spelling_spell', name: 'Spelling Spell', themaId: 'grammar', icon: '🔤',
    form: 'buchstaben', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'A word hops letter by letter across the field, harvesting where it lands.',
    basis: { anzahl: 3, schrittweite: 1, amplitude: 0.6 }, woerter: WORDS_SHORT,
    upgrades: [UP_WORTLAENGE, UP_SPRUNGWEITE, UP_SCHWUNG],
  },
  letter_rain: {
    id: 'letter_rain', name: 'Letter Rain', themaId: 'vocabulary', icon: '🌧️',
    form: 'splash', tier: 3, freischalt: { wissen: 130, niveau: 3 },
    beschreibung: 'A shower of letters covers a circular area and harvests it.',
    basis: { reichweite: 4, radius: 2.2 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  sentence_spell: {
    id: 'sentence_spell', name: 'Sentence Spell', themaId: 'literature', icon: '📝',
    form: 'buchstaben', tier: 4, freischalt: { wissen: 300, niveau: 4 },
    beschreibung: 'A whole sentence leaps far across the field — many letters, long reach.',
    basis: { anzahl: 6, schrittweite: 1, amplitude: 0.85 }, woerter: WORDS_LONG,
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
export const englischModul = {
  id: 'englisch', name: 'Englisch', icon: '🗽', farbe: '#4e86d4',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Letter spells hop across the field; tasks on grammar, vocabulary and literature.',

  themen() {
    return [
      { id: 'grammar', name: 'Grammar' },
      { id: 'vocabulary', name: 'Vocabulary' },
      { id: 'literature', name: 'Literature' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.grammar;
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

  berechneVorschau(zauber, params) {
    if (zauber.form === 'buchstaben') params.wort = (zauber.woerter || WORDS_SHORT)[0];
    return berechneErnteForm(zauber, params);
  },
  wirkeZauber(zauber, params, spielfeld) {
    if (zauber.form === 'buchstaben') params.wort = wahl(zauber.woerter || WORDS_SHORT);
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

export default englischModul;
