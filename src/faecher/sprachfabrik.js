// =============================================================================
// sprachfabrik.js — Gemeinsamer Bauplan für Sprachfächer (Buchstaben-Zauber)
// -----------------------------------------------------------------------------
// Französisch, Latein und Spanisch teilen sich dieselbe Mechanik wie Deutsch &
// Englisch: Buchstaben hüpfen über den Acker, dazu ein Flächen-Splash. Statt jede
// Datei mit identischem FachModul-Boilerplate zu füllen, erzeugt diese Fabrik aus
// einer kompakten Konfiguration ein vollständiges FachModul. So bleibt der Kern
// unberührt und ein neues Sprachfach ist nur noch eine Daten-Datei.
//
// Konfiguration:
//   { id, name, icon, farbe, konzept,
//     themen: [{id,name}, …],            // drei Themen
//     banks:  { themaId: [ {q,r,f,h}, … ] },  // MC-Frage-Banken je Thema
//     woerterKurz, woerterLang,          // Wörter für die Buchstaben-Sprünge
//     zauber: { wort:{name,icon}, salat:{name,icon}, satz:{name,icon} } }
// =============================================================================

import { berechneErnteForm } from '../core/ernte.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
let aufgabenZaehler = 0;
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Gemeinsame Upgrade-Definitionen der Buchstaben-/Splash-Zauber.
const UP_WORTLAENGE = { name: 'Wortlänge (Buchstaben)', schluessel: 'anzahl', step: 1, max: 8, kosten: (s) => 22 * (s + 1) };
const UP_SPRUNGWEITE = { name: 'Sprungweite', schluessel: 'schrittweite', step: 0.5, max: 4, kosten: (s) => 16 * (s + 1) };
const UP_SCHWUNG = { name: 'Schwung (Bogen)', schluessel: 'amplitude', step: 0.3, max: 5, kosten: (s) => 14 * (s + 1) };
const UP_REICHWEITE = { name: 'Wurfweite', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Splash-Radius', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };

export function erzeugeSprachModul(cfg) {
  // Themen-IDs mit der Fach-ID namespacen (z. B. 'franzoesisch:vokabeln'), damit
  // generische Themennamen wie 'vokabeln'/'grammatik' NICHT mit anderen Fächern
  // kollidieren — der Lernfortschritt (meisterung) ist global nach themaId indiziert.
  const themen = cfg.themen.map((t) => ({ id: `${cfg.id}:${t.id}`, name: t.name }));
  const banks = {};
  cfg.themen.forEach((t) => { banks[`${cfg.id}:${t.id}`] = cfg.banks[t.id]; });
  const [t0, t1, t2] = themen.map((t) => t.id);
  const zk = cfg.zauber || {};

  // Standard-Zaubersatz: zwei Buchstaben-Würfe + ein Flächen-Splash.
  const ZAUBER = {
    [`${cfg.id}_wort`]: {
      id: `${cfg.id}_wort`, name: zk.wort?.name || 'Wortzauber', themaId: t0, icon: zk.wort?.icon || '📜',
      form: 'buchstaben', tier: 1, freischalt: { wissen: 0, niveau: 1 },
      beschreibung: 'Ein Wort hüpft Buchstabe für Buchstabe über den Acker und erntet die Landefelder.',
      basis: { anzahl: 3, schrittweite: 1, amplitude: 0.6 }, woerter: cfg.woerterKurz,
      upgrades: [UP_WORTLAENGE, UP_SPRUNGWEITE, UP_SCHWUNG],
    },
    [`${cfg.id}_salat`]: {
      id: `${cfg.id}_salat`, name: zk.salat?.name || 'Buchstabensalat', themaId: t1, icon: zk.salat?.icon || '🥗',
      form: 'splash', tier: 3, freischalt: { wissen: 130, niveau: 3 },
      beschreibung: 'Ein Wirbel aus Buchstaben bedeckt eine Kreisfläche und erntet sie.',
      basis: { reichweite: 4, radius: 2.2 },
      upgrades: [UP_REICHWEITE, UP_RADIUS],
    },
    [`${cfg.id}_satz`]: {
      id: `${cfg.id}_satz`, name: zk.satz?.name || 'Satzzauber', themaId: t2, icon: zk.satz?.icon || '📖',
      form: 'buchstaben', tier: 4, freischalt: { wissen: 300, niveau: 4 },
      beschreibung: 'Ein ganzer Satz springt weit über den Acker — viele Buchstaben, große Reichweite.',
      basis: { anzahl: 6, schrittweite: 1, amplitude: 0.85 }, woerter: cfg.woerterLang,
      upgrades: [UP_WORTLAENGE, UP_SPRUNGWEITE, UP_SCHWUNG],
    },
  };
  const ZAUBER_LISTE = Object.values(ZAUBER);

  function paramsFuer(zauber, stufen = {}) {
    const b = zauber.basis;
    const p = { ...b };
    for (const up of zauber.upgrades || []) {
      const s = stufen[up.schluessel] || 0;
      p[up.schluessel] = (b[up.schluessel] ?? 0) + s * up.step;
    }
    return p;
  }

  function neueAufgabe(daten) { return { id: `${cfg.id}_${++aufgabenZaehler}`, ...daten }; }
  function mcAusBank(themaId, n) {
    const e = wahl(banks[themaId]);
    const optionen = shuffle([e.r, ...e.f]);
    return neueAufgabe({ themaId, typ: 'mc', niveau: n, frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '' });
  }

  return {
    id: cfg.id, name: cfg.name, icon: cfg.icon, farbe: cfg.farbe,
    implementiert: true, startNiveau: 1, konzept: cfg.konzept,

    themen() { return themen.map((t) => ({ id: t.id, name: t.name })); },
    niveauFuer(state, themaId) { return niveauVon(state.meisterung, themaId, this.startNiveau); },

    erzeugeAufgabe(themaId, niveau = 1) {
      const id = banks[themaId] ? themaId : themen[0].id;
      return mcAusBank(id, niveau);
    },

    prüfeAntwort(aufgabe, antwort) {
      const korrekt = Number(antwort) === aufgabe.richtigeOption;
      return {
        korrekt,
        erhalteneXP: korrekt ? basisBelohnung(aufgabe.niveau || 1) : 0,
        feedback: (korrekt ? '' : 'Leider falsch. ') + (aufgabe.hinweis || ''),
      };
    },

    niveauAnpassen(state, themaId, korrekt) {
      if (!state.meisterung) state.meisterung = {};
      passeNiveauAn(state.meisterung, themaId, korrekt, this.startNiveau);
    },

    listeZauber(themaId) { return ZAUBER_LISTE.filter((z) => !themaId || z.themaId === themaId); },
    alleZauber() { return ZAUBER_LISTE; },
    zauberAn(id) { return ZAUBER[id] || null; },
    paramsFuer,
    upgradeKosten(zauber, schluessel, stufe) {
      const up = zauber.upgrades.find((u) => u.schluessel === schluessel);
      return up ? kostenFuer(zauber.tier || 1, up, stufe) : 0;
    },

    // Buchstaben-Zauber: festes Vorschau-Wort (kein Flackern), beim Wirken zufällig.
    berechneVorschau(zauber, params) {
      if (zauber.form === 'buchstaben') params.wort = (zauber.woerter || cfg.woerterKurz)[0];
      return berechneErnteForm(zauber, params);
    },
    wirkeZauber(zauber, params, spielfeld) {
      if (zauber.form === 'buchstaben') params.wort = wahl(zauber.woerter || cfg.woerterKurz);
      const { ziele, visual } = berechneErnteForm(zauber, params);
      const now = params.now ?? Date.now();
      const geerntet = [];
      for (const z of ziele) {
        const feld = spielfeld.feldAn(z.gx, z.gy);
        if (!feld) continue;
        const p = spielfeld.ernte(feld, now);
        if (p) geerntet.push({ feld, pflanze: p });
      }
      return { geerntet, ziele, visual };
    },
  };
}
