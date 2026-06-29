// =============================================================================
// latein.js — Vollständiges Fach Latein (über die Sprachfabrik)
// -----------------------------------------------------------------------------
// Buchstaben-Zauber wie die übrigen Sprachen; Aufgaben zu Vokabeln, Formenlehre
// (Deklination/Konjugation) und antiker Kultur. Daten-only — die Mechanik kommt
// aus erzeugeSprachModul().
// =============================================================================

import { erzeugeSprachModul } from './sprachfabrik.js';

const VOKABELN_BANK = [
  { q: 'Was bedeutet das lateinische Wort „aqua"?', r: 'Wasser', f: ['Feuer', 'Erde', 'Luft'] },
  { q: 'Was bedeutet „bellum"?', r: 'Krieg', f: ['Frieden', 'Schönheit', 'Buch'] },
  { q: 'Was bedeutet „rex"?', r: 'König', f: ['Soldat', 'Bauer', 'Priester'] },
  { q: 'Was bedeutet „vita"?', r: 'Leben', f: ['Tod', 'Weg', 'Stadt'] },
  { q: 'Was bedeutet „amor"?', r: 'Liebe', f: ['Hass', 'Furcht', 'Hoffnung'] },
  { q: 'Was bedeutet „terra"?', r: 'Erde / Land', f: ['Meer', 'Himmel', 'Stern'] },
  { q: 'Was bedeutet „puella"?', r: 'Mädchen', f: ['Junge', 'Frau', 'Mutter'] },
  { q: 'Was bedeutet „amicus"?', r: 'Freund', f: ['Feind', 'Lehrer', 'Sklave'] },
  { q: 'Was bedeutet „servus"?', r: 'Sklave / Diener', f: ['Herr', 'Soldat', 'Bürger'] },
  { q: 'Was bedeutet „magister"?', r: 'Lehrer / Meister', f: ['Schüler', 'Vater', 'Richter'] },
];
const FORMEN_BANK = [
  { q: 'Wie lautet die 1. Person Singular Präsens von „amare" (lieben)?', r: 'amo', f: ['amas', 'amat', 'amamus'], h: 'amo, amas, amat, amamus, amatis, amant.' },
  { q: 'Was bedeutet die Form „amat"?', r: 'er/sie/es liebt', f: ['ich liebe', 'du liebst', 'wir lieben'], h: '3. Person Singular Präsens.' },
  { q: 'In welchem Fall (Kasus) steht das direkte Objekt?', r: 'Akkusativ', f: ['Nominativ', 'Genitiv', 'Dativ'], h: 'Wen oder was? → Akkusativ.' },
  { q: 'Welcher Kasus bezeichnet den Besitz (wessen?)?', r: 'Genitiv', f: ['Dativ', 'Ablativ', 'Akkusativ'], h: 'Genitiv = Besitz/Zugehörigkeit (rosae = der Rose).' },
  { q: 'Wie viele Fälle (Kasus) hat das klassische Latein?', r: '6', f: ['4', '5', '8'], h: 'Nominativ, Genitiv, Dativ, Akkusativ, Ablativ, Vokativ.' },
  { q: 'Wie lautet der Nominativ Singular von „Mädchen"?', r: 'puella', f: ['puellam', 'puellae', 'puellas'], h: 'a-Deklination: puella (Nom. Sg.).' },
  { q: 'Welche Endung hat der Nominativ Plural der a-Deklination?', r: '-ae (puellae)', f: ['-is', '-orum', '-um'], h: 'puella → puellae.' },
  { q: 'Was bedeutet die Form „bella" (Neutrum Plural)?', r: 'die Kriege', f: ['der Krieg', 'dem Krieg', 'des Krieges'], h: 'bellum (Sg.) → bella (Pl.).' },
  { q: 'Was ist der Infinitiv von „amo"?', r: 'amare', f: ['amat', 'amavi', 'amatum'], h: 'amare = lieben.' },
];
const KULTUR_BANK = [
  { q: 'Wer gründete der Sage nach Rom?', r: 'Romulus (und Remus)', f: ['Caesar', 'Augustus', 'Aeneas allein'], h: 'Romulus erschlug Remus und gab Rom seinen Namen.' },
  { q: 'Von wem stammt der Ausspruch „veni, vidi, vici"?', r: 'Julius Caesar', f: ['Cicero', 'Nero', 'Hannibal'], h: '„Ich kam, sah, siegte."' },
  { q: 'Wofür steht die Abkürzung SPQR?', r: 'Senatus Populusque Romanus', f: ['Sancta Pax Quirini Romae', 'Senatus Provincia Quaestor Rex', 'Servus Publicus Quintus Romanus'], h: '„Senat und Volk von Rom".' },
  { q: 'Welcher Gott war der oberste der römischen Götter?', r: 'Jupiter', f: ['Mars', 'Neptun', 'Merkur'], h: 'Jupiter entspricht dem griechischen Zeus.' },
  { q: 'Welcher Gott war der römische Kriegsgott?', r: 'Mars', f: ['Venus', 'Apollo', 'Vulcanus'], h: 'Mars = Kriegsgott (Venus = Liebe).' },
  { q: 'Aus dem Lateinischen entwickelten sich die …', r: 'romanischen Sprachen', f: ['germanischen Sprachen', 'slawischen Sprachen', 'finno-ugrischen Sprachen'], h: 'Italienisch, Französisch, Spanisch u. a.' },
  { q: 'Was war das Forum Romanum?', r: 'der zentrale Markt- und Versammlungsplatz Roms', f: ['eine Kampfarena', 'ein Tempel allein', 'ein Aquädukt'], h: 'Politisches und gesellschaftliches Zentrum Roms.' },
  { q: 'Wer verfasste das römische Nationalepos „Aeneis"?', r: 'Vergil', f: ['Ovid', 'Horaz', 'Seneca'], h: 'Vergil erzählt die Sage des Aeneas.' },
  { q: 'Wie hieß das Gewand der römischen Bürger?', r: 'die Toga', f: ['der Peplos', 'die Tunika allein', 'der Chiton'], h: 'Die Toga war Zeichen des römischen Bürgers.' },
];

export const lateinModul = erzeugeSprachModul({
  id: 'latein', name: 'Latein', icon: '🏛️', farbe: '#b08d57',
  konzept: 'Buchstaben-Zauber hüpfen über den Acker; Aufgaben zu Vokabeln, Formenlehre und antiker Kultur.',
  themen: [
    { id: 'vokabeln', name: 'Vokabular' },
    { id: 'formen', name: 'Formenlehre' },
    { id: 'kultur', name: 'Antike Kultur' },
  ],
  banks: { vokabeln: VOKABELN_BANK, formen: FORMEN_BANK, kultur: KULTUR_BANK },
  woerterKurz: ['ROMA', 'AQUA', 'REX', 'VITA', 'AMOR', 'TERRA'],
  woerterLang: ['IMPERIUM', 'GLADIATOR', 'SENATUS', 'REPUBLICA', 'VICTORIA'],
  zauber: {
    wort: { name: 'Verbum magicum', icon: '📜' },
    salat: { name: 'Litterae mixtae', icon: '🥗' },
    satz: { name: 'Sententia magica', icon: '📖' },
  },
});

export default lateinModul;
