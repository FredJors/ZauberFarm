// =============================================================================
// franzoesisch.js — Vollständiges Fach Französisch (über die Sprachfabrik)
// -----------------------------------------------------------------------------
// Buchstaben-Zauber wie Deutsch/Englisch; Aufgaben zu Vokabeln, Grammatik und
// Landeskunde/Literatur (Abitur-Niveau). Die FachModul-Mechanik liefert
// erzeugeSprachModul() — hier stehen nur noch die Daten.
// =============================================================================

import { erzeugeSprachModul } from './sprachfabrik.js';

const VOKABELN_BANK = [
  { q: 'Was bedeutet das französische Wort „maison"?', r: 'Haus', f: ['Schule', 'Stadt', 'Brot'] },
  { q: 'Was bedeutet „eau"?', r: 'Wasser', f: ['Feuer', 'Luft', 'Erde'] },
  { q: 'Was bedeutet „pain"?', r: 'Brot', f: ['Käse', 'Wein', 'Apfel'] },
  { q: 'Was bedeutet „livre"?', r: 'Buch', f: ['Stift', 'Tisch', 'Fenster'] },
  { q: 'Was bedeutet „ami"?', r: 'Freund', f: ['Feind', 'Lehrer', 'Bruder'] },
  { q: 'Wie heißt „danke" auf Französisch?', r: 'merci', f: ['bonjour', 'pardon', 'oui'] },
  { q: 'Wie heißt „Guten Tag" auf Französisch?', r: 'bonjour', f: ['bonne nuit', 'merci', 'au revoir'] },
  { q: 'Was bedeutet die Farbe „rouge"?', r: 'rot', f: ['blau', 'grün', 'gelb'] },
  { q: 'Was bedeutet „chat"?', r: 'Katze', f: ['Hund', 'Pferd', 'Vogel'] },
  { q: 'Was bedeutet „école"?', r: 'Schule', f: ['Kirche', 'Markt', 'Bahnhof'] },
];
const GRAMMATIK_BANK = [
  { q: 'Welcher bestimmte Artikel passt zu „maison" (weiblich)?', r: 'la', f: ['le', 'les', 'un'], h: 'Weibliche Nomen: la maison.' },
  { q: 'Welcher Artikel passt zu „livre" (männlich)?', r: 'le', f: ['la', 'les', 'une'], h: 'Männliche Nomen: le livre.' },
  { q: 'Wie heißt „ich bin" auf Französisch?', r: 'je suis', f: ['tu es', 'il est', 'nous sommes'], h: 'être: je suis, tu es, il/elle est …' },
  { q: 'Wie heißt „ich habe" auf Französisch?', r: 'j’ai', f: ['tu as', 'il a', 'vous avez'], h: 'avoir: j’ai, tu as, il a …' },
  { q: 'Welche Zeitform beschreibt das passé composé?', r: 'die abgeschlossene Vergangenheit', f: ['die Zukunft', 'die Gegenwart', 'den Befehl'], h: 'Gebildet mit avoir/être + Partizip.' },
  { q: 'Wie lautet der Plural-Artikel (bestimmt)?', r: 'les', f: ['le', 'la', 'des'], h: 'les maisons, les livres.' },
  { q: 'Wie heißt „nicht" in der Verneinung (ne … ___)?', r: 'pas', f: ['plus', 'rien', 'jamais'], h: 'ne … pas umschließt das Verb: je ne sais pas.' },
  { q: 'Was ist „grand" für eine Wortart?', r: 'Adjektiv', f: ['Verb', 'Nomen', 'Artikel'], h: 'grand/grande = groß.' },
  { q: 'Wie bildet man oft die weibliche Form eines Adjektivs?', r: 'durch Anhängen von -e', f: ['durch Anhängen von -s', 'durch Voranstellen von la', 'gar nicht'], h: 'grand → grande, petit → petite.' },
];
const LANDESKUNDE_BANK = [
  { q: 'Wie heißt die Hauptstadt Frankreichs?', r: 'Paris', f: ['Lyon', 'Marseille', 'Nizza'] },
  { q: 'Welche Farben hat die französische Flagge?', r: 'Blau-Weiß-Rot', f: ['Schwarz-Rot-Gold', 'Grün-Weiß-Rot', 'Rot-Gelb'] },
  { q: 'Wie heißt die französische Nationalhymne?', r: 'La Marseillaise', f: ['La Parisienne', 'Le Drapeau', 'La République'] },
  { q: 'Welches Bauwerk ist ein Wahrzeichen von Paris?', r: 'der Eiffelturm', f: ['der Big Ben', 'das Kolosseum', 'die Sagrada Família'] },
  { q: 'Wer schrieb „Les Misérables"?', r: 'Victor Hugo', f: ['Albert Camus', 'Molière', 'Voltaire'] },
  { q: 'Wer schrieb „L’Étranger" (Der Fremde)?', r: 'Albert Camus', f: ['Victor Hugo', 'Jean-Paul Sartre', 'Émile Zola'] },
  { q: 'Wie lautet das Motto der Französischen Republik?', r: 'Liberté, Égalité, Fraternité', f: ['Einigkeit und Recht und Freiheit', 'Dieu et mon droit', 'In Vielfalt geeint'] },
  { q: 'Wie heißt der französische Nationalfeiertag (14. Juli)?', r: 'der Sturm auf die Bastille / Fête nationale', f: ['Allerheiligen', 'der Tag der Republik im Mai', 'Pfingsten'] },
  { q: 'In welchem Land außer Frankreich ist Französisch ebenfalls Amtssprache?', r: 'Belgien', f: ['Portugal', 'Polen', 'Griechenland'] },
];

export const franzoesischModul = erzeugeSprachModul({
  id: 'franzoesisch', name: 'Französisch', icon: '🥖', farbe: '#5e72c8',
  konzept: 'Buchstaben-Zauber hüpfen über den Acker; Aufgaben zu Vokabeln, Grammatik und Landeskunde/Literatur.',
  themen: [
    { id: 'vokabeln', name: 'Vocabulaire (Wortschatz)' },
    { id: 'grammatik', name: 'Grammaire' },
    { id: 'landeskunde', name: 'Civilisation & Littérature' },
  ],
  banks: { vokabeln: VOKABELN_BANK, grammatik: GRAMMATIK_BANK, landeskunde: LANDESKUNDE_BANK },
  woerterKurz: ['BONJOUR', 'MERCI', 'PARIS', 'AMI', 'PAIN', 'ROUGE', 'CHAT'],
  woerterLang: ['LIBERTE', 'FRATERNITE', 'BAGUETTE', 'REVOLUTION', 'BONHEUR'],
  zauber: {
    wort: { name: 'Mot magique', icon: '📜' },
    salat: { name: 'Salade de lettres', icon: '🥗' },
    satz: { name: 'Phrase magique', icon: '📖' },
  },
});

export default franzoesischModul;
