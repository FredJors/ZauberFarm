// =============================================================================
// erfolge.js — Erfolgs-/Achievement-Prüfung (fachunabhängiger Kern)
// -----------------------------------------------------------------------------
// Prüft generisch alle in data/erfolge.js definierten Erfolge gegen den
// Spielstand und schaltet neu erfüllte EINMALIG frei. Gibt die neu
// freigeschalteten Erfolge zurück, damit der Aufrufer Boni vergeben + eine
// Meldung zeigen kann. Kein DOM/Three — rein logisch und testbar.
// =============================================================================

import { ERFOLG_LISTE } from '../data/erfolge.js';

// Prüft alle Erfolge. state.erfolge = Liste der freigeschalteten IDs.
//   ctx: abgeleitete Gesamtzahlen (pflanzenGesamt, spezialGesamt, faecherGesamt,
//        biomeGesamt, ackerMax) — siehe data/erfolge.js.
// Rückgabe: Array der NEU freigeschalteten Erfolg-Objekte.
export function pruefeErfolge(state, ctx = {}) {
  if (!Array.isArray(state.erfolge)) state.erfolge = [];
  const neu = [];
  for (const e of ERFOLG_LISTE) {
    if (state.erfolge.includes(e.id)) continue;
    let erfuellt = false;
    try { erfuellt = !!e.pruefe(state, ctx); } catch (_) { erfuellt = false; }
    if (erfuellt) {
      state.erfolge.push(e.id);
      neu.push(e);
    }
  }
  return neu;
}
