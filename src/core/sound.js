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
    musikGain = ctx.createGain(); musikGain.gain.value = 0.5; musikGain.connect(master);
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

  // Sanfte, langsame Melodie statt Dauerton: ein ruhiger Dur-Akkord, arpeggiert
  // in seinen DREI Umkehrungen (Lagen). Jede Note klingt weich an und lange aus.
  musikAn() {
    const c = ctxAuf(); if (!c || musikKnoten) return;
    const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1400; filter.connect(musikGain);
    const akkorde = [
      [261.63, 329.63, 392.00], // C-Dur, Grundstellung (C E G)
      [329.63, 392.00, 523.25], // 1. Umkehrung      (E G C)
      [392.00, 523.25, 659.25], // 2. Umkehrung      (G C E)
    ];
    let ai = 0, ni = 0;
    const naechste = () => {
      if (!musikKnoten) return;
      const f = akkorde[ai][ni];
      const t = c.currentTime;
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.5);   // weicher Anschlag
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); // langes Ausklingen
      o.connect(g).connect(filter); o.start(t); o.stop(t + 2.7);
      ni += 1;
      if (ni >= akkorde[ai].length) { ni = 0; ai = (ai + 1) % akkorde.length; }
    };
    naechste();
    const timer = setInterval(naechste, 1500); // alle 1,5 s eine Note → ruhige Melodie
    musikKnoten = { timer };
  },
  musikAus() {
    if (!musikKnoten) return;
    clearInterval(musikKnoten.timer);
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
