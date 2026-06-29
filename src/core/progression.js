// =============================================================================
// progression.js — Zentrale Schwierigkeits- & Belohnungskurve (alle Fächer)
// -----------------------------------------------------------------------------
// Damit sich das Spiel "süchtig machend" anfühlt, liegt die Progression an einer
// Stelle und ist für jedes Fach gleich:
//   • Sehr leichter Einstieg: niedrige Niveaus = triviale Aufgaben, schnelle Erfolge.
//   • Danach LINEAR ansteigend: Niveau 1 → 10, jede richtige Antwort hebt es an.
//   • Schwerere Aufgaben geben (linear) mehr Belohnung — und Zauber werden mit
//     höherem "Tier" teurer, aber stärker.
//   • Serien-Bonus (Streak): fehlerfreie Folgen erhöhen die Belohnung — der
//     klassische "nur noch eine Aufgabe"-Sog.
// =============================================================================

export const START_NIVEAU = 1;
export const MAX_NIVEAU = 10;

// Gerundetes, gedeckeltes Meisterungslevel eines Themas (für die Aufgabenwahl).
export function niveauVon(meisterung, themaId, startNiveau = START_NIVEAU) {
  return Math.max(1, Math.min(MAX_NIVEAU, Math.round(meisterung?.[themaId] ?? startNiveau)));
}

// Adaptive Anpassung: richtig hebt deutlich (schneller, belohnender Aufstieg),
// falsch senkt nur leicht (Frust vermeiden). Ergibt eine spürbar lineare Kurve.
export function passeNiveauAn(meisterung, themaId, korrekt, startNiveau = START_NIVEAU) {
  if (!meisterung) return;
  const cur = meisterung[themaId] ?? startNiveau;
  meisterung[themaId] = Math.max(1, Math.min(MAX_NIVEAU, cur + (korrekt ? 0.5 : -0.34)));
}

// Basis-Belohnung (Wissen/XP) pro gelöster Aufgabe — LINEAR mit der Schwierigkeit.
// Niveau 1 → 7,  Niveau 5 → 23,  Niveau 10 → 43.
export function basisBelohnung(niveau) {
  return 3 + Math.max(1, niveau) * 4;
}

// Serien-Multiplikator: +10 % je aufeinanderfolgender richtiger Antwort, max +100 %.
export function serienFaktor(serie) {
  return 1 + Math.min(1.0, Math.max(0, (serie || 0) - 1) * 0.1);
}

// Upgrade-Kosten skalieren mit der Upgrade-Stufe UND dem Zauber-Tier:
// stärkere (höher-stufige) Zauber sind teurer aufzuwerten.
export function upgradeKosten(tier, up, stufe) {
  return Math.round(up.kosten(stufe) * (1 + 0.35 * (Math.max(1, tier || 1) - 1)));
}

// Wissens-Kosten EINES Zauberwurfs — steigt mit dem Tier (stärkere Zauber kosten
// mehr Wissen). So muss der Spieler Aufgaben lösen und kann nicht nur klicken.
// Tier 1→2, 2→5, 3→9, 4→14, 5→20 Wissen.
export function zauberWirkKosten(tier) {
  const t = Math.max(1, tier || 1);
  return Math.round(1.5 * t + 0.5 * t * t);
}
