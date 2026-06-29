// =============================================================================
// erfolge.js — Datengetriebene Erfolge / Achievements
// -----------------------------------------------------------------------------
// Jeder Erfolg prüft den Spielstand und schaltet sich EINMALIG frei. Statt eines
// einmaligen Geld-/Wissen-Betrags geben Erfolge jetzt DAUERHAFTE PROZENT-BONI in
// einer Kategorie — z. B. „+5 % Verkaufserlös". Schwerere Erfolge geben mehr.
// Die Boni summieren sich (core/erfolge.js: berechneErfolgEffekte) und fließen in
// die Effekt-Multiplikatoren ein (Verkauf, Wissen, Essenz, XP).
//   pruefe(state, ctx): boolean   — Bedingung; ctx = abgeleitete Gesamtzahlen
//   ctx = { pflanzenGesamt, spezialGesamt, faecherGesamt, biomeGesamt, ackerMax }
//   bonus (optional): { geld?, wissen?, essenz?, xp? }  — Brüche (0.05 = +5 %)
//     geld   → mehr Verkaufserlös (Markt)
//     wissen → mehr Wissen aus Aufgaben
//     essenz → mehr Essenz aus Gewächshaus-Ernten
//     xp     → mehr Erfahrung (XP)
// =============================================================================

const distinct = (arr) => new Set(arr || []).size;

export const ERFOLGE = {
  // --- Lernen / Aufgaben -----------------------------------------------------
  erste_aufgabe: {
    id: 'erste_aufgabe', name: 'Erster Gedanke', icon: '🧠',
    beschreibung: 'Beantworte deine erste Aufgabe.',
    pruefe: (s) => (s.aufgabenGesamt || 0) >= 1,
    bonus: { wissen: 0.02 },
  },
  lerneifer: {
    id: 'lerneifer', name: 'Lerneifer', icon: '📗',
    beschreibung: 'Löse 10 Aufgaben richtig.',
    pruefe: (s) => (s.aufgabenRichtig || 0) >= 10,
    bonus: { wissen: 0.03 },
  },
  fleissbiene: {
    id: 'fleissbiene', name: 'Fleißbiene', icon: '🐝',
    beschreibung: 'Löse 100 Aufgaben richtig.',
    pruefe: (s) => (s.aufgabenRichtig || 0) >= 100,
    bonus: { wissen: 0.05 },
  },
  gelehrter: {
    id: 'gelehrter', name: 'Gelehrter', icon: '🎓',
    beschreibung: 'Löse 500 Aufgaben richtig.',
    pruefe: (s) => (s.aufgabenRichtig || 0) >= 500,
    bonus: { wissen: 0.10 },
  },
  auf_der_welle: {
    id: 'auf_der_welle', name: 'Auf der Welle', icon: '🔥',
    beschreibung: 'Erreiche eine Serie von 10 richtigen Antworten.',
    pruefe: (s) => (s.serieRekord || 0) >= 10,
    bonus: { geld: 0.05 },
  },
  unaufhaltsam: {
    id: 'unaufhaltsam', name: 'Unaufhaltsam', icon: '⚡',
    beschreibung: 'Erreiche eine Serie von 25 richtigen Antworten.',
    pruefe: (s) => (s.serieRekord || 0) >= 25,
    bonus: { geld: 0.10 },
  },

  // --- Ernte -----------------------------------------------------------------
  erste_ernte: {
    id: 'erste_ernte', name: 'Erste Ernte', icon: '🌱',
    beschreibung: 'Ernte deine erste Pflanze.',
    pruefe: (s) => (s.gesamtErnten || 0) >= 1,
    bonus: { geld: 0.02 },
  },
  erntehelfer: {
    id: 'erntehelfer', name: 'Erntehelfer', icon: '🌾',
    beschreibung: 'Ernte insgesamt 100 Pflanzen.',
    pruefe: (s) => (s.gesamtErnten || 0) >= 100,
    bonus: { geld: 0.03 },
  },
  grossbauer: {
    id: 'grossbauer', name: 'Großbauer', icon: '🚜',
    beschreibung: 'Ernte insgesamt 1000 Pflanzen.',
    pruefe: (s) => (s.gesamtErnten || 0) >= 1000,
    bonus: { geld: 0.08 },
  },
  grossgrundbesitzer: {
    id: 'grossgrundbesitzer', name: 'Großgrundbesitzer', icon: '🏞️',
    beschreibung: 'Vergrößere den Acker bis zum Maximum.',
    pruefe: (s, ctx) => (s.ackerRadius || 8) >= (ctx.ackerMax || 16),
    bonus: { geld: 0.05 },
  },

  // --- Zauber ----------------------------------------------------------------
  funkenflug: {
    id: 'funkenflug', name: 'Funkenflug', icon: '✨',
    beschreibung: 'Wirke deinen ersten Zauber.',
    pruefe: (s) => distinct(s.gewirkteZauber) >= 1,
    bonus: { xp: 0.03 },
  },
  flaechendeckend: {
    id: 'flaechendeckend', name: 'Flächendeckend', icon: '🟧',
    beschreibung: 'Wirke den Flächenzauber (Integral).',
    pruefe: (s) => (s.gewirkteZauber || []).includes('integral'),
    bonus: { wissen: 0.05 },
  },
  regenmacher: {
    id: 'regenmacher', name: 'Regenmacher', icon: '🌧️',
    beschreibung: 'Wirke einen Regen-Zauber.',
    pruefe: (s) => (s.gewirkteFormen || []).includes('regen'),
    bonus: { essenz: 0.03 },
  },
  kegelwerfer: {
    id: 'kegelwerfer', name: 'Kegelwerfer', icon: '🔦',
    beschreibung: 'Wirke einen Kegel-Zauber.',
    pruefe: (s) => (s.gewirkteFormen || []).includes('kegel'),
    bonus: { essenz: 0.03 },
  },
  formvollendet: {
    id: 'formvollendet', name: 'Formvollendet', icon: '🔱',
    beschreibung: 'Wirke Zauber in 6 verschiedenen Formen.',
    pruefe: (s) => distinct(s.gewirkteFormen) >= 6,
    bonus: { xp: 0.08 },
  },
  zaubermeister: {
    id: 'zaubermeister', name: 'Zaubermeister', icon: '🪄',
    beschreibung: 'Wirke 12 verschiedene Zauber.',
    pruefe: (s) => distinct(s.gewirkteZauber) >= 12,
    bonus: { wissen: 0.08 },
  },

  // --- Fächer ----------------------------------------------------------------
  faecherwechsel: {
    id: 'faecherwechsel', name: 'Fächerwechsel', icon: '🔄',
    beschreibung: 'Spiele 2 verschiedene Fächer.',
    pruefe: (s) => distinct(s.gespielteFaecher) >= 2,
    bonus: { xp: 0.03 },
  },
  allrounder: {
    id: 'allrounder', name: 'Allrounder', icon: '🎒',
    beschreibung: 'Spiele 5 verschiedene Fächer.',
    pruefe: (s) => distinct(s.gespielteFaecher) >= 5,
    bonus: { wissen: 0.05 },
  },
  universalgelehrter: {
    id: 'universalgelehrter', name: 'Universalgelehrter', icon: '🌐',
    beschreibung: 'Spiele jedes verfügbare Fach mindestens einmal.',
    pruefe: (s, ctx) => distinct(s.gespielteFaecher) >= (ctx.faecherGesamt || 17),
    bonus: { wissen: 0.15 },
  },

  // --- Sammlung & Wirtschaft -------------------------------------------------
  seltenes_gewaechs: {
    id: 'seltenes_gewaechs', name: 'Seltenes Gewächs', icon: '🌟',
    beschreibung: 'Entdecke deine erste Spezialpflanze.',
    pruefe: (s) => (s.spezialSammlung || []).length >= 1,
    bonus: { essenz: 0.03 },
  },
  sammler: {
    id: 'sammler', name: 'Sammler', icon: '📦',
    beschreibung: 'Entdecke 10 verschiedene Spezialpflanzen.',
    pruefe: (s) => distinct(s.spezialSammlung) >= 10,
    bonus: { essenz: 0.08 },
  },
  vollstaendige_sammlung: {
    id: 'vollstaendige_sammlung', name: 'Vollständige Sammlung', icon: '🏆',
    beschreibung: 'Entdecke alle Spezialpflanzen.',
    pruefe: (s, ctx) => distinct(s.spezialSammlung) >= (ctx.spezialGesamt || 999),
    bonus: { essenz: 0.20 },
  },
  botaniker: {
    id: 'botaniker', name: 'Botaniker', icon: '📖',
    beschreibung: 'Entdecke alle normalen Pflanzenarten.',
    pruefe: (s, ctx) => distinct(s.entdecktePflanzen) >= (ctx.pflanzenGesamt || 999),
    bonus: { geld: 0.08 },
  },
  weltenbummler: {
    id: 'weltenbummler', name: 'Weltenbummler', icon: '🗺️',
    beschreibung: 'Schalte alle Karten/Biome frei.',
    pruefe: (s, ctx) => (s.freigeschalteteBiome || []).length >= (ctx.biomeGesamt || 6),
    bonus: { geld: 0.10 },
  },
  erwachtes_talent: {
    id: 'erwachtes_talent', name: 'Erwachtes Talent', icon: '🌳',
    beschreibung: 'Schalte deinen ersten Skill im Skill-Baum frei.',
    pruefe: (s) => Object.values(s.skills || {}).some((stufe) => stufe > 0),
    bonus: { essenz: 0.05 },
  },
  wohlhabend: {
    id: 'wohlhabend', name: 'Wohlhabend', icon: '💰',
    beschreibung: 'Besitze gleichzeitig 2000 Geld.',
    pruefe: (s) => (s.geld || 0) >= 2000,
    bonus: { geld: 0.05 },
  },
};

export const ERFOLG_LISTE = Object.values(ERFOLGE);

// Summiert die Prozent-Boni aller freigeschalteten Erfolge je Kategorie.
// Rückgabe: { geld, wissen, essenz, xp } als Brüche (0.05 = +5 %).
export function berechneErfolgEffekte(freigeschaltet = []) {
  const summe = { geld: 0, wissen: 0, essenz: 0, xp: 0 };
  for (const id of freigeschaltet) {
    const e = ERFOLGE[id];
    if (!e || !e.bonus) continue;
    for (const k of Object.keys(summe)) if (e.bonus[k]) summe[k] += e.bonus[k];
  }
  return summe;
}
