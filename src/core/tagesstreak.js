// =============================================================================
// tagesstreak.js — Tages-Streak (aufeinanderfolgende Login-Tage)
// -----------------------------------------------------------------------------
// Ergänzt die bestehende Aufgaben-Serie (`serie`, reißt bei Fehler) um eine
// zweite, langfristige Schleife: Wer an aufeinanderfolgenden TAGEN spielt, baut
// eine Tages-Streak auf und bekommt beim ersten Login des Tages eine Belohnung,
// die mit der Streak wächst (gedeckelt, damit es fair bleibt).
// =============================================================================

// Lokales Datum als YYYY-MM-DD (kein UTC-Versatz → „heute" stimmt mit der Uhr
// des Spielers überein).
function datumStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function heute() { return datumStr(new Date()); }
function gestern() { const d = new Date(); d.setDate(d.getDate() - 1); return datumStr(d); }

// Belohnung skaliert mit der Streak, gedeckelt bei Stufe 7.
function tagesBelohnung(streak) {
  const stufe = Math.min(Math.max(1, streak), 7);
  return { wissen: 20 * stufe, geld: 30 * stufe };
}

// Beim Login EINMAL aufrufen. Aktualisiert die Tages-Streak im State und gibt
// zurück, ob heute der erste Login war (für Toast/Belohnung).
//   { neuerTag, streak, belohnung }
export function pruefeTagesStreak(state) {
  const h = heute();
  if (state.letzterSpieltag === h) {
    return { neuerTag: false, streak: state.tagesStreak || 1, belohnung: null };
  }
  if (state.letzterSpieltag === gestern()) state.tagesStreak = (state.tagesStreak || 0) + 1;
  else state.tagesStreak = 1; // Lücke (oder allererster Tag) → Streak beginnt neu
  state.letzterSpieltag = h;
  state.tagesStreakRekord = Math.max(state.tagesStreakRekord || 0, state.tagesStreak);

  const belohnung = tagesBelohnung(state.tagesStreak);
  state.wissen += belohnung.wissen;
  state.geld += belohnung.geld;
  return { neuerTag: true, streak: state.tagesStreak, belohnung };
}
