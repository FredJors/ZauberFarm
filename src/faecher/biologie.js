// =============================================================================
// biologie.js — Vollständiges Fach Biologie (dritte echte FachModul-Impl.)
// -----------------------------------------------------------------------------
// Bringt eine WEITERE Zauberform mit: "Frosch"-Zauber. Ein (oder per Upgrade
// mehrere) Frosch macht zufällige Sprünge über den Acker und erntet die Felder,
// auf denen er landet — danach verpuffen die Frösche. Anzahl der Frösche, Anzahl
// der Sprünge (Felder) und die Sprungweite sind aufwertbar.
// Zusätzlich eine Splash-Form (Sporen-Wolke), die mit Chemie geteilt wird.
//
// Inhaltlich an der Oberstufen-Biologie orientiert: Zellbiologie, Genetik, Ökologie.
// =============================================================================

import { berechneErnteForm, berechneFroschFelder } from '../core/ernte.js';
import {
  basisBelohnung, niveauVon, passeNiveauAn, upgradeKosten as kostenFuer,
} from '../core/progression.js';

// --------------------------------------------------------- kleine Helfer
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
let aufgabenZaehler = 0;

function parseZahl(eingabe) {
  if (typeof eingabe === 'number') return eingabe;
  if (typeof eingabe !== 'string') return NaN;
  const s = eingabe.trim().replace(',', '.');
  if (s === '') return NaN;
  if (typeof window !== 'undefined' && window.math) {
    try { const v = window.math.evaluate(s); if (Number.isFinite(v)) return v; } catch (_) { /* */ }
  }
  return parseFloat(s);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function neueAufgabe(daten) { return { id: `bio_${++aufgabenZaehler}`, ...daten }; }

// =============================================================================
// AUFGABEN-GENERATOREN — drei Themen, leicht → schwer
// =============================================================================

// ---- Zellbiologie (leichter Einstieg) ---------------------------------------
const ORGANELLEN = [
  { name: 'Mitochondrium', funktion: 'die Zellatmung (Energiegewinnung/ATP)' },
  { name: 'Chloroplast', funktion: 'die Fotosynthese' },
  { name: 'Zellkern', funktion: 'die Speicherung der Erbinformation (DNA)' },
  { name: 'Ribosom', funktion: 'die Proteinbiosynthese' },
  { name: 'Zellmembran', funktion: 'die Abgrenzung und den Stoffaustausch' },
];
function genOrganell(n) {
  const ziel = wahl(ORGANELLEN);
  const falsche = shuffle(ORGANELLEN.filter((o) => o.name !== ziel.name)).slice(0, 3).map((o) => o.name);
  const optionen = shuffle([ziel.name, ...falsche]);
  return neueAufgabe({
    themaId: 'zelle', typ: 'mc', niveau: n,
    frage: `Welches Zellorganell ist zuständig für ${ziel.funktion}?`,
    optionen, richtigeOption: optionen.indexOf(ziel.name),
    hinweis: `Zuständig ist das ${ziel.name}.`,
  });
}
function genZellTyp(n) {
  const optionen = shuffle(['Zellwand', 'Mitochondrium', 'Zellkern', 'Ribosom']);
  return neueAufgabe({
    themaId: 'zelle', typ: 'mc', niveau: n,
    frage: 'Welche Struktur besitzt die Pflanzenzelle, die TIERzelle aber nicht?',
    optionen, richtigeOption: optionen.indexOf('Zellwand'),
    hinweis: 'Nur Pflanzenzellen haben eine Zellwand (sowie Chloroplasten und eine große Vakuole).',
  });
}

// ---- Genetik ----------------------------------------------------------------
function genMendelVerhaeltnis(n) {
  const optionen = shuffle(['3 : 1', '1 : 1', '1 : 2 : 1', '9 : 3 : 3 : 1']);
  return neueAufgabe({
    themaId: 'genetik', typ: 'mc', niveau: n,
    frage: 'Kreuzt man zwei mischerbige Individuen (Aa × Aa), in welchem Verhältnis treten dominantes : rezessives Merkmal im Phänotyp auf?',
    optionen, richtigeOption: optionen.indexOf('3 : 1'),
    hinweis: 'Aus Aa × Aa folgt 1 AA : 2 Aa : 1 aa, also 3 (dominant) : 1 (rezessiv).',
  });
}
const KREUZUNGEN = [
  { text: 'Aa × Aa', ziel: 'reinerbig rezessiv (aa)', loesung: 0.25 },
  { text: 'Aa × Aa', ziel: 'das dominante Merkmal zeigt (Phänotyp)', loesung: 0.75 },
  { text: 'Aa × aa', ziel: 'reinerbig rezessiv (aa)', loesung: 0.5 },
  { text: 'AA × Aa', ziel: 'das rezessive Merkmal zeigt', loesung: 0 },
];
function genKreuzungAnteil(n) {
  const k = wahl(KREUZUNGEN);
  return neueAufgabe({
    themaId: 'genetik', typ: 'numerisch', niveau: n,
    frage: `Kreuzung ${k.text}: Welcher Anteil der Nachkommen ist ${k.ziel}? (als Dezimalzahl)`,
    loesung: k.loesung, toleranz: 0.02,
    hinweis: `Mit einem Punnett-Quadrat ergibt sich ${k.loesung}.`,
  });
}

// ---- Ökologie / Wachstum ----------------------------------------------------
function genWachstumMC(n) {
  const optionen = shuffle(['logistisches Wachstum', 'exponentielles Wachstum', 'lineares Wachstum', 'kein Wachstum']);
  return neueAufgabe({
    themaId: 'oekologie', typ: 'mc', niveau: n,
    frage: 'Wie nennt man Wachstum, das durch eine Kapazitätsgrenze (Umweltwiderstand) gebremst wird?',
    optionen, richtigeOption: optionen.indexOf('logistisches Wachstum'),
    hinweis: 'Begrenztes Wachstum mit Sättigung heißt logistisches Wachstum.',
  });
}
function genVerdopplung(n) {
  const a = wahl([1, 2, 5, 10]);
  const t = rndInt(1, Math.min(8, 1 + n));
  return neueAufgabe({
    themaId: 'oekologie', typ: 'numerisch', niveau: n,
    frage: `Eine Bakterienkultur verdoppelt sich pro Stunde. Start: N₀ = ${a}. Wie viele Bakterien sind es nach ${t} Stunden?`,
    loesung: a * Math.pow(2, t), toleranz: 0.5,
    hinweis: `N(t) = N₀·2^t = ${a}·2^${t} = ${a * Math.pow(2, t)}.`,
  });
}

// ---- weitere Zellbiologie-Aufgaben ------------------------------------------
function genZellprozess(n) {
  const fall = wahl([
    { ort: 'der Chloroplast', prozess: 'Fotosynthese' },
    { ort: 'das Mitochondrium', prozess: 'Zellatmung' },
    { ort: 'das Ribosom', prozess: 'Proteinbiosynthese' },
  ]);
  const optionen = shuffle(['Fotosynthese', 'Zellatmung', 'Proteinbiosynthese', 'Zellteilung']);
  return neueAufgabe({
    themaId: 'zelle', typ: 'mc', niveau: n,
    frage: `Welcher Prozess findet hauptsächlich in diesem Organell statt: ${fall.ort}?`,
    optionen, richtigeOption: optionen.indexOf(fall.prozess),
    hinweis: `${fall.ort} ist der Ort der ${fall.prozess}.`,
  });
}
function genDNABasen(n) {
  const fall = wahl([
    { b: 'Adenin (A)', partner: 'Thymin (T)' }, { b: 'Thymin (T)', partner: 'Adenin (A)' },
    { b: 'Guanin (G)', partner: 'Cytosin (C)' }, { b: 'Cytosin (C)', partner: 'Guanin (G)' },
  ]);
  const optionen = shuffle(['Adenin (A)', 'Thymin (T)', 'Guanin (G)', 'Cytosin (C)']);
  return neueAufgabe({
    themaId: 'zelle', typ: 'mc', niveau: n,
    frage: `Mit welcher Base paart sich in der DNA ${fall.b}?`,
    optionen, richtigeOption: optionen.indexOf(fall.partner),
    hinweis: `Basenpaarung: A–T und G–C. ${fall.b} paart mit ${fall.partner}.`,
  });
}

// ---- weitere Genetik-Aufgaben -----------------------------------------------
function genGenotyp(n) {
  const fall = wahl([
    { g: 'AA', typ: 'reinerbig (homozygot) dominant' },
    { g: 'aa', typ: 'reinerbig (homozygot) rezessiv' },
    { g: 'Aa', typ: 'mischerbig (heterozygot)' },
  ]);
  const optionen = shuffle(['reinerbig (homozygot) dominant', 'reinerbig (homozygot) rezessiv', 'mischerbig (heterozygot)']);
  return neueAufgabe({
    themaId: 'genetik', typ: 'mc', niveau: n,
    frage: `Wie bezeichnet man den Genotyp ${fall.g}?`,
    optionen, richtigeOption: optionen.indexOf(fall.typ),
    hinweis: `${fall.g} ist ${fall.typ}.`,
  });
}

// ---- weitere Ökologie-Aufgaben ----------------------------------------------
function genNahrungskette(n) {
  const richtig = 'Produzent → Primärkonsument → Sekundärkonsument';
  const optionen = shuffle([richtig, 'Konsument → Produzent → Destruent', 'Sekundärkonsument → Produzent → Konsument', 'Destruent → Produzent → Konsument']);
  return neueAufgabe({
    themaId: 'oekologie', typ: 'mc', niveau: n,
    frage: 'Welche Reihenfolge hat eine typische Nahrungskette?',
    optionen, richtigeOption: optionen.indexOf(richtig),
    hinweis: 'Energie fließt vom Produzenten (Pflanze) über Pflanzenfresser zu Fleischfressern.',
  });
}
function genHalbierung(n) {
  const a = wahl([8, 16, 32, 64, 100, 1000]);
  const t = rndInt(1, Math.min(6, 1 + n));
  return neueAufgabe({
    themaId: 'oekologie', typ: 'numerisch', niveau: n,
    frage: `Eine Population halbiert sich jedes Jahr. Start: N₀ = ${a}. Wie groß ist sie nach ${t} Jahren?`,
    loesung: a / Math.pow(2, t), toleranz: 0.5,
    hinweis: `N(t) = N₀·(1/2)^t = ${a}·(1/2)^${t} = ${a / Math.pow(2, t)}.`,
  });
}

// ---- Konzept-Banken: viele unterschiedliche MC-Fragen je Thema --------------
// (sorgt für Abwechslung auch auf niedrigem Niveau, vermeidet Wiederholungen)
function mcBank(themaId, n, bank) {
  const e = wahl(bank);
  const optionen = shuffle([e.r, ...e.f]);
  return neueAufgabe({
    themaId, typ: 'mc', niveau: n,
    frage: e.q, optionen, richtigeOption: optionen.indexOf(e.r), hinweis: e.h || '',
  });
}
const ZELL_BANK = [
  { q: 'Welche Zelle besitzt KEINEN echten Zellkern?', r: 'Bakterienzelle (Prokaryot)', f: ['Pflanzenzelle', 'Tierzelle', 'Pilzzelle'], h: 'Prokaryoten (Bakterien) haben keinen membranumhüllten Zellkern.' },
  { q: 'Was ist die Hauptaufgabe der DNA?', r: 'Speicherung der Erbinformation', f: ['Energiegewinnung', 'Fotosynthese', 'Stofftransport'], h: 'Die DNA trägt die Erbinformation.' },
  { q: 'Welche Struktur grenzt jede Zelle nach außen ab?', r: 'Zellmembran', f: ['Zellkern', 'Mitochondrium', 'Ribosom'], h: 'Die Zellmembran regelt den Stoffaustausch.' },
  { q: 'Wo läuft in der Pflanzenzelle die Fotosynthese ab?', r: 'im Chloroplast', f: ['im Mitochondrium', 'im Zellkern', 'in der Vakuole'], h: 'Chloroplasten enthalten Chlorophyll.' },
  { q: 'Welches Organell baut Proteine zusammen?', r: 'Ribosom', f: ['Vakuole', 'Zellwand', 'Chloroplast'], h: 'Ribosomen sind der Ort der Proteinbiosynthese.' },
];
const GEN_BANK = [
  { q: 'Wie nennt man verschiedene Zustandsformen eines Gens?', r: 'Allele', f: ['Chromosomen', 'Ribosomen', 'Enzyme'], h: 'Allele sind die Varianten eines Gens.' },
  { q: 'Was bedeutet „dominant"?', r: 'Das Merkmal setzt sich im Phänotyp durch', f: ['Das Merkmal wird unterdrückt', 'Das Merkmal tritt nie auf', 'Das Merkmal ist immer reinerbig'], h: 'Ein dominantes Allel überdeckt das rezessive.' },
  { q: 'Was beschreibt der Genotyp?', r: 'die genetische Ausstattung (z. B. Aa)', f: ['das äußere Erscheinungsbild', 'die Chromosomenzahl', 'die Zellgröße'], h: 'Der Phänotyp ist das Erscheinungsbild, der Genotyp die Erbanlage.' },
  { q: 'Wer formulierte die klassischen Vererbungsregeln?', r: 'Gregor Mendel', f: ['Charles Darwin', 'Carl von Linné', 'Robert Koch'], h: 'Mendel untersuchte Erbsen-Kreuzungen.' },
  { q: 'Bei welchem Erbgang mischen sich Merkmale (rot × weiß → rosa)?', r: 'intermediärer Erbgang', f: ['dominant-rezessiver Erbgang', 'kein Erbgang', 'eine Mutation'], h: 'Beim intermediären Erbgang liegt der Phänotyp dazwischen.' },
];
const OEKO_BANK = [
  { q: 'Wie heißt der Lebensraum einer Art?', r: 'Biotop', f: ['Population', 'Biomasse', 'Konsument'], h: 'Biotop = Lebensraum, Biozönose = Lebensgemeinschaft.' },
  { q: 'Wie nennt man alle Individuen einer Art in einem Gebiet?', r: 'Population', f: ['Biotop', 'Ökosystem', 'Art'], h: 'Eine Population ist die Gruppe einer Art an einem Ort.' },
  { q: 'Was sind Pflanzen in der Nahrungskette?', r: 'Produzenten', f: ['Konsumenten', 'Destruenten', 'Parasiten'], h: 'Pflanzen erzeugen mit Fotosynthese Biomasse.' },
  { q: 'Was machen Destruenten (z. B. Pilze, Bakterien)?', r: 'Sie zersetzen totes organisches Material', f: ['Sie betreiben Fotosynthese', 'Sie jagen Beutetiere', 'Sie bestäuben Blüten'], h: 'Destruenten führen Stoffe in den Kreislauf zurück.' },
  { q: 'Welche Beziehung ist ein Beispiel für Symbiose?', r: 'Biene und Blüte', f: ['Fuchs und Hase', 'Löwe und Gazelle', 'Bandwurm und Mensch'], h: 'Symbiose = beide Partner haben einen Nutzen.' },
];
function genZelleKonzept(n) { return mcBank('zelle', n, ZELL_BANK); }
function genGenetikKonzept(n) { return mcBank('genetik', n, GEN_BANK); }
function genOekoKonzept(n) { return mcBank('oekologie', n, OEKO_BANK); }

const POOLS = {
  zelle: [
    { min: 1, gen: genOrganell }, { min: 1, gen: genZellTyp },
    { min: 1, gen: genZellprozess }, { min: 1, gen: genZelleKonzept },
    { min: 3, gen: genDNABasen },
  ],
  genetik: [
    { min: 1, gen: genMendelVerhaeltnis }, { min: 1, gen: genGenotyp },
    { min: 1, gen: genGenetikKonzept }, { min: 3, gen: genKreuzungAnteil },
  ],
  oekologie: [
    { min: 1, gen: genWachstumMC }, { min: 1, gen: genNahrungskette },
    { min: 1, gen: genOekoKonzept }, { min: 2, gen: genVerdopplung },
    { min: 4, gen: genHalbierung },
  ],
};

// =============================================================================
// ZAUBER-KATALOG  (Frosch-Sprünge + Sporen-Splash)
// =============================================================================
const UP_FROESCHE = { name: 'Frösche (Anzahl)', schluessel: 'anzahl', step: 1, max: 5, kosten: (s) => 28 * (s + 1) };
const UP_SPRUENGE = { name: 'Sprünge je Frosch (Felder X)', schluessel: 'spruenge', step: 1, max: 8, kosten: (s) => 18 * (s + 1) };
const UP_WEITE = { name: 'Sprungweite', schluessel: 'weite', step: 0.5, max: 5, kosten: (s) => 16 * (s + 1) };
const UP_REICHWEITE = { name: 'Wurfweite (Reichweite)', schluessel: 'reichweite', step: 1, max: 6, kosten: (s) => 16 * (s + 1) };
const UP_RADIUS = { name: 'Splash-Radius (Fläche)', schluessel: 'radius', step: 0.5, max: 6, kosten: (s) => 22 * (s + 1) };

export const ZAUBER = {
  froschzauber: {
    id: 'froschzauber', name: 'Froschzauber', themaId: 'oekologie', icon: '🐸',
    form: 'froesche', tier: 1, freischalt: { wissen: 0, niveau: 1 },
    beschreibung: 'Ein Frosch hüpft nah um den Bauern und erntet, wo er landet. Upgrades: mehr Frösche, mehr Sprünge (Felder), weitere Sprünge.',
    basis: { anzahl: 1, spruenge: 2, weite: 1.5 },
    upgrades: [UP_FROESCHE, UP_SPRUENGE, UP_WEITE],
  },
  sporen_wolke: {
    id: 'sporen_wolke', name: 'Sporen-Wolke', themaId: 'zelle', icon: '🍄',
    form: 'splash', tier: 3, freischalt: { wissen: 250, niveau: 3 },
    beschreibung: 'Eine Pilz-Sporenwolke bedeckt eine Kreisfläche und erntet sie.',
    basis: { reichweite: 4, radius: 2.2 },
    upgrades: [UP_REICHWEITE, UP_RADIUS],
  },
  kroetenschwarm: {
    id: 'kroetenschwarm', name: 'Krötenschwarm', themaId: 'oekologie', icon: '🐸',
    form: 'froesche', tier: 4, freischalt: { wissen: 470, niveau: 4 },
    beschreibung: 'Ein ganzer Schwarm Kröten springt weit und zahlreich über den Acker.',
    basis: { anzahl: 3, spruenge: 5, weite: 3 },
    upgrades: [UP_FROESCHE, UP_SPRUENGE, UP_WEITE],
  },
};

export const ZAUBER_LISTE = Object.values(ZAUBER);

// Effektive Parameter aus den Upgrade-Stufen (generisch, schrittweise).
function paramsFuer(zauber, stufen = {}) {
  const b = zauber.basis;
  const p = { ...b };
  for (const up of zauber.upgrades || []) {
    const s = stufen[up.schluessel] || 0;
    p[up.schluessel] = (b[up.schluessel] ?? 0) + s * up.step;
  }
  return p;
}

// =============================================================================
// DAS FACHMODUL
// =============================================================================
export const biologieModul = {
  id: 'biologie', name: 'Biologie', icon: '🧬', farbe: '#79c46f',
  implementiert: true,
  startNiveau: 1,
  konzept: 'Frosch-Zauber hüpfen zufällig über den Acker und ernten Landefelder; Aufgaben zu Zellbiologie, Genetik und Ökologie.',

  themen() {
    return [
      { id: 'zelle', name: 'Zellbiologie' },
      { id: 'genetik', name: 'Genetik' },
      { id: 'oekologie', name: 'Ökologie' },
    ];
  },

  niveauFuer(state, themaId) {
    return niveauVon(state.meisterung, themaId, this.startNiveau);
  },

  erzeugeAufgabe(themaId, niveau = 1) {
    const pool = POOLS[themaId] || POOLS.zelle;
    const erlaubt = pool.filter((e) => e.min <= niveau);
    const eintrag = wahl(erlaubt.length ? erlaubt : pool);
    return eintrag.gen(niveau);
  },

  prüfeAntwort(aufgabe, antwort) {
    let korrekt = false;
    if (aufgabe.typ === 'mc') {
      korrekt = Number(antwort) === aufgabe.richtigeOption;
    } else {
      const z = parseZahl(antwort);
      korrekt = Number.isFinite(z) && Math.abs(z - aufgabe.loesung) <= (aufgabe.toleranz ?? 0.001);
    }
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

  listeZauber(themaId) {
    return ZAUBER_LISTE.filter((z) => !themaId || z.themaId === themaId);
  },
  alleZauber() { return ZAUBER_LISTE; },
  zauberAn(id) { return ZAUBER[id] || null; },
  paramsFuer,
  upgradeKosten(zauber, schluessel, stufe) {
    const up = zauber.upgrades.find((u) => u.schluessel === schluessel);
    return up ? kostenFuer(zauber.tier || 1, up, stufe) : 0;
  },

  // Frosch-Zauber: zufällige Sprünge (keine stabile Vorschau → nur Pfeil-Richtung).
  // Splash-Zauber: gemeinsame Form-/Ernte-Pipeline.
  berechneVorschau(zauber, params) {
    if (zauber.form === 'froesche') {
      const richtung = { x: Math.cos(params.theta || 0), y: Math.sin(params.theta || 0) };
      return { ziele: [], visual: { typ: 'froesche', pfade: [], richtung } };
    }
    return berechneErnteForm(zauber, params);
  },
  wirkeZauber(zauber, params, spielfeld) {
    let ziele, visual;
    if (zauber.form === 'froesche') {
      const erg = berechneFroschFelder({
        anzahl: params.anzahl, spruenge: params.spruenge, weite: params.weite,
        theta: params.theta || 0, radius: params.ackerRadius ?? spielfeld.radius ?? 8,
      });
      ziele = erg.ziele;
      visual = { typ: 'froesche', pfade: erg.pfade, richtung: { x: Math.cos(params.theta || 0), y: Math.sin(params.theta || 0) } };
    } else {
      ({ ziele, visual } = berechneErnteForm(zauber, params));
    }
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

export default biologieModul;
