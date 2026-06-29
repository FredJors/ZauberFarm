// =============================================================================
// kosmetik.js — Kosmetische Gegenstände (pro Fach) + Titel (level-abhängig)
// -----------------------------------------------------------------------------
// Jedes Fach schenkt EINEN kosmetischen Gegenstand, sobald man in ALLEN Bereichen
// (Themen) dieses Fachs mindestens das geforderte Niveau erreicht (Standard: 5).
// Ein Gegenstand belegt einen von drei Slots: 'stab' (Zauberstab), 'hut' (Hut)
// oder 'kutte' (Kleidung). Das Aussehen liefert avatar.js über { kind, farbe }.
//   { id, fachId, slot, kind, farbe, name, icon, niveau }
// =============================================================================

export const KOSMETIK = {
  // --- Zauberstäbe -----------------------------------------------------------
  mathe_lineal: { id: 'mathe_lineal', fachId: 'mathe', slot: 'stab', kind: 'lineal', farbe: 0xe8c46a, name: 'Lineal-Zauberstab', icon: '📏' },
  chemie_reagenz: { id: 'chemie_reagenz', fachId: 'chemie', slot: 'stab', kind: 'reagenz', farbe: 0x7be0a0, name: 'Reagenzglas-Stab', icon: '🧪' },
  deutsch_feder: { id: 'deutsch_feder', fachId: 'deutsch', slot: 'stab', kind: 'feder', farbe: 0xf0e6c0, name: 'Federkiel-Stab', icon: '🪶' },
  franzoesisch_baguette: { id: 'franzoesisch_baguette', fachId: 'franzoesisch', slot: 'stab', kind: 'baguette', farbe: 0xd9a86a, name: 'Baguette-Stab', icon: '🥖' },
  musik_taktstock: { id: 'musik_taktstock', fachId: 'musik', slot: 'stab', kind: 'taktstock', farbe: 0xffffff, name: 'Taktstock', icon: '🎵' },
  kunst_pinsel: { id: 'kunst_pinsel', fachId: 'kunst', slot: 'stab', kind: 'pinsel', farbe: 0xff7ab0, name: 'Pinsel-Stab', icon: '🖌️' },
  erdkunde_globus: { id: 'erdkunde_globus', fachId: 'erdkunde', slot: 'stab', kind: 'globus', farbe: 0x4f9be0, name: 'Globus-Stab', icon: '🌍' },

  // --- Hüte ------------------------------------------------------------------
  englisch_zylinder: { id: 'englisch_zylinder', fachId: 'englisch', slot: 'hut', kind: 'zylinder', farbe: 0x2c2a28, name: 'Gentleman-Zylinder', icon: '🎩' },
  latein_kranz: { id: 'latein_kranz', fachId: 'latein', slot: 'hut', kind: 'kranz', farbe: 0xc9b24a, name: 'Lorbeerkranz', icon: '🏛️' },
  spanisch_sombrero: { id: 'spanisch_sombrero', fachId: 'spanisch', slot: 'hut', kind: 'sombrero', farbe: 0xe0a13a, name: 'Sombrero', icon: '🎉' },
  physik_helm: { id: 'physik_helm', fachId: 'physik', slot: 'hut', kind: 'helm', farbe: 0x9fd0d6, name: 'Forscher-Helm', icon: '⚛️' },
  geschichte_ritterhelm: { id: 'geschichte_ritterhelm', fachId: 'geschichte', slot: 'hut', kind: 'helm', farbe: 0xb8b8c2, name: 'Ritterhelm', icon: '🏰' },
  werte_normen_denkerhut: { id: 'werte_normen_denkerhut', fachId: 'werte_normen', slot: 'hut', kind: 'spitzhut', farbe: 0x8f7cc8, name: 'Denker-Hut', icon: '🤔' },

  // --- Kutten / Kleidung -----------------------------------------------------
  biologie_blattkutte: { id: 'biologie_blattkutte', fachId: 'biologie', slot: 'kutte', kind: 'blatt', farbe: 0x6abf5a, name: 'Blätter-Kutte', icon: '🌿' },
  informatik_datenkutte: { id: 'informatik_datenkutte', fachId: 'informatik', slot: 'kutte', kind: 'bit', farbe: 0x5b6dd6, name: 'Daten-Kutte', icon: '💻' },
  politik_wirtschaft_robe: { id: 'politik_wirtschaft_robe', fachId: 'politik_wirtschaft', slot: 'kutte', kind: 'anzug', farbe: 0x44506b, name: 'Diplomaten-Robe', icon: '⚖️' },
  religion_moenchskutte: { id: 'religion_moenchskutte', fachId: 'religion', slot: 'kutte', kind: 'moench', farbe: 0x8a6a44, name: 'Mönchs-Kutte', icon: '✝️' },
};

export const KOSMETIK_LISTE = Object.values(KOSMETIK);
export const SLOT_NAMEN = { stab: '🪄 Zauberstab', hut: '🎩 Hut', kutte: '🧥 Kutte' };
export const KOSMETIK_NIVEAU = 5; // gefordertes Niveau in JEDEM Bereich des Fachs

// --- Titel (abhängig vom Spieler-Level) -------------------------------------
export const TITEL = [
  { ab: 1, name: 'Zauber-Novize' },
  { ab: 5, name: 'Zauber-Lehrling' },
  { ab: 10, name: 'Zauber-Geselle' },
  { ab: 18, name: 'Zauber-Adept' },
  { ab: 28, name: 'Zauber-Magier' },
  { ab: 42, name: 'Erz-Magier' },
  { ab: 60, name: 'Meister-Zauberer' },
];

// Höchster erreichter Titel für ein Level.
export function titelFuer(level = 1) {
  let titel = TITEL[0];
  for (const t of TITEL) if (level >= t.ab) titel = t;
  return titel.name;
}

// Nächster Titel + benötigtes Level (oder null, wenn schon maximal).
export function naechsterTitel(level = 1) {
  for (const t of TITEL) if (level < t.ab) return t;
  return null;
}

// Löst die angelegten Kosmetik-IDs in eine avatar.js-Konfiguration auf.
//   angelegt = { stab, hut, kutte } (IDs oder null)
export function loeseKosmetikAuf(angelegt = {}) {
  const cfg = {};
  for (const slot of ['stab', 'hut', 'kutte']) {
    const item = angelegt[slot] && KOSMETIK[angelegt[slot]];
    cfg[slot] = item ? { kind: item.kind, farbe: item.farbe } : null;
  }
  return cfg;
}
