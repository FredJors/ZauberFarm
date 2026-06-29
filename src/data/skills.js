// =============================================================================
// skills.js — Skill-Baum (datengetrieben) + Effekt-Berechnung
// -----------------------------------------------------------------------------
// Eine dritte Währung, 🔮 ESSENZ, verdient man durch das Großziehen und Ernten
// von Gewächshaus-Spezialpflanzen. Mit Essenz schaltet man im "Skill-Baum"
// dauerhafte Verbesserungen frei (manche mehrstufig, manche mit Voraussetzung).
//
// Jeder Skill nennt nur DATEN; die Spiellogik liest die berechneten Effekte
// (berechneSkillEffekte) an den passenden Stellen aus. Neue Skills ergänzt man
// allein hier (+ ggf. einen Effekt-Schlüssel unten) — kein Eingriff in die UI.
//   tier         : Spalte im Baum (1 = Wurzel)
//   maxStufe     : 1 = einmalig, >1 = mehrstufig
//   kosten(stufe): Essenz-Kosten für die NÄCHSTE Stufe (stufe = aktuelle Stufe)
//   voraussetzung: id eines Skills, der mind. Stufe 1 haben muss (oder null)
// =============================================================================

export const SKILLS = {
  // --- Tier 1: Wurzeln -------------------------------------------------------
  doppelernte: {
    id: 'doppelernte', name: 'Doppelte Ernte', icon: '✌️', tier: 1, voraussetzung: null,
    maxStufe: 1, kosten: () => 8,
    beschreibung: 'Jede geerntete Pflanze zählt doppelt für die Spezialpflanzen-Meilensteine.',
  },
  marktmeister: {
    id: 'marktmeister', name: 'Marktmeister', icon: '💰', tier: 1, voraussetzung: null,
    maxStufe: 5, kosten: (s) => 4 + 2 * s,
    beschreibung: '+25 % Verkaufserlös auf dem Bauernmarkt (pro Stufe).',
  },
  gelehrter: {
    id: 'gelehrter', name: 'Gelehrter', icon: '📘', tier: 1, voraussetzung: null,
    maxStufe: 5, kosten: (s) => 4 + 2 * s,
    beschreibung: '+20 % Wissen aus gelösten Aufgaben (pro Stufe).',
  },

  // --- Tier 2 ----------------------------------------------------------------
  essenzfluss: {
    id: 'essenzfluss', name: 'Essenzfluss', icon: '🔮', tier: 2, voraussetzung: 'doppelernte',
    maxStufe: 4, kosten: (s) => 5 + 2 * s,
    beschreibung: '+50 % Essenz aus geernteten Gewächshaus-Pflanzen (pro Stufe).',
  },
  erfahren: {
    id: 'erfahren', name: 'Erfahren', icon: '⭐', tier: 2, voraussetzung: 'gelehrter',
    maxStufe: 4, kosten: (s) => 5 + 2 * s,
    beschreibung: '+25 % Erfahrung (XP) aus allen Quellen (pro Stufe).',
  },
  schnellwuchs: {
    id: 'schnellwuchs', name: 'Schnellwuchs', icon: '🌱', tier: 2, voraussetzung: 'marktmeister',
    maxStufe: 5, kosten: (s) => 5 + 3 * s,
    beschreibung: 'Acker-Pflanzen wachsen 12 % schneller (pro Stufe).',
  },

  // --- Tier 3 ----------------------------------------------------------------
  treibhausturbo: {
    id: 'treibhausturbo', name: 'Treibhaus-Turbo', icon: '⏩', tier: 3, voraussetzung: 'essenzfluss',
    maxStufe: 5, kosten: (s) => 6 + 3 * s,
    beschreibung: 'Spezialpflanzen im Gewächshaus reifen 10 % schneller (pro Stufe).',
  },
  sammler: {
    id: 'sammler', name: 'Sammler', icon: '🌟', tier: 3, voraussetzung: 'doppelernte',
    maxStufe: 5, kosten: (s) => 6 + 3 * s,
    beschreibung: 'Spezialpflanzen-Meilensteine kommen 10 Ernten früher (pro Stufe, min. 50).',
  },
};

export const SKILL_LISTE = Object.values(SKILLS);

// Basis-Essenz einer Gewächshaus-Ernte (vor dem Essenzfluss-Bonus).
export function basisEssenz(spezialDef) {
  return 2 + (spezialDef?.seltenheit || 1) * 2; // Seltenheit 2..5 → 6..12
}

// Wandelt die freigeschalteten Skill-Stufen in konkrete Spiel-Effekte um.
export function berechneSkillEffekte(skills = {}) {
  const st = (id) => skills[id] || 0;
  return {
    ernteFaktor: st('doppelernte') >= 1 ? 2 : 1,              // Meilenstein-Zählung
    marktFaktor: 1 + 0.25 * st('marktmeister'),               // Verkaufserlös
    wissenFaktor: 1 + 0.20 * st('gelehrter'),                 // Wissen aus Aufgaben
    xpFaktor: 1 + 0.25 * st('erfahren'),                      // XP
    essenzFaktor: 1 + 0.50 * st('essenzfluss'),               // Essenz-Ausbeute
    ackerTempo: Math.max(0.2, 1 - 0.12 * st('schnellwuchs')), // <1 = schneller
    gewaechsTempo: Math.max(0.2, 1 - 0.10 * st('treibhausturbo')),
    meilensteinAbstand: Math.max(50, 100 - 10 * st('sammler')),
  };
}
