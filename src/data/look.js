// =============================================================================
// look.js — Datengetriebene Optik-Parameter (Low-Poly, Flat-Shaded)
// -----------------------------------------------------------------------------
// Alle Farben, Nebeldichte, Lichtwinkel und Kachelgrößen liegen hier, damit sich
// der Look ändern lässt, ohne Render- oder Spiel-Logik anzufassen.
// =============================================================================

export const LOOK = {
  // --- Gitter / Welt -------------------------------------------------------
  kachelGroesse: 1.0, // Kantenlänge eines 1x1-Feldes in Weltkoordinaten (S)
  gitterRadius: 8, // Felder von -8..+8 → 17x17 sichtbares Raster
  kachelHoehe: 0.25, // leichte Dicke der Boden-Kacheln (Low-Poly-Block)
  kachelLuecke: 0.04, // schmale Fuge zwischen Kacheln, damit Facetten sichtbar sind

  // --- Himmel / Atmosphäre -------------------------------------------------
  himmelFarbe: 0xbfeef5, // helles Cyan/Türkis
  nebelFarbe: 0xd2f0f0, // weicher Horizont-Ausblendung
  nebelNah: 16, // ab hier beginnt der Nebel
  nebelFern: 64, // hier ist alles vollständig im Nebel

  // --- Boden / Pfade -------------------------------------------------------
  bodenFarbe: 0x9bdc8b, // sanftes Grün
  bodenFarbe2: 0x8ace7d, // zweites Grün für Schachbrett-Variation
  pfadFarbe: 0xf2c08a, // warmer Orange-Akzent (Achsen-Umfeld)
  achseFarbe: 0xffd27d, // leuchtende Achsen-Kanten
  ursprungFarbe: 0xffb35c, // Feld unter dem Bauern

  // --- Highlights / Effekte ------------------------------------------------
  kurveFarbe: 0xff8a3d, // leuchtendes Band des Funktionsgraphen
  zielVorschauFarbe: 0x6fd6ff, // Vorschau der getroffenen Felder
  trefferFarbe: 0xfff0a3, // Partikelburst bei Ernte
  erntereifFarbe: 0xffe07a, // Glow erntereifer Felder

  // --- Beleuchtung ---------------------------------------------------------
  ambientFarbe: 0xffffff,
  ambientStaerke: 0.7,
  sonneFarbe: 0xfff2d6,
  sonneStaerke: 0.95,
  sonneAzimut: 45, // Grad: Drehung um die Hochachse
  sonneHoehe: 55, // Grad: Höhe über dem Horizont
  schattenWeichheit: 4, // Bias/Radius-Faktor für weiche Schatten

  // --- Kamera --------------------------------------------------------------
  kameraNeigung: 52, // Grad über der Horizontalen (3/4- bis Top-down)
  kameraDistanz: 22,
  kameraMinDistanz: 10,
  kameraMaxDistanz: 40,
};

// Gradzahl → Bogenmaß (Hilfsfunktion für Licht-/Kamerawinkel).
export const grad = (g) => (g * Math.PI) / 180;
