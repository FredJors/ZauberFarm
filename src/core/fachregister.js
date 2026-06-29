// =============================================================================
// fachregister.js — Registrierung der Schulfächer (Modularitäts-Schnittstelle)
// -----------------------------------------------------------------------------
// Die Kern-Engine kennt nur diese generische FachModul-Schnittstelle. Ein neues
// Fach wird allein durch eine neue Implementierung + Registrierung ergänzt — der
// Kern (Gitter, Markt, Gewächshaus, Render, Speichern) bleibt unverändert.
//
// FachModul {
//   id, name, icon, farbe
//   implementiert: boolean                       // false = nur Stub/Vorschau
//   themen(): Thema[]                             // z.B. Analysis, Geometrie
//   erzeugeAufgabe(themaId, niveau): Aufgabe
//   prüfeAntwort(aufgabe, antwort): { korrekt, feedback, erhalteneXP }
//   listeZauber(themaId): Zauber[]               // freischalt- & aufwertbar
//   wirkeZauber(zauber, params, spielfeld): { geerntet, kurve, ziele }
//   startNiveau, niveauAnpassen(state, themaId, korrekt): void
// }
// =============================================================================

const register = new Map();

export function registriereFach(modul) {
  if (!modul || !modul.id) throw new Error('FachModul braucht eine id');
  register.set(modul.id, modul);
}

export function holeFach(id) {
  return register.get(id) || null;
}

export function alleFaecher() {
  return [...register.values()];
}
