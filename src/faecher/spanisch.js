// =============================================================================
// spanisch.js — Vollständiges Fach Spanisch (über die Sprachfabrik)
// -----------------------------------------------------------------------------
// Buchstaben-Zauber wie die übrigen Sprachen; Aufgaben zu Vokabeln, Grammatik
// und Landeskunde/Kultur. Daten-only — Mechanik aus erzeugeSprachModul().
// =============================================================================

import { erzeugeSprachModul } from './sprachfabrik.js';

const VOCABULARIO_BANK = [
  { q: 'Was bedeutet das spanische Wort „casa"?', r: 'Haus', f: ['Schule', 'Stadt', 'Straße'] },
  { q: 'Was bedeutet „agua"?', r: 'Wasser', f: ['Feuer', 'Wein', 'Milch'] },
  { q: 'Was bedeutet „perro"?', r: 'Hund', f: ['Katze', 'Pferd', 'Vogel'] },
  { q: 'Was bedeutet „libro"?', r: 'Buch', f: ['Stift', 'Tisch', 'Tür'] },
  { q: 'Was bedeutet „amigo"?', r: 'Freund', f: ['Feind', 'Bruder', 'Nachbar'] },
  { q: 'Wie heißt „danke" auf Spanisch?', r: 'gracias', f: ['hola', 'adiós', 'por favor'] },
  { q: 'Wie heißt „hallo" auf Spanisch?', r: 'hola', f: ['gracias', 'buenas noches', 'adiós'] },
  { q: 'Was bedeutet die Farbe „rojo"?', r: 'rot', f: ['blau', 'grün', 'gelb'] },
  { q: 'Was bedeutet „escuela"?', r: 'Schule', f: ['Kirche', 'Bahnhof', 'Geschäft'] },
  { q: 'Was bedeutet „sol"?', r: 'Sonne', f: ['Mond', 'Stern', 'Wolke'] },
];
const GRAMATICA_BANK = [
  { q: 'Welcher bestimmte Artikel passt zu „casa" (weiblich)?', r: 'la', f: ['el', 'los', 'un'], h: 'Weiblich: la casa.' },
  { q: 'Welcher Artikel passt zu „libro" (männlich)?', r: 'el', f: ['la', 'las', 'una'], h: 'Männlich: el libro.' },
  { q: 'Wie heißt „ich bin" (Eigenschaft) auf Spanisch?', r: 'yo soy', f: ['yo estoy', 'tú eres', 'él es'], h: 'ser für dauerhafte Eigenschaften: yo soy.' },
  { q: 'Welches Verb nutzt man für vorübergehende Zustände/Orte?', r: 'estar', f: ['ser', 'tener', 'hacer'], h: 'estar = sein (Ort/Zustand): estoy en casa.' },
  { q: 'Wie heißt „ich habe" auf Spanisch?', r: 'tengo', f: ['tienes', 'tiene', 'tenemos'], h: 'tener: tengo, tienes, tiene …' },
  { q: 'Wie lautet die 1. Person Singular von „hablar" (sprechen)?', r: 'hablo', f: ['hablas', 'habla', 'hablamos'], h: '-ar-Verben: hablo, hablas, habla …' },
  { q: 'Wie bildet man meist den Plural von Nomen auf Vokal?', r: 'durch Anhängen von -s', f: ['durch Anhängen von -en', 'durch Voranstellen von los', 'gar nicht'], h: 'casa → casas, perro → perros.' },
  { q: 'Wie lautet der bestimmte Plural-Artikel (weiblich)?', r: 'las', f: ['los', 'la', 'unas'], h: 'las casas.' },
  { q: 'Was bedeutet „no" in der Verneinung?', r: 'nicht / kein', f: ['ja', 'vielleicht', 'sehr'], h: 'No hablo español = Ich spreche kein Spanisch.' },
];
const CULTURA_BANK = [
  { q: 'Wie heißt die Hauptstadt Spaniens?', r: 'Madrid', f: ['Barcelona', 'Sevilla', 'Valencia'] },
  { q: 'Wer schrieb „Don Quijote"?', r: 'Miguel de Cervantes', f: ['Federico García Lorca', 'Pablo Neruda', 'Gabriel García Márquez'] },
  { q: 'Welcher Architekt entwarf die Sagrada Família in Barcelona?', r: 'Antoni Gaudí', f: ['Pablo Picasso', 'Salvador Dalí', 'Diego Velázquez'] },
  { q: 'Welcher Tanz stammt aus Andalusien (Südspanien)?', r: 'Flamenco', f: ['Tango', 'Salsa', 'Samba'] },
  { q: 'Auf welchem Kontinent wird außer in Spanien viel Spanisch gesprochen?', r: 'in Lateinamerika', f: ['in Australien', 'in Skandinavien', 'in Ostasien'] },
  { q: 'Welcher kolumbianische Autor schrieb „Hundert Jahre Einsamkeit"?', r: 'Gabriel García Márquez', f: ['Miguel de Cervantes', 'Mario Vargas Llosa', 'Jorge Luis Borges'] },
  { q: 'Wie nennt man die spanische Mittagsruhe?', r: 'die Siesta', f: ['die Fiesta', 'die Tapas', 'die Plaza'] },
  { q: 'Was sind „tapas"?', r: 'kleine spanische Häppchen/Vorspeisen', f: ['ein Tanz', 'eine Stierkampfart', 'ein Feiertag'] },
  { q: 'Welche Sprache ist mit dem Spanischen eng verwandt?', r: 'Portugiesisch', f: ['Niederländisch', 'Polnisch', 'Griechisch'] },
];

export const spanischModul = erzeugeSprachModul({
  id: 'spanisch', name: 'Spanisch', icon: '💃', farbe: '#e0a13a',
  konzept: 'Buchstaben-Zauber hüpfen über den Acker; Aufgaben zu Vokabeln, Grammatik und Landeskunde.',
  themen: [
    { id: 'vocabulario', name: 'Vocabulario (Wortschatz)' },
    { id: 'gramatica', name: 'Gramática' },
    { id: 'cultura', name: 'Cultura & Literatura' },
  ],
  banks: { vocabulario: VOCABULARIO_BANK, gramatica: GRAMATICA_BANK, cultura: CULTURA_BANK },
  woerterKurz: ['HOLA', 'CASA', 'GATO', 'ROJO', 'AMIGO', 'SOL'],
  woerterLang: ['BIENVENIDO', 'MARIPOSA', 'CORAZON', 'LIBERTAD', 'FIESTA'],
  zauber: {
    wort: { name: 'Palabra mágica', icon: '📜' },
    salat: { name: 'Ensalada de letras', icon: '🥗' },
    satz: { name: 'Frase mágica', icon: '📖' },
  },
});

export default spanischModul;
