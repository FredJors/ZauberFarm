// =============================================================================
// sound.js — Klang per Web Audio (synthetisiert, ohne Asset-Dateien)
// -----------------------------------------------------------------------------
// Kurze Effekte (richtig/falsch/zaubern/ernten/Level-up/Belohnung) und ein
// optionaler, sanfter Ambient-Pad als Hintergrund-„Musik". Alles wird live
// erzeugt — das passt zum Build-freien Projekt und braucht keine .mp3-Dateien.
// Echte Musik kann man später ergänzen, indem man hier einen <audio>-Loop lädt.
//
// Autoplay-Regel der Browser: Ton geht erst nach einer Nutzer-Interaktion. Daher
// sound.aktiviere() beim ersten Klick/Tippen aufrufen (siehe main.js).
// =============================================================================

const KEY = 'zauberacker.sound';

let einst = { lautstaerke: 0.6, sfx: true, musik: false };
try { einst = { ...einst, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch {}
function speichere() { try { localStorage.setItem(KEY, JSON.stringify(einst)); } catch {} }

let ctx = null, master = null, sfxGain = null, musikGain = null, musikKnoten = null;

function ctxAuf() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = einst.lautstaerke; master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    musikGain = ctx.createGain(); musikGain.gain.value = 0.16; musikGain.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Ein Ton mit weicher Hüllkurve (Attack + exponentielles Abklingen).
function ton(freq, t0, dauer, { typ = 'sine', peak = 0.3, ziel = sfxGain } = {}) {
  const o = ctx.createOscillator(); o.type = typ; o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
  o.connect(g).connect(ziel);
  o.start(t0); o.stop(t0 + dauer + 0.03);
}

// Frequenz-Sweep (für den Zauber-„Whoosh").
function sweep(f1, f2, t0, dauer, peak = 0.22) {
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(f1, t0);
  o.frequency.exponentialRampToValueAtTime(f2, t0 + dauer);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
  o.connect(g).connect(sfxGain);
  o.start(t0); o.stop(t0 + dauer + 0.03);
}

const muster = {
  richtig:  (t) => { ton(660, t, 0.16); ton(990, t + 0.085, 0.22); },
  falsch:   (t) => { ton(190, t, 0.20, { typ: 'sawtooth', peak: 0.20 }); ton(140, t + 0.07, 0.24, { typ: 'sawtooth', peak: 0.18 }); },
  ernte:    (t) => { ton(523, t, 0.13, { typ: 'triangle', peak: 0.28 }); ton(784, t + 0.04, 0.12, { typ: 'triangle', peak: 0.18 }); },
  zauber:   (t) => { sweep(320, 760, t, 0.22); },
  klick:    (t) => { ton(720, t, 0.05, { typ: 'square', peak: 0.10 }); },
  levelup:  (t) => { [523, 659, 784, 1046].forEach((f, i) => ton(f, t + i * 0.08, 0.22, { typ: 'triangle', peak: 0.26 })); },
  belohnung:(t) => { ton(880, t, 0.16, { typ: 'triangle', peak: 0.26 }); ton(1320, t + 0.1, 0.22, { typ: 'triangle', peak: 0.22 }); },
};

export const sound = {
  // Kurzen Effekt abspielen (No-op, wenn SFX aus oder Web Audio fehlt).
  spiele(name) {
    if (!einst.sfx) return;
    const c = ctxAuf(); if (!c) return;
    const f = muster[name]; if (f) f(c.currentTime + 0.001);
  },

  // Sanfter Ambient-Pad als Hintergrund (leise, langsames Tremolo).
  musikAn() {
    const c = ctxAuf(); if (!c || musikKnoten) return;
    const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 650; filter.connect(musikGain);
    const oscs = [];
    for (const f of [196, 246.94, 293.66]) { // sanfter G-Dur-Dreiklang
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = c.createGain(); g.gain.value = 0.11;
      o.connect(g).connect(filter); o.start(); oscs.push(o);
    }
    const lfo = c.createOscillator(); lfo.frequency.value = 0.07;
    const lg = c.createGain(); lg.gain.value = 0.05;
    lfo.connect(lg).connect(musikGain.gain); lfo.start();
    musikKnoten = { oscs, lfo };
  },
  musikAus() {
    if (!musikKnoten) return;
    for (const o of musikKnoten.oscs) { try { o.stop(); } catch {} }
    try { musikKnoten.lfo.stop(); } catch {}
    musikKnoten = null;
  },

  // Beim ersten Nutzer-Gesture aufrufen (entsperrt Web Audio, startet ggf. Musik).
  aktiviere() { ctxAuf(); if (einst.musik) this.musikAn(); },

  // --- Einstellungen (für das Ton-Menü) ---
  zustand() { return { ...einst }; },
  setzeLautstaerke(v) { einst.lautstaerke = Math.max(0, Math.min(1, v)); if (master) master.gain.value = einst.lautstaerke; speichere(); },
  setzeSfx(an) { einst.sfx = !!an; speichere(); if (an) this.spiele('klick'); },
  setzeMusik(an) { einst.musik = !!an; speichere(); if (an) this.musikAn(); else this.musikAus(); },
};
