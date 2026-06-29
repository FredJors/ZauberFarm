// =============================================================================
// geschichte.js — Vollständiges Fach Geschichte (Antike, Neuzeit, Moderne)
// -----------------------------------------------------------------------------
// Leitidee: der Zeitstrahl als Erntelinie.
//   • Zeitstrahl-Zauber (form 'pfad')   — eine gerade Zeitlinie erntet entlang θ.
//   • Ausgrabungs-Zauber (form 'splash')— eine Grabung legt eine Kreisfläche frei.
//   • Epochen-Welle (form 'kurve')      — Wellen der Geschichte (Aufstieg/Niedergang).
// Aufgaben: große MC-Banken (Abitur-Niveau) + Datierungs-/Jahrhundert-Aufgaben.
// =============================================================================

import { berechneErnteForm } from '../core/ernte.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

// --------------------------------------------------------- kleine Helfer
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
function neueAufgabe(daten) { return { id: `ges_${++aufgabenZaehler}`, ...daten }; }
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
}

// =============================================================================
// AUFGABEN-BANKEN — drei Epochen
// =============================================================================
const ANTIKE_BANK = [
  { q: 'Welche Staatsform entstand im antiken Athen?', r: 'Demokratie', f: ['Monarchie', 'Diktatur', 'Theokratie'], h: 'Athen gilt als Wiege der (attischen) Demokratie.' },
  { q: 'Wer war der erste römische Kaiser?', r: 'Augustus', f: ['Julius Caesar', 'Nero', 'Konstantin'], h: 'Augustus (Octavian) begründete 27 v. Chr. die Kaiserzeit.' },
  { q: 'Womit verteidigten sich römische Legionäre vor allem?', r: 'mit Schwert (Gladius) und Schild', f: ['mit Pfeil und Bogen allein', 'mit Kanonen', 'mit Speerwerfern zu Pferd'], h: 'Das Gladius war die typische Nahkampfwaffe.' },
  { q: 'Welches Volk baute die Pyramiden von Gizeh?', r: 'die alten Ägypter', f: ['die Römer', 'die Griechen', 'die Babylonier'], h: 'Die Pyramiden dienten als Pharaonengräber.' },
  { q: 'Was war das Lehnswesen im Mittelalter?', r: 'Land gegen Treue und Dienst (Lehnsherr–Vasall)', f: ['eine Geldwirtschaft mit Banken', 'eine Demokratie der Bauern', 'ein Handelsabkommen der Städte'], h: 'Grundlage der mittelalterlichen Feudalordnung.' },
  { q: 'In welchem Jahr wurde Karl der Große zum Kaiser gekrönt?', r: '800', f: ['476', '1066', '1215'], h: 'Kaiserkrönung Karls des Großen an Weihnachten 800.' },
  { q: 'Was bezeichnet der Investiturstreit?', r: 'den Streit zwischen Kaiser und Papst um die Einsetzung von Bischöfen', f: ['einen Bauernaufstand', 'einen Krieg gegen die Wikinger', 'eine Hungersnot'], h: 'Höhepunkt: der Gang nach Canossa 1077.' },
  { q: 'Wann fiel das Weströmische Reich (Absetzung des letzten Kaisers)?', r: '476 n. Chr.', f: ['44 v. Chr.', '800 n. Chr.', '1492 n. Chr.'], h: '476 endet die Antike, das Mittelalter beginnt.' },
  { q: 'Was war die Hanse?', r: 'ein Städte- und Kaufmannsbund im Nord- und Ostseeraum', f: ['ein Ritterorden', 'eine Kaiserdynastie', 'ein Kirchenkonzil'], h: 'Mächtiger Handelsbund des Spätmittelalters (z. B. Lübeck).' },
];
const NEUZEIT_BANK = [
  { q: 'Wer erreichte 1492 Amerika?', r: 'Christoph Kolumbus', f: ['Vasco da Gama', 'Ferdinand Magellan', 'Marco Polo'], h: '1492 segelte Kolumbus über den Atlantik.' },
  { q: 'Wer löste mit den 95 Thesen die Reformation aus?', r: 'Martin Luther', f: ['Johannes Calvin', 'Thomas Müntzer', 'Erasmus von Rotterdam'], h: '1517 in Wittenberg – Beginn der Reformation.' },
  { q: 'Wie lange dauerte der Dreißigjährige Krieg?', r: '1618–1648', f: ['1492–1522', '1701–1731', '1756–1786'], h: 'Beendet durch den Westfälischen Frieden 1648.' },
  { q: 'Welches Ereignis gilt als Beginn der Französischen Revolution?', r: 'der Sturm auf die Bastille 1789', f: ['die Krönung Napoleons', 'der Wiener Kongress', 'die Reichsgründung'], h: '14. Juli 1789 – bis heute französischer Nationalfeiertag.' },
  { q: 'Welche Ideale prägten die Französische Revolution?', r: 'Freiheit, Gleichheit, Brüderlichkeit', f: ['Blut und Boden', 'Brot und Spiele', 'Glaube und Gehorsam'], h: '„Liberté, égalité, fraternité".' },
  { q: 'Welche Epoche stellte die Vernunft in den Mittelpunkt?', r: 'die Aufklärung', f: ['das Barock', 'die Romantik', 'das Mittelalter'], h: '„Habe Mut, dich deines eigenen Verstandes zu bedienen" (Kant).' },
  { q: 'Wer wurde als „Sonnenkönig" zum Inbegriff des Absolutismus?', r: 'Ludwig XIV. von Frankreich', f: ['Friedrich II. von Preußen', 'Karl V.', 'Napoleon III.'], h: 'Absolutismus: alle Macht beim König.' },
  { q: 'In welchem Jahr wurde das Deutsche Kaiserreich gegründet?', r: '1871', f: ['1815', '1848', '1888'], h: 'Reichsgründung 1871 in Versailles, Kanzler war Bismarck.' },
  { q: 'Der Wiener Kongress 1815 ordnete Europa neu nach …', r: 'dem Sturz Napoleons', f: ['dem Ersten Weltkrieg', 'der Reformation', 'der Entdeckung Amerikas'], h: 'Neuordnung Europas, Restauration der Fürstenmacht.' },
  { q: 'Was kennzeichnete die Industrielle Revolution?', r: 'Maschinen, Fabriken und die Dampfmaschine', f: ['die Rückkehr zur Landwirtschaft', 'das Ende des Handels', 'die Abschaffung der Städte'], h: 'Beginn in England im späten 18. Jahrhundert.' },
];
const MODERNE_BANK = [
  { q: 'Wann fand der Erste Weltkrieg statt?', r: '1914–1918', f: ['1939–1945', '1870–1871', '1900–1910'], h: 'Auslöser war u. a. das Attentat von Sarajevo 1914.' },
  { q: 'Wie hieß die erste deutsche Demokratie nach 1918?', r: 'Weimarer Republik', f: ['Bundesrepublik', 'Deutsches Kaiserreich', 'Norddeutscher Bund'], h: 'Gegründet 1919, Verfassung in Weimar beschlossen.' },
  { q: 'In welchem Jahr kam Hitler an die Macht?', r: '1933', f: ['1929', '1939', '1945'], h: 'Ernennung zum Reichskanzler am 30. Januar 1933.' },
  { q: 'Wann endete der Zweite Weltkrieg in Europa?', r: '1945', f: ['1918', '1939', '1949'], h: 'Bedingungslose Kapitulation am 8. Mai 1945.' },
  { q: 'Was geschah 1949 in Deutschland?', r: 'Gründung von BRD und DDR', f: ['der Mauerfall', 'die Wiedervereinigung', 'der Mauerbau'], h: 'Teilung in zwei deutsche Staaten.' },
  { q: 'In welchem Jahr wurde die Berliner Mauer gebaut?', r: '1961', f: ['1949', '1989', '1953'], h: 'Bau ab dem 13. August 1961.' },
  { q: 'Welches Ereignis fällt auf das Jahr 1989?', r: 'der Fall der Berliner Mauer', f: ['die Reichsgründung', 'der Kriegsausbruch', 'die Mondlandung'], h: '9. November 1989 – Öffnung der Mauer.' },
  { q: 'Wann wurde Deutschland wiedervereinigt?', r: '1990', f: ['1989', '1991', '1985'], h: 'Deutsche Einheit am 3. Oktober 1990.' },
  { q: 'Wie nannte man den Ost-West-Konflikt nach 1945?', r: 'Kalter Krieg', f: ['Dreißigjähriger Krieg', 'Siebenjähriger Krieg', 'Großer Krieg'], h: 'Systemkonflikt zwischen USA und Sowjetunion.' },
  { q: 'Welche Organisation wurde 1945 zur Friedenssicherung gegründet?', r: 'die UNO (Vereinte Nationen)', f: ['die NATO', 'die EU', 'der Völkerbund'], h: 'Die Vereinten Nationen folgten dem gescheiterten Völkerbund.' },
];

function genAntikeKonzept(n) { return mcBank('antike', n, ANTIKE_BANK); }
function genNeuzeitKonzept(n) { return mcBank('neuzeit', n, NEUZEIT_BANK); }
function genModerneKonzept(n) { return mcBank('moderne', n, MODERNE_BANK); }

// Datierung: aus einer Jahreszahl das Jahrhundert bestimmen.
const EREIGNISSE = [
  { jahr: 800, was: 'die Kaiserkrönung Karls des Großen', thema: 'antike' },
  { jahr: 1066, was: 'die normannische Eroberung Englands', thema: 'antike' },
  { jahr: 1215, was: 'die Magna Carta in England', thema: 'antike' },
  { jahr: 1492, was: 'die Ankunft von Kolumbus in Amerika', thema: 'neuzeit' },
  { jahr: 1517, was: 'der Beginn der Reformation', thema: 'neuzeit' },
  { jahr: 1789, was: 'der Beginn der Französischen Revolution', thema: 'neuzeit' },
  { jahr: 1871, was: 'die Gründung des Deutschen Kaiserreichs', thema: 'neuzeit' },
  { jahr: 1914, was: 'der Beginn des Ersten Weltkriegs', thema: 'moderne' },
  { jahr: 1949, was: 'die Gründung von BRD und DDR', thema: 'moderne' },
  { jahr: 1989, was: 'der Fall der Berliner Mauer', thema: 'moderne' },
];
function genJahrhundert(themaId, n) {
  const kandidaten = EREIGNISSE.filter((e) => e.thema === themaId);
  const e = wahl(kandidaten.length ? kandidaten : EREIGNISSE);
  const jh = Math.floor((e.jahr - 1) / 100) + 1; // z. B. 1789 → 18. Jahrhundert
  return neueAufgabe({
    themaId, typ: 'numerisch', niveau: n,
    frage: `In welchem Jahrhundert liegt ${e.was} (${e.jahr})? (Antwort als Zahl, z. B. 18)`,
    loesung: jh, toleranz: 0.001,
    hinweis: `Das Jahr ${e.jahr} gehört ins ${jh}. Jahrhundert (Jahre ${(jh - 1) * 100 + 1}–${jh * 100}).`,
  });
}
function genJahrhundertAntike(n) { return genJahrhundert('antike', n); }
function genJahrhundertNeuzeit(n) { return genJahrhundert('neuzeit', n); }
function genJahrhundertModerne(n) { return genJahrhundert('moderne', n); }

const POOLS = {
  antike: [
    { min: 1, gen: genAntikeKonzept }, { min: 3, gen: genJahrhundertAntike },
  ],
  neuzeit: [
    { min: 1, gen: genNeuzeitKonzept }, { min: 3, gen: genJahrhundertNeuzeit },
  ],
  moderne: [
    { min: 1, gen: genModerneKonzept }, { min: 3, gen: genJahrhundertModerne },
  ],
};

// =============================================================================
// PFAD-GENERATOR — gerader Zeitstrahl entlang θ
// =============================================================================
function zeitstrahlPunkte(laenge) {
  const pts = [{ x: 0, y: 0 }];
  const n = Math.max(2, Math.round(laenge * 2)); // feine Auflösung (0,5er-Schritte)
  for (let i = 1; i <= n; i++) pts.push({ x: i * 0.5, y: 0 });
  return pts;
}

// =============================================================================
// ZAUBER-KATALOG
// =============================================================================
const UP_ZEIT_LAENGE = { name: 'Zeitstrahl-Länge', schluessel: 'laenge', step: 2, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_REICHWEITE = { name: 'Grabungs-Reichweite', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Grabungs-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };
const UP_BEREICH_BEIDE = { name: 'Reichweite (beidseitig)', schluessel: 'bereich', richtung: 'beide', max: 8, kosten: (s) => 18 * (s + 1) };
const UP_AMPLITUDE = { name: 'Amplitude (a)', schluessel: 'a', step: 0.4, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_FREQUENZ = { name: 'Frequenz (b)', schluessel: 'b', step: 0.25, max: 6, kosten: (s) => 20 * (s + 1) };

export const ZAUBER = {
  zeitstrahl: {
    id: 'zeitstrahl', name: 'Zeitstrahl-Zauber', themaId: 'antike', icon: '📜',
    form: 'pfad', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Eine kurze Zeitlinie zieht sich über den Acker und erntet die Felder entlang der Achse (per Upgrade länger).',
    basis: { laenge: 3 },
    upgrades: [UP_ZEIT_LAENGE],
    pfad: (p) => zeitstrahlPunkte(Math.max(2, p.laenge)),
  },
  ausgrabung: {
    id: 'ausgrabung', name: 'Ausgrabungs-Zauber', themaId: 'neuzeit', icon: '⛏️',
    form: 'splash', tier: 3, freischalt: { wissen: 230, niveau: 3 },
    beschreibung: 'Eine archäologische Grabung legt eine ganze Kreisfläche frei und erntet sie.',
    basis: { reichweite: 4, radius: 2.0 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  epochenwelle: {
    id: 'epochenwelle', name: 'Epochen-Welle', themaId: 'moderne', icon: '🌊',
    form: 'kurve', tier: 4, freischalt: { wissen: 380, niveau: 4 },
    beschreibung: 'Aufstieg und Niedergang als Welle f(x) = a·sin(b·x) — erntet im Auf und Ab der Geschichte.',
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
export const geschichteModul = {
  id: 'geschichte', name: 'Geschichte', icon: '🏰', farbe: '#b0894e',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Zeitstrahl-, Ausgrabungs- und Epochenwellen-Zauber; Aufgaben zu Antike/Mittelalter, Neuzeit und Moderne.',

  themen() {
    return [
      { id: 'antike', name: 'Antike & Mittelalter' },
      { id: 'neuzeit', name: 'Frühe Neuzeit & 19. Jh.' },
      { id: 'moderne', name: '20. & 21. Jahrhundert' },
    ];
  },

  niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.antike;
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

  // Alle Formen (Pfad, Splash, Kurve) sind deterministisch → gemeinsame Pipeline.
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

export default geschichteModul;
