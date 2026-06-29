// =============================================================================
// zauberformen.js — Gemeinsamer Helfer für die ZUFALLS-Zauberformen
// -----------------------------------------------------------------------------
// 'noten' (tanzende Noten = Frosch-Sprung-Mechanik mit Noten-Optik) und 'regen'
// (Tropfen auf zufällige Felder im Umkreis) sind nicht-deterministisch und brauchen
// daher — anders als kurve/splash/pfad/kegel — eine STABILE Vorschau (kein Flackern
// beim Zielen) und beim Wirken eine frische Zufallsauswahl. Damit Musik/Kunst/
// Erdkunde das nicht je dreimal kopieren, liegt die Logik hier.
//
// Alle übrigen (deterministischen) Formen werden an berechneErnteForm() delegiert.
// =============================================================================

import {
  berechneErnteForm, berechneFroschFelder, berechneRegenFelder, berechneSplashFelder,
} from '../core/ernte.js';

const richtungVon = (theta) => ({ x: Math.cos(theta || 0), y: Math.sin(theta || 0) });

// Zielfelder + Visual für das tatsächliche Wirken (mit frischem Zufall).
function formErnte(zauber, params, spielfeld) {
  const theta = params.theta || 0;
  if (zauber.form === 'noten') {
    const erg = berechneFroschFelder({
      anzahl: params.anzahl, spruenge: params.spruenge, weite: params.weite,
      theta, radius: params.ackerRadius ?? spielfeld?.radius ?? 8,
    });
    return { ziele: erg.ziele, visual: { typ: 'noten', pfade: erg.pfade, symbol: zauber.symbol || '🎵', richtung: richtungVon(theta) } };
  }
  if (zauber.form === 'regen') {
    const zellen = berechneRegenFelder({ anzahl: params.anzahl, radius: params.radius });
    return { ziele: zellen, visual: { typ: 'regen', zellen, radius: params.radius, symbol: zauber.symbol || '💧' } };
  }
  return berechneErnteForm(zauber, params);
}

// Stabile Live-Vorschau (ohne zu ernten).
export function formVorschau(zauber, params) {
  const theta = params.theta || 0;
  if (zauber.form === 'noten') {
    // Zufällige Sprünge → keine festen Zielfelder, nur Pfeilrichtung.
    return { ziele: [], visual: { typ: 'noten', pfade: [], symbol: zauber.symbol || '🎵', richtung: richtungVon(theta) } };
  }
  if (zauber.form === 'regen') {
    // Vorschau zeigt die ganze REGEN-ZONE (Umkreis) — getroffen wird zufällig ein Teil.
    const zone = berechneSplashFelder({ cx: 0, cy: 0, radius: params.radius }).filter((z) => !(z.gx === 0 && z.gy === 0));
    return { ziele: zone, visual: { typ: 'regen', zellen: [], radius: params.radius, symbol: zauber.symbol || '💧' } };
  }
  return berechneErnteForm(zauber, params);
}

// Wirkt den Zauber und erntet die getroffenen Felder.
export function wirkeMitForm(zauber, params, spielfeld) {
  const { ziele, visual } = formErnte(zauber, params, spielfeld);
  const now = params.now ?? Date.now();
  const geerntet = [];
  for (const z of ziele) {
    const feld = spielfeld.feldAn(z.gx, z.gy);
    if (!feld) continue;
    const p = spielfeld.ernte(feld, now);
    if (p) geerntet.push({ feld, pflanze: p });
  }
  return { geerntet, ziele, visual };
}
