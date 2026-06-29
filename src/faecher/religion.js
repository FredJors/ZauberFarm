// =============================================================================
// religion.js — Vollständiges Fach Religion (Christentum, Weltreligionen, Ethik)
// -----------------------------------------------------------------------------
// NEUE Zauberform: "Ringe" — ein Glockenklang breitet sich in konzentrischen
// Wellen über den Acker aus und erntet die Ringe. Dazu: Kerzenschein (kleiner
// Splash-Starter), Mannaregen (Regen) und Himmelslicht (Kegel).
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
function neueAufgabe(daten) { return { id: `rel_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — prozedurale Zahlen-Fakten
// =============================================================================
const ZAHLEN = [
  { themaId: 'christentum', frage: 'Wie viele Gebote umfasst der Dekalog (die Zehn Gebote)?', l: 10, h: 'Dekalog = „Zehnwort".' },
  { themaId: 'christentum', frage: 'Wie viele Evangelien stehen im Neuen Testament?', l: 4, h: 'Matthäus, Markus, Lukas, Johannes.' },
  { themaId: 'weltreligionen', frage: 'Wie viele „Säulen" hat der Islam?', l: 5, h: 'Glaubensbekenntnis, Gebet, Almosen, Fasten, Pilgerfahrt.' },
  { themaId: 'weltreligionen', frage: 'Wie viele große abrahamitische (monotheistische) Weltreligionen gibt es?', l: 3, h: 'Judentum, Christentum, Islam.' },
];
function genZahl(themaId) {
  return (n) => {
    const kand = ZAHLEN.filter((z) => z.themaId === themaId);
    const z = wahl(kand.length ? kand : ZAHLEN);
    return neueAufgabe({ themaId, typ: 'numerisch', niveau: n, frage: z.frage, loesung: z.l, toleranz: 0.001, hinweis: z.h });
  };
}

// ---- Konzept-Banken ---------------------------------------------------------
const CHRISTENTUM_BANK = [
  { q: 'Welches Fest feiert die Geburt Jesu?', r: 'Weihnachten', f: ['Ostern', 'Pfingsten', 'Erntedank'], h: 'Geburt Jesu in Bethlehem.' },
  { q: 'Welches Fest feiert die Auferstehung Jesu?', r: 'Ostern', f: ['Weihnachten', 'Advent', 'Fronleichnam'], h: 'Höchstes christliches Fest.' },
  { q: 'Wie heißt die Heilige Schrift der Christen?', r: 'die Bibel', f: ['der Koran', 'die Tora', 'die Veden'], h: 'Aus Altem und Neuem Testament.' },
  { q: 'In welche zwei Hauptteile gliedert sich die Bibel?', r: 'Altes und Neues Testament', f: ['Tora und Talmud', 'Koran und Sunna', 'Genesis und Exodus'], h: 'AT (vor Christus) und NT (Jesus und frühe Kirche).' },
  { q: 'Welche Konfessionen gingen aus der Reformation hervor?', r: 'die evangelischen (protestantischen) Kirchen', f: ['die orthodoxen Kirchen', 'der Buddhismus', 'der Hinduismus'], h: 'Ausgelöst durch Martin Luther (1517).' },
  { q: 'Wie nennt man das christliche Gotteshaus?', r: 'die Kirche', f: ['die Moschee', 'die Synagoge', 'der Tempel'], h: 'Ort der Gottesdienste.' },
  { q: 'Wie heißt das zentrale Gebet, das Jesus lehrte?', r: 'das Vaterunser', f: ['das Glaubensbekenntnis', 'der Rosenkranz', 'das Schma Israel'], h: '„Vater unser im Himmel …"' },
  { q: 'Was bedeutet das Wort „Evangelium"?', r: 'gute/frohe Botschaft', f: ['Gesetzbuch', 'Tempel', 'Prophezeiung'], h: 'Aus dem Griechischen: euangelion.' },
];
const WELTRELIGIONEN_BANK = [
  { q: 'Wie heißt die Heilige Schrift des Islam?', r: 'der Koran', f: ['die Bibel', 'die Tora', 'das Tripitaka'], h: 'Offenbarung an den Propheten Mohammed.' },
  { q: 'Wie heißt das Gotteshaus der Muslime?', r: 'die Moschee', f: ['die Synagoge', 'die Kirche', 'die Pagode'], h: 'Ort des gemeinsamen Gebets.' },
  { q: 'Wie heißt das Gotteshaus im Judentum?', r: 'die Synagoge', f: ['die Moschee', 'die Kirche', 'der Schrein'], h: 'Versammlungs- und Gebetsort.' },
  { q: 'In welcher Religion sind Karma und Wiedergeburt zentrale Vorstellungen?', r: 'im Buddhismus', f: ['im Christentum', 'im Islam', 'im Judentum'], h: 'Auch im Hinduismus zentral.' },
  { q: 'Zu welcher Religion gehören die „Fünf Säulen"?', r: 'zum Islam', f: ['zum Judentum', 'zum Christentum', 'zum Buddhismus'], h: 'Grundpflichten gläubiger Muslime.' },
  { q: 'Wer gilt als Begründer des Buddhismus?', r: 'Buddha (Siddhartha Gautama)', f: ['Mohammed', 'Abraham', 'Konfuzius'], h: 'Der „Erwachte".' },
  { q: 'Welche ist die älteste der drei abrahamitischen Religionen?', r: 'das Judentum', f: ['das Christentum', 'der Islam', 'der Hinduismus'], h: 'Christentum und Islam beziehen sich auf Abraham.' },
  { q: 'Was bedeutet „monotheistisch"?', r: 'der Glaube an einen einzigen Gott', f: ['der Glaube an viele Götter', 'der Glaube an keinen Gott', 'der Glaube an die Natur'], h: 'Gegenteil: polytheistisch.' },
  { q: 'Wie heißt die Heilige Schrift des Judentums (die fünf Bücher Mose)?', r: 'die Tora', f: ['der Koran', 'das Neue Testament', 'die Bhagavadgita'], h: 'Kern der hebräischen Bibel.' },
];
const ETHIK_BANK = [
  { q: 'Was besagt die „Goldene Regel"?', r: 'Behandle andere so, wie du selbst behandelt werden möchtest', f: ['Auge um Auge', 'Jeder für sich', 'Der Stärkere hat recht'], h: 'In vielen Religionen und Kulturen zu finden.' },
  { q: 'Was meint „Nächstenliebe"?', r: 'Fürsorge und Liebe gegenüber dem Mitmenschen', f: ['Liebe nur zur Familie', 'Selbstliebe allein', 'Gehorsam gegenüber dem Staat'], h: '„Liebe deinen Nächsten wie dich selbst."' },
  { q: 'Was bedeutet religiöse Toleranz?', r: 'andere Glaubensüberzeugungen achten und gelten lassen', f: ['alle zum eigenen Glauben bekehren', 'Religion verbieten', 'nur eine Religion erlauben'], h: 'Grundlage des friedlichen Zusammenlebens.' },
  { q: 'Welcher Wert schützt die Unverletzlichkeit jedes Menschen?', r: 'die Menschenwürde', f: ['der Wohlstand', 'die Mehrheit', 'die Tradition'], h: 'Auch Grundlage des Grundgesetzes.' },
  { q: 'Was ist ein ethisches Dilemma?', r: 'eine Lage mit zwei schwer vereinbaren moralischen Pflichten', f: ['eine leichte Entscheidung', 'eine mathematische Aufgabe', 'ein Rechtsstreit'], h: 'Jede Wahl hat moralische Kosten.' },
  { q: 'Was ist Gewissensfreiheit?', r: 'das Recht, nach dem eigenen Gewissen zu glauben und zu handeln', f: ['die Pflicht zu schweigen', 'das Verbot zu denken', 'die Macht des Staates über den Glauben'], h: 'Im Grundgesetz geschützt (Art. 4).' },
  { q: 'Was bedeutet „Barmherzigkeit"?', r: 'mitfühlendes Helfen gegenüber Notleidenden', f: ['strenge Bestrafung', 'gleichgültiges Wegsehen', 'Selbstgerechtigkeit'], h: 'Zentral z. B. im Gleichnis vom barmherzigen Samariter.' },
];
function genChristentumKonzept(n) { return mcBank('christentum', n, CHRISTENTUM_BANK); }
function genWeltreligionenKonzept(n) { return mcBank('weltreligionen', n, WELTRELIGIONEN_BANK); }
function genEthikKonzept(n) { return mcBank('ethik', n, ETHIK_BANK); }

const POOLS = {
  christentum: [
    { min: 1, gen: genChristentumKonzept }, { min: 2, gen: genZahl('christentum') },
  ],
  weltreligionen: [
    { min: 1, gen: genWeltreligionenKonzept }, { min: 2, gen: genZahl('weltreligionen') },
  ],
  ethik: [
    { min: 1, gen: genEthikKonzept },
  ],
};

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_REICHWEITE = { name: 'Kerzen-Reichweite', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Schein-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };
const UP_RINGE = { name: 'Anzahl Klangringe', schluessel: 'reichweite', step: 1, max: 8, kosten: (s) => 18 * (s + 1) };
const UP_TROPFEN = { name: 'Manna-Tropfen (Anzahl)', schluessel: 'anzahl', step: 2, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REGEN_RADIUS = { name: 'Regen-Umkreis', schluessel: 'radius', step: 1, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_KEGEL_LAENGE = { name: 'Strahl-Länge (Reichweite)', schluessel: 'reichweite', step: 1, max: 8, kosten: (s) => 18 * (s + 1) };
const UP_OEFFNUNG = { name: 'Strahl-Breite (Öffnung)', schluessel: 'oeffnung', step: 0.2, max: 6, kosten: (s) => 18 * (s + 1) };

export const ZAUBER = {
  kerzenschein: {
    id: 'kerzenschein', name: 'Kerzenschein', themaId: 'ethik', icon: '🕯️',
    form: 'splash', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Ein warmer Kerzenschein erntet eine kleine Fläche nah am Bauern (per Upgrade größer).',
    basis: { reichweite: 1.5, radius: 1.3 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  glockenklang: {
    id: 'glockenklang', name: 'Glockenklang', themaId: 'christentum', icon: '🔔',
    form: 'ringe', tier: 3, freischalt: { wissen: 230, niveau: 3 },
    beschreibung: 'Ein Glockenklang breitet sich in konzentrischen Wellen aus und erntet die Ringe.',
    basis: { reichweite: 3 },
    upgrades: [UP_RINGE],
  },
  mannaregen: {
    id: 'mannaregen', name: 'Mannaregen', themaId: 'weltreligionen', icon: '🍞',
    form: 'regen', tier: 3, freischalt: { wissen: 240, niveau: 3 }, symbol: '🍞',
    beschreibung: 'Manna fällt vom Himmel auf zufällige Felder im Umkreis. Anfangs 3 im Umkreis 3 — beides aufwertbar.',
    basis: { anzahl: 3, radius: 3 },
    upgrades: [UP_TROPFEN, UP_REGEN_RADIUS],
  },
  himmelslicht: {
    id: 'himmelslicht', name: 'Himmelslicht', themaId: 'christentum', icon: '🌟',
    form: 'kegel', tier: 4, freischalt: { wissen: 400, niveau: 4 },
    beschreibung: 'Ein göttlicher Lichtkegel legt sich über den Acker und erntet den Sektor.',
    basis: { reichweite: 5, oeffnung: 0.9 },
    upgrades: [UP_KEGEL_LAENGE, UP_OEFFNUNG],
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
export const religionModul = {
  id: 'religion', name: 'Religion', icon: '✝️', farbe: '#c9a05a',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Kerzenschein, Glockenklang (Ringe), Mannaregen & Himmelslicht; Aufgaben zu Christentum, Weltreligionen und Ethik.',

  themen() {
    return [
      { id: 'christentum', name: 'Christentum' },
      { id: 'weltreligionen', name: 'Weltreligionen' },
      { id: 'ethik', name: 'Ethik & Werte' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.christentum;
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

export default religionModul;
