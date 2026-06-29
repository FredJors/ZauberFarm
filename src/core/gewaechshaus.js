// =============================================================================
// gewaechshaus.js — Idle-Wachstum der Spezialpflanzen (fachunabhängiger Kern)
// -----------------------------------------------------------------------------
// Spezialpflanzen wachsen in Echtzeit weiter — auch bei geschlossenem Spiel,
// weil der Fortschritt aus Zeitstempeln berechnet wird (kein Timer nötig).
// Aufgaben aus dem AKTIVEN Fach können die Reifezeit verkürzen ("Boost").
// Slot-Datenmodell:  { spezialId, gepflanztBei, gesamtMs, bonusMs } | null
// =============================================================================

import { SPEZIALPFLANZEN } from '../data/spezialpflanzen.js';
import { basisEssenz } from '../data/skills.js';

export const ANZAHL_SLOTS = 6;

export function leeresGewaechshaus() {
  return { slots: new Array(ANZAHL_SLOTS).fill(null) };
}

// Verstrichene (bonusbereinigte) Wachstumszeit eines Slots.
export function verstrichen(slot, now) {
  if (!slot) return 0;
  return now - slot.gepflanztBei + (slot.bonusMs || 0);
}

// Fortschritt 0..1 eines Slots.
export function fortschritt(slot, now) {
  if (!slot) return 0;
  return Math.min(1, verstrichen(slot, now) / slot.gesamtMs);
}

export function istReif(slot, now) {
  return !!slot && verstrichen(slot, now) >= slot.gesamtMs;
}

// Pflanzt eine Spezialpflanze in einen freien Slot. Gibt true bei Erfolg.
export function pflanzeSpezial(gh, slotIndex, spezialId, now) {
  const def = SPEZIALPFLANZEN[spezialId];
  if (!def || gh.slots[slotIndex]) return false;
  gh.slots[slotIndex] = { spezialId, gepflanztBei: now, gesamtMs: def.wachstumMs, bonusMs: 0 };
  return true;
}

// Verkürzt die Reifezeit eines Slots um ms (z.B. nach gelöster Aufgabe).
export function beschleunige(gh, slotIndex, ms) {
  const slot = gh.slots[slotIndex];
  if (!slot) return;
  slot.bonusMs = (slot.bonusMs || 0) + ms;
}

// Erntet einen reifen Slot und gibt die Belohnung zurück (sonst null).
// Die Belohnung enthält neben geld/wissen auch die BASIS-Essenz (vor Skill-Bonus).
export function ernteSlot(gh, slotIndex, now) {
  const slot = gh.slots[slotIndex];
  if (!istReif(slot, now)) return null;
  const def = SPEZIALPFLANZEN[slot.spezialId];
  gh.slots[slotIndex] = null;
  return { spezialId: def.id, belohnung: { ...def.belohnung, essenz: basisEssenz(def) } };
}
