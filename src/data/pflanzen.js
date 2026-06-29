// =============================================================================
// pflanzen.js — Datengetriebene Pflanzen-Definitionen (Standard-Acker)
// -----------------------------------------------------------------------------
// Jede Pflanze beschreibt nur DATEN. Render und Logik lesen diese Felder aus,
// dadurch lassen sich neue Pflanzen rein über Daten hinzufügen.
//   wachstumMs : Zeit von Aussaat bis "erntereif"
//   wert       : Verkaufspreis auf dem Markt (Geld)
//   seltenheit : 1 = häufig ... 5 = selten (steuert Spawn-Häufigkeit)
//   xp         : Erfahrungspunkte pro Ernte
//   farbe/hoehe/form : Low-Poly-Platzhalter-Optik (austauschbar gegen Assets)
// =============================================================================

export const PFLANZEN = {
  weizen: {
    id: 'weizen', name: 'Weizen', emoji: '🌾',
    wachstumMs: 8000, wert: 4, seltenheit: 1, xp: 2,
    farbe: 0xe7c65a, hoehe: 0.8, form: 'halme',
  },
  mais: {
    id: 'mais', name: 'Mais', emoji: '🌽',
    wachstumMs: 12000, wert: 7, seltenheit: 2, xp: 3,
    farbe: 0xf2d24b, hoehe: 1.0, form: 'kolben',
  },
  kartoffel: {
    id: 'kartoffel', name: 'Kartoffeln', emoji: '🥔',
    wachstumMs: 10000, wert: 6, seltenheit: 2, xp: 3,
    farbe: 0xb9874f, hoehe: 0.5, form: 'knolle',
  },
  karotte: {
    id: 'karotte', name: 'Karotten', emoji: '🥕',
    wachstumMs: 9000, wert: 5, seltenheit: 2, xp: 3,
    farbe: 0xf09040, hoehe: 0.6, form: 'spitz',
  },
  kuerbis: {
    id: 'kuerbis', name: 'Kürbisse', emoji: '🎃',
    wachstumMs: 16000, wert: 12, seltenheit: 3, xp: 5,
    farbe: 0xf0852e, hoehe: 0.7, form: 'kugel',
  },
  wassermelone: {
    id: 'wassermelone', name: 'Wassermelonen', emoji: '🍉',
    wachstumMs: 20000, wert: 18, seltenheit: 4, xp: 7,
    farbe: 0x4caf50, hoehe: 0.65, form: 'kugel',
  },

  // --- Herbstwald (höherwertige Ernte) ---------------------------------------
  apfel: { id: 'apfel', name: 'Äpfel', emoji: '🍎', wachstumMs: 14000, wert: 22, seltenheit: 2, xp: 8, farbe: 0xe2503b, hoehe: 0.7, form: 'kugel' },
  birne: { id: 'birne', name: 'Birnen', emoji: '🍐', wachstumMs: 15000, wert: 26, seltenheit: 2, xp: 9, farbe: 0xc6d24b, hoehe: 0.7, form: 'kugel' },
  waldpilz: { id: 'waldpilz', name: 'Waldpilze', emoji: '🍄', wachstumMs: 17000, wert: 30, seltenheit: 3, xp: 10, farbe: 0xd66a5a, hoehe: 0.5, form: 'knolle' },
  weintraube: { id: 'weintraube', name: 'Weintrauben', emoji: '🍇', wachstumMs: 19000, wert: 36, seltenheit: 4, xp: 12, farbe: 0x8e5fd0, hoehe: 0.6, form: 'kugel' },

  // --- Kristallfelder --------------------------------------------------------
  kristallbeere: { id: 'kristallbeere', name: 'Kristallbeeren', emoji: '🔷', wachstumMs: 18000, wert: 60, seltenheit: 3, xp: 16, farbe: 0x7fd6e8, hoehe: 0.6, form: 'kugel' },
  eisblume: { id: 'eisblume', name: 'Eisblumen', emoji: '❄️', wachstumMs: 20000, wert: 72, seltenheit: 3, xp: 18, farbe: 0xbfeaff, hoehe: 0.7, form: 'spitz' },
  polarbeere: { id: 'polarbeere', name: 'Polarbeeren', emoji: '🫐', wachstumMs: 22000, wert: 80, seltenheit: 4, xp: 20, farbe: 0x5b7fd0, hoehe: 0.55, form: 'kugel' },
  frostkristall: { id: 'frostkristall', name: 'Frostkristalle', emoji: '💎', wachstumMs: 24000, wert: 95, seltenheit: 5, xp: 24, farbe: 0x9fe0f0, hoehe: 0.8, form: 'spitz' },

  // --- Vulkanregion ----------------------------------------------------------
  chili: { id: 'chili', name: 'Feuer-Chilis', emoji: '🌶️', wachstumMs: 22000, wert: 130, seltenheit: 3, xp: 30, farbe: 0xd83a2a, hoehe: 0.7, form: 'spitz' },
  aschenkorn: { id: 'aschenkorn', name: 'Aschenkörner', emoji: '🟤', wachstumMs: 24000, wert: 150, seltenheit: 3, xp: 34, farbe: 0x7a5a4a, hoehe: 0.6, form: 'halme' },
  glutbeere: { id: 'glutbeere', name: 'Glutbeeren', emoji: '🔥', wachstumMs: 26000, wert: 175, seltenheit: 4, xp: 40, farbe: 0xf06a2e, hoehe: 0.6, form: 'kugel' },
  lavafrucht: { id: 'lavafrucht', name: 'Lavafrüchte', emoji: '🌋', wachstumMs: 28000, wert: 200, seltenheit: 5, xp: 46, farbe: 0xb0402a, hoehe: 0.75, form: 'kugel' },

  // --- Himmelsinseln ---------------------------------------------------------
  wolkenbeere: { id: 'wolkenbeere', name: 'Wolkenbeeren', emoji: '☁️', wachstumMs: 26000, wert: 260, seltenheit: 3, xp: 55, farbe: 0xeaf4ff, hoehe: 0.6, form: 'kugel' },
  windblume: { id: 'windblume', name: 'Windblumen', emoji: '🌬️', wachstumMs: 28000, wert: 290, seltenheit: 4, xp: 62, farbe: 0xbfe6e0, hoehe: 0.7, form: 'spitz' },
  federfrucht: { id: 'federfrucht', name: 'Federfrüchte', emoji: '🪶', wachstumMs: 30000, wert: 320, seltenheit: 4, xp: 70, farbe: 0xd6e6ff, hoehe: 0.65, form: 'spitz' },
  sternfrucht: { id: 'sternfrucht', name: 'Sternfrüchte', emoji: '⭐', wachstumMs: 32000, wert: 360, seltenheit: 5, xp: 80, farbe: 0xf2d24b, hoehe: 0.7, form: 'spitz' },

  // --- Sternenfelder ---------------------------------------------------------
  mondblume: { id: 'mondblume', name: 'Mondblumen', emoji: '🌙', wachstumMs: 30000, wert: 460, seltenheit: 3, xp: 95, farbe: 0xc9c0ff, hoehe: 0.7, form: 'spitz' },
  sternkraut: { id: 'sternkraut', name: 'Sternkraut', emoji: '✨', wachstumMs: 33000, wert: 520, seltenheit: 4, xp: 110, farbe: 0xfff0a0, hoehe: 0.6, form: 'halme' },
  kometfrucht: { id: 'kometfrucht', name: 'Kometfrüchte', emoji: '☄️', wachstumMs: 36000, wert: 580, seltenheit: 4, xp: 125, farbe: 0x9fb0ff, hoehe: 0.7, form: 'kugel' },
  galaxiebluete: { id: 'galaxiebluete', name: 'Galaxieblüten', emoji: '🌌', wachstumMs: 40000, wert: 680, seltenheit: 5, xp: 150, farbe: 0x6a5fae, hoehe: 0.8, form: 'kugel' },
};

export const PFLANZEN_LISTE = Object.values(PFLANZEN);

// Gewichtete Zufallsauswahl: häufige Pflanzen (kleine Seltenheit) werden eher
// gesät. Wird beim Nachsäen des Ackers genutzt.
export function zufallsPflanze(erlaubteIds = Object.keys(PFLANZEN), rng = Math.random) {
  const kandidaten = erlaubteIds.map((id) => PFLANZEN[id]).filter(Boolean);
  const gewichte = kandidaten.map((p) => 1 / p.seltenheit);
  const summe = gewichte.reduce((a, b) => a + b, 0);
  let r = rng() * summe;
  for (let i = 0; i < kandidaten.length; i++) {
    r -= gewichte[i];
    if (r <= 0) return kandidaten[i].id;
  }
  return kandidaten[kandidaten.length - 1].id;
}
