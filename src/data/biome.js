// =============================================================================
// biome.js — Datengetriebene Karten / Biome (FACH-UNABHÄNGIG)
// -----------------------------------------------------------------------------
// Jedes Biom hat EIGENE Pflanzen, eine Pastell-Palette und Freischaltkosten in
// 💰 Geld. Die Karten sind bewusst NICHT an ein Schulfach gekoppelt — man spielt
// sie unabhängig vom aktiven Fach. Spätere Karten kosten mehr zum Freischalten,
// dafür bringen ihre Pflanzen deutlich mehr Geld auf dem Markt (Wirtschafts-Loop).
//   kosten : einmalige Freischaltkosten in Geld (bauernhof = 0, dann steigend)
// =============================================================================

export const BIOME = {
  bauernhof: {
    id: 'bauernhof', name: 'Bauernhof', icon: '🌻',
    beschreibung: 'Die Heimatscholle — günstige Standardpflanzen.',
    freigeschaltet: true, kosten: 0,
    pflanzen: ['weizen', 'mais', 'kartoffel', 'karotte', 'kuerbis', 'wassermelone'],
    palette: { boden: 0x9bdc8b, boden2: 0x8ace7d, himmel: 0xbfeef5, nebel: 0xd2f0f0 },
  },
  herbstwald: {
    id: 'herbstwald', name: 'Herbstwald', icon: '🍂',
    beschreibung: 'Goldene Wälder — Obst und Pilze für besseres Geld.',
    freigeschaltet: false, kosten: 200,
    pflanzen: ['apfel', 'birne', 'waldpilz', 'weintraube'],
    palette: { boden: 0xd9a05b, boden2: 0xc98a45, himmel: 0xf3d6b0, nebel: 0xead4b8 },
  },
  kristallfelder: {
    id: 'kristallfelder', name: 'Kristallfelder', icon: '💎',
    beschreibung: 'Glitzernde Ebenen mit wertvollen Kristallpflanzen.',
    freigeschaltet: false, kosten: 700,
    pflanzen: ['kristallbeere', 'eisblume', 'polarbeere', 'frostkristall'],
    palette: { boden: 0x9fd6e8, boden2: 0x8ec6e0, himmel: 0xdff6ff, nebel: 0xcfeefc },
  },
  vulkanregion: {
    id: 'vulkanregion', name: 'Vulkanregion', icon: '🌋',
    beschreibung: 'Heiße Asche-Felder — feurige Früchte mit hohem Wert.',
    freigeschaltet: false, kosten: 2000,
    pflanzen: ['chili', 'aschenkorn', 'glutbeere', 'lavafrucht'],
    palette: { boden: 0xc56a4f, boden2: 0xb05438, himmel: 0xf2c2a0, nebel: 0xe6b090 },
  },
  himmelsinseln: {
    id: 'himmelsinseln', name: 'Himmelsinseln', icon: '☁️',
    beschreibung: 'Schwebende Inseln mit luftigen, kostbaren Gewächsen.',
    freigeschaltet: false, kosten: 5500,
    pflanzen: ['wolkenbeere', 'windblume', 'federfrucht', 'sternfrucht'],
    palette: { boden: 0xbfe6c9, boden2: 0xa9dcbb, himmel: 0xcdeaff, nebel: 0xdaf0ff },
  },
  sternenfelder: {
    id: 'sternenfelder', name: 'Sternenfelder', icon: '✨',
    beschreibung: 'Kosmische Felder — die wertvollsten Pflanzen überhaupt.',
    freigeschaltet: false, kosten: 14000,
    pflanzen: ['mondblume', 'sternkraut', 'kometfrucht', 'galaxiebluete'],
    palette: { boden: 0x6a5fae, boden2: 0x5b51a0, himmel: 0x2b2b55, nebel: 0x3a3a66 },
  },
};

export const BIOME_LISTE = Object.values(BIOME);
