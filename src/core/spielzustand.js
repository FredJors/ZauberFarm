// =============================================================================
// spielzustand.js — Spielstand, Wirtschaft & Persistenz (localStorage)
// -----------------------------------------------------------------------------
// Hält den gesamten Fortschritt und kümmert sich um Auto-Save/Laden. Wichtig für
// die Idle-Mechanik: Es wird ein Zeitstempel gespeichert, damit Gewächshaus &
// Acker beim nächsten Laden die offline vergangene Zeit nachholen können.
// Zwei Währungen:  Wissen (aus Aufgaben) · Geld (aus Marktverkäufen).
// =============================================================================

import { leeresGewaechshaus } from './gewaechshaus.js';
import { PFLANZEN } from '../data/pflanzen.js';

export const SPEICHER_KEY = 'zauberacker.spielstand.v2';

// --- Pro-Nutzer-Speicherstände ----------------------------------------------
// Jeder angemeldete Nutzer hat seinen eigenen Spielstand (Schlüssel = Basis +
// Nutzer-ID). Das ist zugleich die Grundlage für eine spätere Datenbank: dort
// wird der Spielstand einfach pro nutzerId gespeichert/geladen.
let aktiveNutzerId = null;
export function setzeAktivenNutzer(id) { aktiveNutzerId = id || null; }
// Speicher-Schlüssel für eine beliebige Nutzer-ID (auch von der Cloud genutzt).
export function speicherKeyFuer(id) { return id ? `${SPEICHER_KEY}.${id}` : SPEICHER_KEY; }
function speicherKey() { return speicherKeyFuer(aktiveNutzerId); }

// Optionaler Hook nach jedem Speichern (z. B. Cloud-Sync). Bleibt null, solange
// keine Datenbank angebunden ist → reines localStorage-Verhalten wie bisher.
let nachSpeichern = null;
export function setzeSpeicherHook(fn) { nachSpeichern = fn; }

export function neuerSpielstand() {
  return {
    version: 2,
    geld: 0,
    wissen: 0,
    essenz: 0, // 🔮 Meta-Währung aus Gewächshaus-Ernten (für den Skill-Baum)
    level: 1,
    xp: 0,
    xpNaechstesLevel: 50,

    skills: {}, // skillId -> freigeschaltete Stufe (siehe data/skills.js)

    aktivesFach: 'mathe',
    aktivesBiome: 'bauernhof',
    freigeschalteteBiome: ['bauernhof'], // Karten werden mit 💰 Geld freigeschaltet
    entdecktePflanzen: [],               // geerntete Pflanzenarten (für den Codex)
    ackerRadius: 8, // wächst per Upgrade um je eine ganze Umrandung (siehe LOOK.gitterRadius)

    inventar: {}, // pflanzeId -> Anzahl
    gesamtErnten: 0, // Gesamt-Erntezähler (für Spezialpflanzen-Meilensteine)
    naechsterMeilenstein: 100, // alle 100 Ernten eine Spezialpflanze
    meilensteinNr: 0,

    // Zauberbuch: freigeschaltete Zauber (IDs sind fachübergreifend eindeutig)
    // + ihre Upgrade-Stufen. aktiveZauberProFach merkt sich je Fach den zuletzt
    // gewählten Zauber, damit der Fachwechsel den passenden Zauber aktiviert.
    freigeschalteteZauber: ['linear'], // Geradenzauber ist von Beginn an dabei
    aktiverZauber: 'linear',
    aktiveZauberProFach: { mathe: 'linear' },
    zauberStufen: {}, // zauberId -> { bereich, a, b, c, reichweite, radius } (Stufen)

    // Adaptive Schwierigkeit: Meisterungslevel je Thema.
    meisterung: {}, // themaId -> number (steigt bei richtig, sinkt bei falsch)

    // Serien-/Streak-Mechanik: fehlerfreie Folge gelöster Aufgaben.
    serie: 0,
    serieRekord: 0,

    // Lern-Statistik (für das Wissensstand-Menü).
    aufgabenRichtig: 0,
    aufgabenGesamt: 0,

    spezialSammlung: [], // entdeckte Spezialpflanzen-IDs (Codex)
    spezialLager: [], // gedroppte, noch nicht eingepflanzte Spezialpflanzen
    gewaechshaus: leeresGewaechshaus(),

    // Angelegte kosmetische Gegenstände (siehe data/kosmetik.js) je Slot.
    kosmetik: { stab: null, hut: null, kutte: null },

    tutorialGesehen: false, // Onboarding-Tour beim ersten Login automatisch zeigen

    // Erfolge / Achievements (siehe data/erfolge.js) + Tracking dafür.
    erfolge: [],            // freigeschaltete Erfolg-IDs
    gewirkteZauber: [],     // je einmal gewirkte Zauber-IDs (für „Zaubermeister" usw.)
    gewirkteFormen: [],     // je einmal gewirkte Zauberformen (kurve, splash, regen, …)
    gespielteFaecher: ['mathe'], // je einmal gespielte Fächer (für „Universalgelehrter")

    feldDaten: null, // Schnappschuss des Ackers (optional)
    letzterZeitstempel: Date.now(),
  };
}

// ---------------------------------------------------------------- Persistenz
export function speichere(state) {
  try {
    state.letzterZeitstempel = Date.now();
    localStorage.setItem(speicherKey(), JSON.stringify(state));
    if (nachSpeichern) { try { nachSpeichern(state); } catch (e) { console.warn('Speicher-Hook:', e); } }
    return true;
  } catch (e) {
    console.warn('Speichern fehlgeschlagen:', e);
    return false;
  }
}

export function ladeSpielstand() {
  try {
    const roh = localStorage.getItem(speicherKey());
    if (!roh) return null;
    const geladen = JSON.parse(roh);
    // Mit frischem Standard mischen, damit neue Felder nie undefined sind.
    return { ...neuerSpielstand(), ...geladen };
  } catch (e) {
    console.warn('Laden fehlgeschlagen:', e);
    return null;
  }
}

export function loescheSpielstand() {
  localStorage.removeItem(speicherKey());
}

// ---------------------------------------------------------------- Wirtschaft
export function fuegeInventar(state, pflanzeId, anzahl = 1) {
  state.inventar[pflanzeId] = (state.inventar[pflanzeId] || 0) + anzahl;
}

// Verkauft das gesamte Inventar und gibt den Erlös zurück. faktor = Markt-Bonus
// aus dem Skill-Baum (z. B. 1.25 für +25 %).
export function verkaufeAlles(state, faktor = 1) {
  let erloes = 0;
  for (const [id, anzahl] of Object.entries(state.inventar)) {
    const p = PFLANZEN[id];
    if (p) erloes += p.wert * anzahl;
  }
  erloes = Math.round(erloes * faktor);
  state.inventar = {};
  state.geld += erloes;
  return erloes;
}

export function inventarAnzahl(state) {
  return Object.values(state.inventar).reduce((a, b) => a + b, 0);
}

// XP vergeben und ggf. Level erhöhen.
export function vergebeXP(state, xp) {
  state.xp += xp;
  while (state.xp >= state.xpNaechstesLevel) {
    state.xp -= state.xpNaechstesLevel;
    state.level += 1;
    state.xpNaechstesLevel = Math.round(state.xpNaechstesLevel * 1.4);
  }
}
