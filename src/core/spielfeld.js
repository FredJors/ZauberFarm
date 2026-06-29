// =============================================================================
// spielfeld.js — Das Koordinaten-Raster aus Feldern (Logik, ohne Render)
// -----------------------------------------------------------------------------
// Verwaltet die Felder rund um den Ursprung: Aussaat, Wachstum bis "erntereif",
// Ernte und automatisches Nachsäen, damit der Acker stets belebt bleibt.
// Feldzustände: 'leer' · 'wachsend' · 'erntereif' · 'geerntet' · 'hindernis'.
// =============================================================================

import { zufallsPflanze, PFLANZEN } from '../data/pflanzen.js';

const schluessel = (gx, gy) => `${gx},${gy}`;

export class Spielfeld {
  constructor(radius = 8) {
    this.radius = radius;
    this.tempo = 1; // Wachstums-Zeitfaktor (<1 = schneller, via Skill "Schnellwuchs")
    this.felder = new Map();
    for (let gx = -radius; gx <= radius; gx++) {
      for (let gy = -radius; gy <= radius; gy++) {
        // Das Ursprungsfeld bleibt frei — dort steht der Bauer.
        if (gx === 0 && gy === 0) {
          this.felder.set(schluessel(gx, gy), this._neuesFeld(gx, gy, 'leer'));
        } else {
          this.felder.set(schluessel(gx, gy), this._neuesFeld(gx, gy, 'leer'));
        }
      }
    }
  }

  _neuesFeld(gx, gy, zustand) {
    return { gx, gy, zustand, pflanzeId: null, gepflanztBei: 0, reifBei: 0, cooldownBis: 0 };
  }

  feldAn(gx, gy) {
    return this.felder.get(schluessel(gx, gy)) || null;
  }

  alleFelder() {
    return [...this.felder.values()];
  }

  // Sät auf einem Feld eine konkrete Pflanze aus.
  saen(feld, pflanzeId, now) {
    const p = PFLANZEN[pflanzeId];
    if (!p || feld.zustand === 'hindernis') return;
    feld.pflanzeId = pflanzeId;
    feld.gepflanztBei = now;
    feld.reifBei = now + p.wachstumMs * this.tempo;
    feld.zustand = 'wachsend';
  }

  // Besät ein einzelnes Feld zufällig (gemeinsame Logik für Aussaat & Wachstum).
  _saeFeld(feld, ids, now, rng) {
    if (feld.gx === 0 && feld.gy === 0) return; // Ursprung frei lassen
    if (rng() < 0.18) { feld.zustand = 'leer'; feld.pflanzeId = null; return; } // Lücken
    const id = zufallsPflanze(ids, rng);
    const p = PFLANZEN[id];
    const dauer = p.wachstumMs * this.tempo;
    feld.pflanzeId = id;
    const fortschritt = rng(); // 0..1 zufälliger Reifegrad
    feld.gepflanztBei = now - fortschritt * dauer;
    feld.reifBei = feld.gepflanztBei + dauer;
    feld.zustand = now >= feld.reifBei ? 'erntereif' : 'wachsend';
  }

  // Initiale Aussaat anhand der Biom-Pflanzenliste mit zufälligem Wachstumsstand,
  // damit nicht alle Felder gleichzeitig reif werden.
  saatBiome(biome, now, rng = Math.random) {
    const ids = biome?.pflanzen || Object.keys(PFLANZEN);
    for (const feld of this.felder.values()) this._saeFeld(feld, ids, now, rng);
  }

  // Besät nur eine bestimmte Feldmenge (z. B. neu hinzugekommene Randfelder).
  saeFelder(felder, biome, now, rng = Math.random) {
    const ids = biome?.pflanzen || Object.keys(PFLANZEN);
    for (const feld of felder) this._saeFeld(feld, ids, now, rng);
  }

  // Vergrößert den Acker auf einen größeren Radius. Bestehende Felder bleiben
  // unverändert; neu hinzukommende Randfelder werden als 'leer' angelegt und
  // zurückgegeben (zum Besäen durch den Aufrufer).
  wachse(neuerRadius) {
    if (neuerRadius <= this.radius) return [];
    const neue = [];
    for (let gx = -neuerRadius; gx <= neuerRadius; gx++) {
      for (let gy = -neuerRadius; gy <= neuerRadius; gy++) {
        const key = schluessel(gx, gy);
        if (!this.felder.has(key)) {
          const feld = this._neuesFeld(gx, gy, 'leer');
          this.felder.set(key, feld);
          neue.push(feld);
        }
      }
    }
    this.radius = neuerRadius;
    return neue;
  }

  // Schreitet Wachstum & Nachsäen voran. biome steuert, was nachgesät wird.
  aktualisiere(now, biome, rng = Math.random) {
    const ids = biome?.pflanzen || Object.keys(PFLANZEN);
    for (const feld of this.felder.values()) {
      if (feld.zustand === 'hindernis') continue;
      if (feld.zustand === 'wachsend' && now >= feld.reifBei) {
        feld.zustand = 'erntereif';
      } else if (feld.zustand === 'geerntet' && now >= feld.cooldownBis) {
        // Abgeerntetes Feld nach kurzer Pause neu besäen.
        if (feld.gx === 0 && feld.gy === 0) {
          feld.zustand = 'leer';
        } else {
          this.saen(feld, zufallsPflanze(ids, rng), now);
        }
      }
    }
  }

  // Erntet ein erntereifes Feld. Gibt die Pflanzen-Daten zurück oder null.
  ernte(feld, now) {
    if (!feld || feld.zustand !== 'erntereif') return null;
    const p = PFLANZEN[feld.pflanzeId];
    feld.zustand = 'geerntet';
    feld.cooldownBis = now + 2500; // kurze Brache vor dem Nachsäen
    const geerntet = feld.pflanzeId;
    feld.pflanzeId = null;
    return p ? { ...p, id: geerntet } : null;
  }

  // Serialisierung für localStorage (nur das Nötigste).
  serialisiere() {
    return this.alleFelder().map((f) => ({
      gx: f.gx, gy: f.gy, z: f.zustand, p: f.pflanzeId,
      g: f.gepflanztBei, r: f.reifBei, c: f.cooldownBis,
    }));
  }

  lade(daten, now) {
    if (!Array.isArray(daten)) return;
    for (const d of daten) {
      const feld = this.feldAn(d.gx, d.gy);
      if (!feld) continue;
      feld.zustand = d.z; feld.pflanzeId = d.p;
      feld.gepflanztBei = d.g; feld.reifBei = d.r; feld.cooldownBis = d.c;
      // Reife nachholen, falls offline Zeit vergangen ist.
      if (feld.zustand === 'wachsend' && now >= feld.reifBei) feld.zustand = 'erntereif';
    }
  }
}
