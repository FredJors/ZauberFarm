// =============================================================================
// politik_wirtschaft.js — Vollständiges Fach Politik-Wirtschaft
// -----------------------------------------------------------------------------
// NEUE Zauberform: "Kreuz" — Angebots- und Nachfragekurve kreuzen sich zum
// Marktgleichgewicht (ein „X" über dem Acker). Dazu: kleine Nachfragekurve
// (Starter), Subventionsregen (Regen) und Konjunkturwelle (Kurve).
// Aufgaben prozedural + große MC-Banken (Abitur-Niveau: VWL, politisches System,
// internationale Politik).
// =============================================================================

import { wirkeMitForm, formVorschau } from './zauberformen.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
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
function neueAufgabe(daten) { return { id: `pw_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN — prozedural
// =============================================================================
function genProzentPreis(n) {
  const preis = wahl([40, 60, 80, 120, 200]), proz = wahl([10, 20, 25, 50]);
  const neu = preis * (1 + proz / 100);
  return neueAufgabe({
    themaId: 'wirtschaft', typ: 'numerisch', niveau: n,
    frage: `Ein Gut kostet ${preis} €. Der Preis steigt um ${proz} %. Wie viel kostet es danach (in €)?`,
    loesung: neu, toleranz: 0.5,
    hinweis: `${preis} · (1 + ${proz}/100) = ${preis} + ${preis * proz / 100} = ${neu} €.`,
  });
}
function genInflation(n) {
  const wert = wahl([100, 200, 500]), rate = wahl([2, 4, 5]);
  const neu = wert * (1 + rate / 100);
  return neueAufgabe({
    themaId: 'wirtschaft', typ: 'numerisch', niveau: n,
    frage: `Ein Warenkorb kostet ${wert} €. Bei ${rate} % Inflation: Wie viel kostet er ein Jahr später (in €)?`,
    loesung: neu, toleranz: 0.5,
    hinweis: `${wert} · (1 + ${rate}/100) = ${neu} €.`,
  });
}
const POLITIK_ZAHLEN = [
  { frage: 'In wie viele Gewalten teilt die Gewaltenteilung den Staat?', l: 3, h: 'Legislative, Exekutive, Judikative.' },
  { frage: 'Ab welchem Alter darf man in Deutschland den Bundestag wählen?', l: 18, h: 'Aktives Wahlrecht ab 18 Jahren.' },
  { frage: 'Wie viele Prozent muss eine Partei mindestens erreichen, um in den Bundestag einzuziehen?', l: 5, h: 'Die Fünf-Prozent-Hürde.' },
];
function genPolitikZahl(n) {
  const z = wahl(POLITIK_ZAHLEN);
  return neueAufgabe({
    themaId: 'politik', typ: 'numerisch', niveau: n,
    frage: z.frage, loesung: z.l, toleranz: 0.001, hinweis: z.h,
  });
}
function genEUStaaten(n) {
  return neueAufgabe({
    themaId: 'international', typ: 'numerisch', niveau: n,
    frage: 'Wie viele Mitgliedstaaten hat die Europäische Union (Stand: aktuell)?',
    loesung: 27, toleranz: 0.001,
    hinweis: 'Seit dem Austritt des Vereinigten Königreichs (Brexit) sind es 27.',
  });
}

// ---- Konzept-Banken ---------------------------------------------------------
const WIRTSCHAFT_BANK = [
  { q: 'Was passiert in der Regel mit der nachgefragten Menge, wenn der Preis steigt?', r: 'sie sinkt', f: ['sie steigt', 'sie bleibt gleich', 'sie verdoppelt sich'], h: 'Gesetz der Nachfrage: höherer Preis → weniger Nachfrage.' },
  { q: 'Was passiert mit der angebotenen Menge, wenn der Preis steigt?', r: 'sie steigt', f: ['sie sinkt', 'sie bleibt gleich', 'sie wird negativ'], h: 'Höhere Preise lohnen sich für Anbieter.' },
  { q: 'Wie heißt der Preis, bei dem Angebot und Nachfrage gleich groß sind?', r: 'Gleichgewichtspreis', f: ['Höchstpreis', 'Mindestpreis', 'Listenpreis'], h: 'Schnittpunkt von Angebots- und Nachfragekurve.' },
  { q: 'Was bedeutet Inflation?', r: 'ein anhaltender Anstieg des Preisniveaus (Geldentwertung)', f: ['ein Sinken der Preise', 'mehr Arbeitsplätze', 'eine Steuersenkung'], h: 'Das Geld verliert an Kaufkraft.' },
  { q: 'Wofür steht die Abkürzung BIP?', r: 'Bruttoinlandsprodukt', f: ['Bundesinvestitionsplan', 'Betriebsinternes Protokoll', 'Bruttoindustriepreis'], h: 'Wert aller im Inland erzeugten Waren und Dienstleistungen.' },
  { q: 'Welche Wirtschaftsordnung hat freie Preisbildung durch Angebot und Nachfrage?', r: 'die Marktwirtschaft', f: ['die Planwirtschaft', 'die Tauschwirtschaft', 'die Subsistenzwirtschaft'], h: 'In der Planwirtschaft legt der Staat die Preise fest.' },
  { q: 'Was kennzeichnet ein Monopol?', r: 'ein einziger Anbieter beherrscht den Markt', f: ['viele kleine Anbieter', 'genau zwei Anbieter', 'nur ein Nachfrager'], h: 'Oligopol = wenige, Polypol = viele Anbieter.' },
  { q: 'Was misst die Arbeitslosenquote?', r: 'den Anteil der Arbeitslosen an den Erwerbspersonen', f: ['die Zahl aller Einwohner', 'das Durchschnittseinkommen', 'die Zahl der Unternehmen'], h: 'Angabe in Prozent.' },
  { q: 'Was bezeichnet die „soziale Marktwirtschaft"?', r: 'Marktwirtschaft mit sozialem Ausgleich durch den Staat', f: ['reine Planwirtschaft', 'Wirtschaft ohne Steuern', 'Wirtschaft ohne Wettbewerb'], h: 'Wettbewerb plus soziale Absicherung.' },
];
const POLITIK_BANK = [
  { q: 'Welche drei Staatsgewalten unterscheidet die Gewaltenteilung?', r: 'Legislative, Exekutive, Judikative', f: ['Bundestag, Bundesrat, Bundespräsident', 'Partei, Fraktion, Regierung', 'Bund, Land, Gemeinde'], h: 'Gesetzgebung, ausführende Gewalt, Rechtsprechung.' },
  { q: 'Welche Gewalt beschließt die Gesetze?', r: 'die Legislative (Parlament)', f: ['die Exekutive', 'die Judikative', 'die Presse'], h: 'In Deutschland v. a. der Bundestag.' },
  { q: 'Welche Gewalt führt die Gesetze aus / verwaltet?', r: 'die Exekutive (Regierung, Verwaltung)', f: ['die Legislative', 'die Judikative', 'die Medien'], h: 'Regierung und Behörden.' },
  { q: 'Welche Gewalt spricht Recht?', r: 'die Judikative (Gerichte)', f: ['die Legislative', 'die Exekutive', 'die Opposition'], h: 'Unabhängige Gerichte.' },
  { q: 'Wie heißt die deutsche Verfassung?', r: 'das Grundgesetz', f: ['die Reichsverfassung', 'das Bürgerliche Gesetzbuch', 'die Charta'], h: 'In Kraft seit 1949.' },
  { q: 'Was schützt Artikel 1 des Grundgesetzes?', r: 'die Würde des Menschen', f: ['das Eigentum', 'die Pressefreiheit', 'das Wahlrecht'], h: '„Die Würde des Menschen ist unantastbar."' },
  { q: 'Wer wählt in Deutschland den Bundeskanzler?', r: 'der Bundestag', f: ['das Volk direkt', 'der Bundespräsident allein', 'der Bundesrat'], h: 'Wahl durch das Parlament.' },
  { q: 'Was bedeutet das Wort „Demokratie" wörtlich?', r: 'Herrschaft des Volkes', f: ['Herrschaft des Adels', 'Herrschaft eines Einzelnen', 'Herrschaft der Reichen'], h: 'Aus dem Griechischen: demos (Volk) + kratos (Herrschaft).' },
  { q: 'Wie heißt die Vertretung der Bundesländer auf Bundesebene?', r: 'der Bundesrat', f: ['der Bundestag', 'das Bundesverfassungsgericht', 'der Bundespräsident'], h: 'Über ihn wirken die Länder an der Gesetzgebung mit.' },
];
const INTERNATIONAL_BANK = [
  { q: 'Wofür steht die Abkürzung EU?', r: 'Europäische Union', f: ['Einheitliche Union', 'Europäisches Unternehmen', 'Euro-Universum'], h: 'Staatenverbund in Europa.' },
  { q: 'Wie heißt die gemeinsame Währung vieler EU-Staaten?', r: 'der Euro', f: ['der Gulden', 'die Mark', 'das Pfund'], h: 'Eingeführt als Buchgeld 1999, bar 2002.' },
  { q: 'Wofür steht die NATO?', r: 'ein westliches Verteidigungsbündnis', f: ['eine Umweltorganisation', 'eine Handelszone', 'eine Religionsgemeinschaft'], h: 'Nordatlantik-Verteidigungsbündnis.' },
  { q: 'Wofür steht die UNO (UN)?', r: 'die Vereinten Nationen', f: ['die Europäische Zentralbank', 'ein Militärbündnis Asiens', 'ein Sportverband'], h: 'Weltweite Organisation zur Friedenssicherung (gegr. 1945).' },
  { q: 'Was bedeutet Globalisierung?', r: 'die weltweite Verflechtung von Wirtschaft, Politik und Kultur', f: ['die Abschottung von Staaten', 'die Rückkehr zur Selbstversorgung', 'das Ende des Handels'], h: 'Internationale Vernetzung nimmt zu.' },
  { q: 'Was ist der Schengen-Raum?', r: 'ein Gebiet weitgehend ohne Grenzkontrollen', f: ['eine gemeinsame Armee', 'ein Steuerparadies', 'eine Handelsabgabe'], h: 'Freier Personenverkehr zwischen Mitgliedern.' },
  { q: 'Welches Organ vertritt in der EU direkt die Bürgerinnen und Bürger?', r: 'das Europäische Parlament', f: ['der Europäische Rat', 'die Europäische Zentralbank', 'der Gerichtshof'], h: 'Direkt gewählt von den EU-Bürgern.' },
];
function genWirtschaftKonzept(n) { return mcBank('wirtschaft', n, WIRTSCHAFT_BANK); }
function genPolitikKonzept(n) { return mcBank('politik', n, POLITIK_BANK); }
function genInternationalKonzept(n) { return mcBank('international', n, INTERNATIONAL_BANK); }

const POOLS = {
  wirtschaft: [
    { min: 1, gen: genWirtschaftKonzept }, { min: 2, gen: genProzentPreis },
    { min: 4, gen: genInflation },
  ],
  politik: [
    { min: 1, gen: genPolitikKonzept }, { min: 2, gen: genPolitikZahl },
  ],
  international: [
    { min: 1, gen: genInternationalKonzept }, { min: 3, gen: genEUStaaten },
  ],
};

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_BEREICH_RECHTS = { name: 'Reichweite (rechts)', schluessel: 'bereich', richtung: 'rechts', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_STEIGUNG = { name: 'Steigung/Gefälle (a)', schluessel: 'a', step: 0.3, max: 6, kosten: (s) => 15 * (s + 1) };
const UP_VERSCHIEBUNG = { name: 'Verschiebung (c)', schluessel: 'c', step: 1, max: 5, kosten: (s) => 12 * (s + 1) };
const UP_KREUZ_REICHWEITE = { name: 'Kurven-Reichweite', schluessel: 'reichweite', step: 1, max: 8, kosten: (s) => 18 * (s + 1) };
const UP_TROPFEN = { name: 'Subventions-Tropfen (Anzahl)', schluessel: 'anzahl', step: 2, max: 6, kosten: (s) => 20 * (s + 1) };
const UP_REGEN_RADIUS = { name: 'Verteil-Umkreis', schluessel: 'radius', step: 1, max: 6, kosten: (s) => 18 * (s + 1) };
const UP_BEREICH_BEIDE = { name: 'Reichweite (beidseitig)', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_AMPLITUDE = { name: 'Amplitude (a)', schluessel: 'a', step: 0.4, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_FREQUENZ = { name: 'Frequenz (b)', schluessel: 'b', step: 0.25, max: 6, kosten: (s) => 20 * (s + 1) };

export const ZAUBER = {
  nachfragekurve: {
    id: 'nachfragekurve', name: 'Nachfragekurve', themaId: 'wirtschaft', icon: '📉',
    form: 'kurve', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Eine fallende Nachfragekurve f(x) = c − a·x erntet nah am Bauern (per Upgrade weiter).',
    basis: { a: 0.7, b: 1, c: 2, bereichMin: 0, bereichMax: 3 },
    upgrades: [UP_BEREICH_RECHTS, UP_STEIGUNG, UP_VERSCHIEBUNG],
    f: (p) => (x) => p.c - p.a * x,
  },
  marktgleichgewicht: {
    id: 'marktgleichgewicht', name: 'Marktgleichgewicht', themaId: 'wirtschaft', icon: '⚖️',
    form: 'kreuz', tier: 3, freischalt: { wissen: 230, niveau: 3 },
    beschreibung: 'Angebots- und Nachfragekurve kreuzen sich zum Gleichgewicht — erntet beide Linien (ein „X").',
    basis: { reichweite: 4 },
    upgrades: [UP_KREUZ_REICHWEITE],
  },
  subventionsregen: {
    id: 'subventionsregen', name: 'Subventionsregen', themaId: 'politik', icon: '💶',
    form: 'regen', tier: 3, freischalt: { wissen: 240, niveau: 3 }, symbol: '💶',
    beschreibung: 'Fördergelder regnen auf zufällige Felder im Umkreis. Anfangs 3 im Umkreis 3 — beides aufwertbar.',
    basis: { anzahl: 3, radius: 3 },
    upgrades: [UP_TROPFEN, UP_REGEN_RADIUS],
  },
  konjunkturwelle: {
    id: 'konjunkturwelle', name: 'Konjunkturwelle', themaId: 'international', icon: '〰️',
    form: 'kurve', tier: 4, freischalt: { wissen: 380, niveau: 4 },
    beschreibung: 'Auf und Ab der Konjunktur als Welle f(x) = a·sin(b·x).',
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
export const politikWirtschaftModul = {
  id: 'politik_wirtschaft', name: 'Politik-Wirtschaft', icon: '⚖️', farbe: '#5fae8f',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Nachfragekurve, Marktgleichgewicht (Kreuz), Subventionsregen & Konjunkturwelle; Aufgaben zu VWL, politischem System und internationaler Politik.',

  themen() {
    return [
      { id: 'wirtschaft', name: 'Wirtschaft (VWL)' },
      { id: 'politik', name: 'Politisches System' },
      { id: 'international', name: 'Internationale Politik' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.wirtschaft;
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

export default politikWirtschaftModul;
