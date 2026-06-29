// =============================================================================
// spezialpflanzen.js — Datengetriebener Spezialpflanzen-Codex
// -----------------------------------------------------------------------------
// Spezialpflanzen droppen an Ernte-Meilensteinen und werden im Gewächshaus in
// Echtzeit großgezogen. Die Sammlung ist bewusst datengetrieben: weitere
// Pflanzen ergänzt man, indem man hier einen Eintrag hinzufügt — kein Eingriff
// in den Kern nötig (Ziel langfristig: 100+ Einträge).
//   wachstumMs : (deutlich längere) Reifezeit im Gewächshaus
//   belohnung  : { geld, wissen } bei voller Reife
//   seltenheit : 1..5 (höhere Meilensteine geben seltenere Pflanzen)
// =============================================================================

export const SPEZIALPFLANZEN = {
  mondbluete: {
    id: 'mondbluete', name: 'Mondblüte', emoji: '🌙', farbe: 0xa9b6ff,
    wachstumMs: 1000 * 60 * 30, seltenheit: 2,
    belohnung: { geld: 120, wissen: 25 },
    text: 'Öffnet ihre Blätter nur im Sternenlicht.',
  },
  sonnenkristall: {
    id: 'sonnenkristall', name: 'Sonnenkristall', emoji: '🔆', farbe: 0xffd24a,
    wachstumMs: 1000 * 60 * 45, seltenheit: 2,
    belohnung: { geld: 160, wissen: 30 },
    text: 'Speichert Sonnenwärme in facettierten Kristallblättern.',
  },
  prismarose: {
    id: 'prismarose', name: 'Prismarose', emoji: '🌹', farbe: 0xff7ab0,
    wachstumMs: 1000 * 60 * 60, seltenheit: 3,
    belohnung: { geld: 220, wissen: 45 },
    text: 'Bricht Licht in alle Farben des Funktionsspektrums.',
  },
  glühranke: {
    id: 'glühranke', name: 'Glühranke', emoji: '🔥', farbe: 0xff6a3d,
    wachstumMs: 1000 * 60 * 75, seltenheit: 3,
    belohnung: { geld: 260, wissen: 50 },
    text: 'Wächst entlang unsichtbarer Exponentialkurven.',
  },
  nebelfarn: {
    id: 'nebelfarn', name: 'Nebelfarn', emoji: '🌫️', farbe: 0xbfe0d6,
    wachstumMs: 1000 * 60 * 90, seltenheit: 3,
    belohnung: { geld: 300, wissen: 60 },
    text: 'Verschwimmt am Horizont wie ferner Nebel.',
  },
  sternklee: {
    id: 'sternklee', name: 'Sternklee', emoji: '🍀', farbe: 0x7be0a0,
    wachstumMs: 1000 * 60 * 120, seltenheit: 4,
    belohnung: { geld: 420, wissen: 90 },
    text: 'Jedes Blatt zeigt eine andere Wahrscheinlichkeit.',
  },
  vektorlilie: {
    id: 'vektorlilie', name: 'Vektorlilie', emoji: '🪻', farbe: 0xb18cff,
    wachstumMs: 1000 * 60 * 150, seltenheit: 4,
    belohnung: { geld: 520, wissen: 110 },
    text: 'Richtet ihre Blüten exakt entlang eines Richtungsvektors aus.',
  },
  integralknospe: {
    id: 'integralknospe', name: 'Integralknospe', emoji: '🪷', farbe: 0xff9ad1,
    wachstumMs: 1000 * 60 * 180, seltenheit: 5,
    belohnung: { geld: 700, wissen: 150 },
    text: 'Füllt sich langsam wie die Fläche unter einer Kurve.',
  },

  // --- Seltenheit 1 (häufig, früher Einstieg) --------------------------------
  tautulpe: {
    id: 'tautulpe', name: 'Tautulpe', emoji: '🌷', farbe: 0xff9bc0,
    wachstumMs: 1000 * 60 * 15, seltenheit: 1,
    belohnung: { geld: 70, wissen: 12 },
    text: 'Trägt am Morgen einen Tropfen Zahlentau.',
  },
  wiesenstern: {
    id: 'wiesenstern', name: 'Wiesenstern', emoji: '🌼', farbe: 0xffe06a,
    wachstumMs: 1000 * 60 * 17, seltenheit: 1,
    belohnung: { geld: 78, wissen: 13 },
    text: 'Blüht überall, wo eine Aufgabe gelöst wird.',
  },
  farnkraut: {
    id: 'farnkraut', name: 'Farnkraut', emoji: '🌿', farbe: 0x77c86a,
    wachstumMs: 1000 * 60 * 19, seltenheit: 1,
    belohnung: { geld: 84, wissen: 14 },
    text: 'Entrollt sich Schritt für Schritt wie eine Schleife.',
  },
  butterblume: {
    id: 'butterblume', name: 'Butterblume', emoji: '💮', farbe: 0xffe98a,
    wachstumMs: 1000 * 60 * 20, seltenheit: 1,
    belohnung: { geld: 90, wissen: 15 },
    text: 'Leuchtet golden am Ackerrand.',
  },
  distelhalm: {
    id: 'distelhalm', name: 'Distelhalm', emoji: '🌾', farbe: 0xd9c178,
    wachstumMs: 1000 * 60 * 22, seltenheit: 1,
    belohnung: { geld: 96, wissen: 16 },
    text: 'Wächst wild am Rand jeder Tabelle.',
  },
  windhalm: {
    id: 'windhalm', name: 'Windhalm', emoji: '🍃', farbe: 0xa6e0a0,
    wachstumMs: 1000 * 60 * 24, seltenheit: 1,
    belohnung: { geld: 100, wissen: 18 },
    text: 'Wiegt sich im leisesten Lufthauch.',
  },

  // --- Seltenheit 2 (fachthematisch) -----------------------------------------
  quantenbluete: {
    id: 'quantenbluete', name: 'Quantenblüte', emoji: '⚛️', farbe: 0x6fd6c0,
    wachstumMs: 1000 * 60 * 32, seltenheit: 2,
    belohnung: { geld: 120, wissen: 24 },
    text: 'Blüht an mehreren Orten zugleich — bis man hinsieht.',
  },
  notenblume: {
    id: 'notenblume', name: 'Notenblume', emoji: '🎶', farbe: 0x9a7bff,
    wachstumMs: 1000 * 60 * 36, seltenheit: 2,
    belohnung: { geld: 132, wissen: 26 },
    text: 'Summt eine Melodie, wenn der Wind sie streift.',
  },
  farbtulpe: {
    id: 'farbtulpe', name: 'Farbtulpe', emoji: '🎨', farbe: 0xff7ab0,
    wachstumMs: 1000 * 60 * 38, seltenheit: 2,
    belohnung: { geld: 140, wissen: 27 },
    text: 'Wechselt die Farbe mit jedem Sonnenstand.',
  },
  binaerbluete: {
    id: 'binaerbluete', name: 'Binärblüte', emoji: '🔷', farbe: 0x5b8cff,
    wachstumMs: 1000 * 60 * 40, seltenheit: 2,
    belohnung: { geld: 148, wissen: 28 },
    text: 'Ihre Blätter zählen nur in Nullen und Einsen.',
  },
  kompassblume: {
    id: 'kompassblume', name: 'Kompassblume', emoji: '🧭', farbe: 0xe08a4a,
    wachstumMs: 1000 * 60 * 42, seltenheit: 2,
    belohnung: { geld: 156, wissen: 29 },
    text: 'Zeigt stets nach Norden wie ein Breitengrad.',
  },
  moosbeere: {
    id: 'moosbeere', name: 'Moosbeere', emoji: '🫐', farbe: 0x6a7bd0,
    wachstumMs: 1000 * 60 * 44, seltenheit: 2,
    belohnung: { geld: 162, wissen: 30 },
    text: 'Klein, blau und überraschend süß.',
  },
  federfarn: {
    id: 'federfarn', name: 'Federfarn', emoji: '🪶', farbe: 0xc9e0b0,
    wachstumMs: 1000 * 60 * 46, seltenheit: 2,
    belohnung: { geld: 168, wissen: 31 },
    text: 'Leicht wie eine Feder, zäh wie ein Beweis.',
  },
  glockenklee: {
    id: 'glockenklee', name: 'Glockenklee', emoji: '🔔', farbe: 0xe0c45a,
    wachstumMs: 1000 * 60 * 48, seltenheit: 2,
    belohnung: { geld: 172, wissen: 32 },
    text: 'Läutet leise zur vollen Stunde.',
  },

  // --- Seltenheit 3 ----------------------------------------------------------
  plasmaorchidee: {
    id: 'plasmaorchidee', name: 'Plasmaorchidee', emoji: '🌺', farbe: 0xff6a8a,
    wachstumMs: 1000 * 60 * 60, seltenheit: 3,
    belohnung: { geld: 210, wissen: 44 },
    text: 'Glüht im Licht ionisierter Luft.',
  },
  saeuretulpe: {
    id: 'saeuretulpe', name: 'Säuretulpe', emoji: '🧪', farbe: 0x8ddf6a,
    wachstumMs: 1000 * 60 * 66, seltenheit: 3,
    belohnung: { geld: 230, wissen: 48 },
    text: 'Ihr Nektar färbt Indikatorpapier tiefrot.',
  },
  dna_ranke: {
    id: 'dna_ranke', name: 'DNA-Ranke', emoji: '🧬', farbe: 0x5fc8a0,
    wachstumMs: 1000 * 60 * 72, seltenheit: 3,
    belohnung: { geld: 248, wissen: 52 },
    text: 'Windet sich in einer Doppelhelix empor.',
  },
  pixelblume: {
    id: 'pixelblume', name: 'Pixelblume', emoji: '🧩', farbe: 0x6ab0e0,
    wachstumMs: 1000 * 60 * 78, seltenheit: 3,
    belohnung: { geld: 264, wissen: 55 },
    text: 'Setzt sich Blatt für Blatt aus Kacheln zusammen.',
  },
  ruinenrose: {
    id: 'ruinenrose', name: 'Ruinenrose', emoji: '🏛️', farbe: 0xc7a36a,
    wachstumMs: 1000 * 60 * 84, seltenheit: 3,
    belohnung: { geld: 280, wissen: 58 },
    text: 'Blüht zwischen den Säulen alter Zeit.',
  },
  gletscherglocke: {
    id: 'gletscherglocke', name: 'Gletscherglocke', emoji: '🧊', farbe: 0x9fe0ee,
    wachstumMs: 1000 * 60 * 90, seltenheit: 3,
    belohnung: { geld: 296, wissen: 62 },
    text: 'Klingt hell wie brechendes Eis.',
  },
  vokabelveilchen: {
    id: 'vokabelveilchen', name: 'Vokabelveilchen', emoji: '📜', farbe: 0xb38cff,
    wachstumMs: 1000 * 60 * 88, seltenheit: 3,
    belohnung: { geld: 286, wissen: 60 },
    text: 'Auf ihren Blättern stehen alte Vokabeln.',
  },
  segensbluete: {
    id: 'segensbluete', name: 'Segensblüte', emoji: '🕊️', farbe: 0xeae0c0,
    wachstumMs: 1000 * 60 * 92, seltenheit: 3,
    belohnung: { geld: 300, wissen: 62 },
    text: 'Wer in ihrer Nähe verweilt, wird ruhig.',
  },

  // --- Seltenheit 4 ----------------------------------------------------------
  gravitationsglocke: {
    id: 'gravitationsglocke', name: 'Gravitationsglocke', emoji: '🪐', farbe: 0x8a7be0,
    wachstumMs: 1000 * 60 * 120, seltenheit: 4,
    belohnung: { geld: 420, wissen: 88 },
    text: 'Krümmt den Raum sanft um ihre Blüte.',
  },
  edelgasbluete: {
    id: 'edelgasbluete', name: 'Edelgasblüte', emoji: '💠', farbe: 0x7fe0e0,
    wachstumMs: 1000 * 60 * 130, seltenheit: 4,
    belohnung: { geld: 450, wissen: 94 },
    text: 'Reagiert mit nichts und glänzt doch am hellsten.',
  },
  symbiosepilz: {
    id: 'symbiosepilz', name: 'Symbiosepilz', emoji: '🍄', farbe: 0xd98a6a,
    wachstumMs: 1000 * 60 * 138, seltenheit: 4,
    belohnung: { geld: 478, wissen: 100 },
    text: 'Lebt im Bund mit allem, was um ihn wächst.',
  },
  fraktalfarn: {
    id: 'fraktalfarn', name: 'Fraktalfarn', emoji: '❄️', farbe: 0xa0e0d0,
    wachstumMs: 1000 * 60 * 146, seltenheit: 4,
    belohnung: { geld: 506, wissen: 106 },
    text: 'Jedes Blatt enthält den ganzen Farn noch einmal.',
  },
  aurorabluete: {
    id: 'aurorabluete', name: 'Aurorablüte', emoji: '🌌', farbe: 0x6fd6a0,
    wachstumMs: 1000 * 60 * 152, seltenheit: 4,
    belohnung: { geld: 534, wissen: 110 },
    text: 'Flackert in den Farben des Polarlichts.',
  },
  lissajous_lilie: {
    id: 'lissajous_lilie', name: 'Lissajous-Lilie', emoji: '🌀', farbe: 0xe07ac0,
    wachstumMs: 1000 * 60 * 158, seltenheit: 4,
    belohnung: { geld: 560, wissen: 114 },
    text: 'Ihre Ranken zeichnen Lissajous-Figuren in die Luft.',
  },
  waageblume: {
    id: 'waageblume', name: 'Waageblume', emoji: '⚖️', farbe: 0x8f9bd0,
    wachstumMs: 1000 * 60 * 150, seltenheit: 4,
    belohnung: { geld: 520, wissen: 110 },
    text: 'Hält stets beide Blütenseiten im Gleichgewicht.',
  },

  // --- Seltenheit 5 (legendär) -----------------------------------------------
  galaxienorchidee: {
    id: 'galaxienorchidee', name: 'Galaxienorchidee', emoji: '🌠', farbe: 0x7a6ad0,
    wachstumMs: 1000 * 60 * 185, seltenheit: 5,
    belohnung: { geld: 690, wissen: 148 },
    text: 'In ihrem Kelch dreht sich eine kleine Galaxie.',
  },
  regenbogenkaktus: {
    id: 'regenbogenkaktus', name: 'Regenbogenkaktus', emoji: '🌵', farbe: 0x88e0c0,
    wachstumMs: 1000 * 60 * 200, seltenheit: 5,
    belohnung: { geld: 760, wissen: 162 },
    text: 'Blüht in allen Farben des Zahlenstrahls.',
  },
  schwarzlochbluete: {
    id: 'schwarzlochbluete', name: 'Schwarzlochblüte', emoji: '🕳️', farbe: 0x3a3a66,
    wachstumMs: 1000 * 60 * 220, seltenheit: 5,
    belohnung: { geld: 840, wissen: 178 },
    text: 'Selbst das Licht bleibt in ihrem Kelch.',
  },
  kometbluete: {
    id: 'kometbluete', name: 'Kometblüte', emoji: '☄️', farbe: 0xffc46a,
    wachstumMs: 1000 * 60 * 230, seltenheit: 5,
    belohnung: { geld: 880, wissen: 190 },
    text: 'Zieht beim Erblühen einen Schweif aus Funken.',
  },
  ewigkeitsrose: {
    id: 'ewigkeitsrose', name: 'Ewigkeitsrose', emoji: '🏵️', farbe: 0xff8ab0,
    wachstumMs: 1000 * 60 * 240, seltenheit: 5,
    belohnung: { geld: 900, wissen: 200 },
    text: 'Blüht nur einmal in einem Meilenstein-Zeitalter.',
  },
};

export const SPEZIAL_LISTE = Object.values(SPEZIALPFLANZEN);

// Wählt anhand der Meilenstein-Nummer eine passende (mit steigender Nummer
// seltenere) Spezialpflanze aus. Deterministisch genug, um Fortschritt zu
// belohnen, aber mit Zufallsanteil für Abwechslung.
export function waehleSpezialpflanze(meilensteinNr, rng = Math.random) {
  const stufe = Math.min(5, 1 + Math.floor((meilensteinNr - 1) / 2)); // steigt langsam
  const passend = SPEZIAL_LISTE.filter((p) => p.seltenheit <= stufe + 1);
  const kandidaten = passend.length ? passend : SPEZIAL_LISTE;
  return kandidaten[Math.floor(rng() * kandidaten.length)].id;
}
