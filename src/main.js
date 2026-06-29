// =============================================================================
// main.js — Bootstrap & Spielsteuerung (verbindet Kern, Render, UI, Fächer)
// -----------------------------------------------------------------------------
// Baut Szene/Welt/UI auf, registriert die Fächer und stellt das "spiel"-
// Controller-Objekt bereit, über das die UI mit der Logik spricht. Enthält die
// Spielschleife, das Maus-Zielen, das Wirken der Zauber, Meilenstein-Drops und
// Auto-Save inkl. Offline-Nachholen.
// =============================================================================

import * as THREE from 'three';

import { LOOK } from './data/look.js';
import { PFLANZEN, PFLANZEN_LISTE } from './data/pflanzen.js';
import { BIOME } from './data/biome.js';
import { waehleSpezialpflanze, SPEZIAL_LISTE } from './data/spezialpflanzen.js';
import { SKILLS, berechneSkillEffekte } from './data/skills.js';
import {
  KOSMETIK, KOSMETIK_LISTE, KOSMETIK_NIVEAU, titelFuer, naechsterTitel, loeseKosmetikAuf,
} from './data/kosmetik.js';

import { Spielfeld } from './core/spielfeld.js';
import { serienFaktor } from './core/progression.js';
import {
  neuerSpielstand, ladeSpielstand, speichere, fuegeInventar,
  verkaufeAlles, vergebeXP, loescheSpielstand, setzeAktivenNutzer,
} from './core/spielzustand.js';
import { beschleunige, pflanzeSpezial, ernteSlot } from './core/gewaechshaus.js';
import { registriereFach, holeFach, alleFaecher } from './core/fachregister.js';
import { pruefeErfolge } from './core/erfolge.js';
import { berechneErfolgEffekte } from './data/erfolge.js';
import { zauberWirkKosten } from './core/progression.js';
import { auth } from './core/auth.js';
import { initialisiereCloud, CLOUD_AKTIV, synchronisiereBeimStart, spueleCloud } from './core/cloud.js';
import { zeigeStartbildschirm } from './ui/startbildschirm.js';

import { matheModul } from './faecher/mathe.js';
import { chemieModul } from './faecher/chemie.js';
import { biologieModul } from './faecher/biologie.js';
import { physikModul } from './faecher/physik.js';
import { deutschModul } from './faecher/deutsch.js';
import { englischModul } from './faecher/englisch.js';
import { franzoesischModul } from './faecher/franzoesisch.js';
import { lateinModul } from './faecher/latein.js';
import { spanischModul } from './faecher/spanisch.js';
import { informatikModul } from './faecher/informatik.js';
import { geschichteModul } from './faecher/geschichte.js';
import { erdkundeModul } from './faecher/erdkunde.js';
import { musikModul } from './faecher/musik.js';
import { kunstModul } from './faecher/kunst.js';
import { politikWirtschaftModul } from './faecher/politik_wirtschaft.js';
import { religionModul } from './faecher/religion.js';
import { werteNormenModul } from './faecher/werte_normen.js';
import { STUB_FAECHER } from './faecher/stubs.js';

import { erstelleSzene } from './render/szene.js';
import { Welt } from './render/welt.js';
import { erstelleAvatarVorschau } from './render/avatar.js';
import { UI } from './ui/ui.js';

// --- Fächer registrieren (elf voll ausgebaute Fächer + Stubs) ----------------
// Aufgabenfeld C: Mathe, Physik, Chemie, Biologie
registriereFach(matheModul);
registriereFach(physikModul);
registriereFach(chemieModul);
registriereFach(biologieModul);
// Aufgabenfeld A: Deutsch, Englisch, Französisch, Latein, Spanisch, Musik, Kunst
registriereFach(deutschModul);
registriereFach(englischModul);
registriereFach(franzoesischModul);
registriereFach(lateinModul);
registriereFach(spanischModul);
registriereFach(musikModul);
registriereFach(kunstModul);
// Aufgabenfeld C: Informatik
registriereFach(informatikModul);
// Aufgabenfeld B: Geschichte, Erdkunde, Politik-Wirtschaft, Religion, Werte/Normen
registriereFach(geschichteModul);
registriereFach(erdkundeModul);
registriereFach(politikWirtschaftModul);
registriereFach(religionModul);
registriereFach(werteNormenModul);
// Übrige Oberstufenfächer als Stubs
for (const fach of STUB_FAECHER) registriereFach(fach);

// --- Acker-Vergrößerung (fach-übergreifend) ----------------------------------
const ACKER_BASIS = LOOK.gitterRadius;     // Start-Radius
const ACKER_MAX = LOOK.gitterRadius + 8;   // maximal so weit ausbaubar
// Kosten der nächsten Umrandung (steigt mit jeder bereits gekauften Stufe).
const ackerKosten = (radius) => Math.round(150 * Math.pow(1.7, radius - ACKER_BASIS));

// --- Cloud (Supabase) scharfschalten, falls konfiguriert ---------------------
// Setzt Auth-Adapter + Speicher-Hook. Ohne Schlüssel in cloud-config.js ein
// No-op → lokaler Login + localStorage wie bisher.
initialisiereCloud();

// --- Anmeldung (Login-Gate) --------------------------------------------------
// Vor dem Spielstart muss ein Nutzer angemeldet sein. Eine bestehende Sitzung
// startet direkt durch; sonst erscheint der Anmelde-/Registrier-Bildschirm.
// (top-level await: das Spiel wird erst nach erfolgreicher Anmeldung aufgebaut.)
const nutzer = (await auth.sitzung()) || await zeigeStartbildschirm(auth);
setzeAktivenNutzer(nutzer.id); // eigener Spielstand pro Nutzer (DB-Grundlage)

// Cloud ↔ lokaler Cache abgleichen (neuerer Stand gewinnt), bevor geladen wird.
if (CLOUD_AKTIV) {
  try { await synchronisiereBeimStart(nutzer.id); }
  catch (e) { console.warn('Cloud-Start-Sync:', e); }
}

// --- Spielstand laden oder neu anlegen ---------------------------------------
const state = ladeSpielstand() || neuerSpielstand();
state.nutzerId = nutzer.id;       // Besitzer des Spielstands (für eine spätere DB)
state.nutzerName = nutzer.username;
const now0 = Date.now();

// --- Szene & Welt aufbauen ---------------------------------------------------
const canvas = document.getElementById('buehne');
const szene = erstelleSzene(canvas, LOOK);
const welt = new Welt(szene.scene, LOOK);

// Pflanzenfarben an den Renderer geben (datengetrieben).
const pflanzenFarben = {};
for (const p of Object.values(PFLANZEN)) pflanzenFarben[p.id] = p.farbe;
welt.setzePflanzenFarben(pflanzenFarben);

// --- Spielfeld erzeugen / wiederherstellen -----------------------------------
const spielfeld = new Spielfeld(state.ackerRadius || LOOK.gitterRadius);
const aktivesBiome = () => BIOME[state.aktivesBiome] || BIOME.bauernhof;
if (state.feldDaten) spielfeld.lade(state.feldDaten, now0);
else spielfeld.saatBiome(aktivesBiome(), now0);

// Sichtbares Gitter an einen ggf. bereits vergrößerten Acker angleichen.
if (welt.radius !== spielfeld.radius) welt.setzeRadius(spielfeld.radius);

// Palette des aktuellen Bioms anwenden.
welt.setzeBiomePalette(aktivesBiome().palette);
szene.setzePalette(aktivesBiome().palette);

// Angelegte kosmetische Gegenstände auf den Bauern anwenden.
welt.setzeKosmetik(loeseKosmetikAuf(state.kosmetik || {}));

// --- Effekt-Multiplikatoren --------------------------------------------------
// Kombiniert die Skill-Baum-Effekte mit den prozentualen Erfolgs-Boni. Alle
// Einsatzstellen (Verkauf, Wissen, XP, Essenz) lesen dieselbe Funktion.
const skillEffekte = () => {
  const e = berechneSkillEffekte(state.skills);
  const b = berechneErfolgEffekte(state.erfolge || []);
  e.marktFaktor *= 1 + (b.geld || 0);    // Erfolge: mehr Verkaufserlös
  e.wissenFaktor *= 1 + (b.wissen || 0); // Erfolge: mehr Wissen
  e.xpFaktor *= 1 + (b.xp || 0);         // Erfolge: mehr XP
  e.essenzFaktor *= 1 + (b.essenz || 0); // Erfolge: mehr Essenz
  return e;
};
// Wendet die "passiven" Effekte an, die irgendwo gespeichert werden müssen
// (Acker-Wachstumstempo). Die übrigen Effekte werden direkt am Einsatzort gelesen.
function wendeSkillsAn() {
  spielfeld.tempo = skillEffekte().ackerTempo;
}
wendeSkillsAn();

// --- Zielwinkel (θ) ----------------------------------------------------------
let thetaDeg = 0;
const thetaRad = () => (thetaDeg * Math.PI) / 180;

// Gratis-Zauber-Fenster: bis zu diesem Zeitpunkt (ms) kosten Zauber kein Wissen
// (Belohnung für eine gelöste Pop-up-Frage). 0 = inaktiv.
let gratisZaubernBis = 0;

// Flag: während eines Reset wird nicht mehr gespeichert (siehe sofortSpeichern).
let resetLaeuft = false;

// Berechnet die aktuell anvisierten Felder (ohne zu ernten) für die Live-Vorschau.
// Vollständig fach-agnostisch: fragt das aktive Fach nach Zielfeldern + Visual.
function aktualisiereVorschau() {
  const fach = holeFach(state.aktivesFach) || matheModul;
  if (!fach.implementiert || typeof fach.berechneVorschau !== 'function') { welt.setzeVorschau([]); return; }
  const zauber = fach.zauberAn(state.aktiverZauber);
  if (!zauber) { welt.setzeVorschau([]); return; }
  const params = fach.paramsFuer(zauber, state.zauberStufen[zauber.id] || {});
  params.theta = thetaRad();
  params.ackerRadius = spielfeld.radius;
  const { ziele, visual } = fach.berechneVorschau(zauber, params);
  welt.setzeVorschau(ziele);
  if (visual?.richtung) welt.setzeZielrichtung(visual.richtung.x, visual.richtung.y);
}

// Schaltet die Gratis-Starterzauber eines Fachs frei (Wissen 0, Niveau ≤ 1).
function entsperreStarter(fach) {
  if (typeof fach?.alleZauber !== 'function') return;
  for (const z of fach.alleZauber()) {
    const wissen = z.freischalt?.wissen ?? 0;
    const niveau = z.freischalt?.niveau ?? 1;
    if (wissen === 0 && niveau <= 1 && !state.freigeschalteteZauber.includes(z.id)) {
      state.freigeschalteteZauber.push(z.id);
    }
  }
}

// Setzt den aktiven Zauber eines Fachs: zuletzt gewählter, sonst erster freier.
function setzeAktivenZauberFuer(fach) {
  if (!state.aktiveZauberProFach) state.aktiveZauberProFach = {};
  const merk = state.aktiveZauberProFach[fach.id];
  const liste = typeof fach.alleZauber === 'function' ? fach.alleZauber() : [];
  if (merk && state.freigeschalteteZauber.includes(merk) && fach.zauberAn?.(merk)) {
    state.aktiverZauber = merk;
  } else {
    const ersten = liste.find((z) => state.freigeschalteteZauber.includes(z.id)) || liste[0];
    if (ersten) state.aktiverZauber = ersten.id;
  }
  state.aktiveZauberProFach[fach.id] = state.aktiverZauber;
}

// =============================================================================
// SPIEL-CONTROLLER — die einzige Schnittstelle, die die UI benutzt
// =============================================================================
const spiel = {
  getState: () => state,
  getFach: () => holeFach(state.aktivesFach) || matheModul,
  getTheta: () => thetaDeg,

  setTheta(grad) {
    thetaDeg = ((grad % 360) + 360) % 360;
    aktualisiereVorschau();
    ui.setThetaAnzeige(thetaDeg);
  },

  // --- Zauber wirken -------------------------------------------------------
  wirkeAktiverZauber() {
    const fach = this.getFach();
    if (!fach.implementiert) { ui.toast('Dieses Fach ist noch nicht spielbar.'); return; }
    const zauber = fach.zauberAn(state.aktiverZauber);
    if (!zauber || !state.freigeschalteteZauber.includes(zauber.id)) { ui.toast('Kein Zauber ausgewählt.'); return; }

    // Wissens-Kosten je Wurf (stärkere Zauber kosten mehr). Während des Gratis-
    // Fensters (nach gelöster Pop-up-Frage) ist Zaubern kostenlos.
    const gratis = Date.now() < gratisZaubernBis;
    const wirkKosten = gratis ? 0 : zauberWirkKosten(zauber.tier || 1);
    if (state.wissen < wirkKosten) {
      ui.toast(`Nicht genug Wissen (${wirkKosten} 📘 nötig) — löse zuerst eine Aufgabe!`);
      return;
    }
    state.wissen -= wirkKosten;

    // Erfolgs-Tracking: gewirkte Zauber + Formen + gespieltes Fach (dedupliziert).
    (state.gewirkteZauber ||= []); if (!state.gewirkteZauber.includes(zauber.id)) state.gewirkteZauber.push(zauber.id);
    (state.gewirkteFormen ||= []); if (zauber.form && !state.gewirkteFormen.includes(zauber.form)) state.gewirkteFormen.push(zauber.form);
    (state.gespielteFaecher ||= []); if (!state.gespielteFaecher.includes(state.aktivesFach)) state.gespielteFaecher.push(state.aktivesFach);

    const params = fach.paramsFuer(zauber, state.zauberStufen[zauber.id] || {});
    params.theta = thetaRad();
    params.now = Date.now();
    params.ackerRadius = spielfeld.radius;
    const ergebnis = fach.wirkeZauber(zauber, params, spielfeld);

    // Ernte verbuchen
    const eff = skillEffekte();
    let anzahl = 0;
    const trefferFelder = [];
    for (const { feld, pflanze } of ergebnis.geerntet) {
      fuegeInventar(state, pflanze.id, 1);
      vergebeXP(state, Math.round((pflanze.xp || 1) * eff.xpFaktor));
      state.gesamtErnten += eff.ernteFaktor; // Skill "Doppelte Ernte" zählt doppelt
      anzahl += 1;
      // Pflanzenart für den Codex als entdeckt markieren.
      if (!state.entdecktePflanzen) state.entdecktePflanzen = [];
      if (!state.entdecktePflanzen.includes(pflanze.id)) state.entdecktePflanzen.push(pflanze.id);
      trefferFelder.push({ gx: feld.gx, gy: feld.gy });
    }
    pruefeMeilensteine();

    // Effekte (Kurve oder Splash-Fläche, je nach Zauberform)
    welt.zeigeVisual(ergebnis.visual);
    welt.trefferBurst(trefferFelder.length ? trefferFelder : ergebnis.ziele, Date.now());

    let info = anzahl > 0 ? `+${anzahl} ${anzahl === 1 ? 'Pflanze' : 'Pflanzen'} geerntet!` : 'Keine erntereifen Felder getroffen.';
    if (gratis) info += '  ✨ gratis';
    else if (wirkKosten > 0) info += `  (−${wirkKosten} 📘)`;
    ui.toast(info);

    ui.aktualisiereHUD();
    speichere(state);
  },

  zauberWaehlen(id) {
    if (!state.freigeschalteteZauber.includes(id)) return;
    state.aktiverZauber = id;
    if (!state.aktiveZauberProFach) state.aktiveZauberProFach = {};
    state.aktiveZauberProFach[state.aktivesFach] = id;
    aktualisiereVorschau();
    speichere(state);
  },

  zauberFreischalten(id) {
    if (state.freigeschalteteZauber.includes(id)) return { ok: false, grund: 'Bereits freigeschaltet.' };
    const fach = this.getFach();
    const z = fach.zauberAn ? fach.zauberAn(id) : null;
    if (!z) return { ok: false, grund: 'Unbekannter Zauber.' };
    // Niveau-Gate: stärkere Zauber verlangen mehr Meisterung im Thema. WICHTIG:
    // dasselbe (gerundete) Niveau verwenden, das auch angezeigt wird — sonst kann
    // man bei angezeigtem „Niveau 3" einen Niveau-3-Zauber nicht freischalten.
    const reqNiveau = z.freischalt?.niveau ?? 1;
    const niveau = (typeof fach.niveauFuer === 'function')
      ? fach.niveauFuer(state, z.themaId)
      : Math.round(state.meisterung?.[z.themaId] ?? 1);
    if (niveau < reqNiveau) {
      return { ok: false, grund: `Erst ab Thema-Niveau ${reqNiveau} (aktuell ${niveau}).` };
    }
    if (state.wissen < z.freischalt.wissen) return { ok: false, grund: 'Nicht genug Wissen.' };
    state.wissen -= z.freischalt.wissen;
    state.freigeschalteteZauber.push(id);
    state.aktiverZauber = id;
    if (!state.aktiveZauberProFach) state.aktiveZauberProFach = {};
    state.aktiveZauberProFach[state.aktivesFach] = id;
    aktualisiereVorschau();
    speichere(state);
    return { ok: true };
  },

  upgradeKaufen(zauberId, schluessel) {
    const fach = this.getFach();
    const z = fach.zauberAn ? fach.zauberAn(zauberId) : null;
    const up = z?.upgrades.find((u) => u.schluessel === schluessel);
    if (!up) return { ok: false, grund: 'Unbekanntes Upgrade.' };
    const stufen = (state.zauberStufen[zauberId] ||= {});
    const stufe = stufen[schluessel] || 0;
    if (stufe >= up.max) return { ok: false, grund: 'Maximale Stufe erreicht.' };
    const kosten = fach.upgradeKosten(z, schluessel, stufe);
    if (state.geld < kosten) return { ok: false, grund: 'Nicht genug Geld.' };
    state.geld -= kosten;
    stufen[schluessel] = stufe + 1;
    aktualisiereVorschau();
    speichere(state);
    return { ok: true };
  },

  verkaufen() {
    const erloes = verkaufeAlles(state, skillEffekte().marktFaktor);
    speichere(state);
    return erloes;
  },

  // --- Acker fach-übergreifend um eine ganze Umrandung vergrößern ----------
  ackerInfo() {
    const radius = state.ackerRadius || ACKER_BASIS;
    const max = radius >= ACKER_MAX;
    return { radius, kosten: ackerKosten(radius), max, kannKaufen: !max && state.geld >= ackerKosten(radius) };
  },
  ackerVergroessern() {
    const radius = state.ackerRadius || ACKER_BASIS;
    if (radius >= ACKER_MAX) return { ok: false, grund: 'Acker ist bereits maximal groß.' };
    const kosten = ackerKosten(radius);
    if (state.geld < kosten) return { ok: false, grund: 'Nicht genug Geld.' };
    state.geld -= kosten;
    state.ackerRadius = radius + 1;
    const now = Date.now();
    const neue = spielfeld.wachse(state.ackerRadius);   // neue Randfelder anlegen
    spielfeld.saeFelder(neue, aktivesBiome(), now);      // und besäen
    welt.setzeRadius(state.ackerRadius);                 // Gitter neu aufbauen
    welt.setzeBiomePalette(aktivesBiome().palette);      // Farben neu setzen
    aktualisiereVorschau();
    ui.aktualisiereHUD();
    speichere(state);
    return { ok: true, radius: state.ackerRadius };
  },

  // --- Entwicklung/Test: kompletten Spielstand zurücksetzen ----------------
  resetSpielstand() {
    resetLaeuft = true; // verhindert das Re-Speichern beim Entladen
    loescheSpielstand();
    location.reload(); // sauberster Weg zu einem frischen Zustand (inkl. Acker)
  },

  // Aktuellen Nutzer abmelden (Stand wird vorher gesichert) → Startbildschirm.
  getNutzer: () => nutzer,
  async abmelden() {
    resetLaeuft = true;          // doppeltes Speichern beim Entladen vermeiden
    state.feldDaten = spielfeld.serialisiere();
    speichere(state);            // Stand des aktuellen Nutzers lokal sichern
    await spueleCloud();         // letzten Stand sofort hochladen (noch angemeldet!)
    await auth.abmelden();       // Sitzung beenden (Supabase signOut)
    location.reload();           // zurück zum Anmelde-Bildschirm
  },

  antwortAbgeben(aufgabe, antwort, kontext) {
    const fach = this.getFach();
    const erg = fach.prüfeAntwort(aufgabe, antwort);
    fach.niveauAnpassen(state, aufgabe.themaId, erg.korrekt);

    // Lern-Statistik mitschreiben.
    state.aufgabenGesamt = (state.aufgabenGesamt || 0) + 1;
    if (erg.korrekt) state.aufgabenRichtig = (state.aufgabenRichtig || 0) + 1;

    const eff = skillEffekte();
    let gewinn = 0;
    if (erg.korrekt) {
      // Serien-/Streak-Bonus: fehlerfreie Folgen geben bis +100 % Belohnung.
      state.serie = (state.serie || 0) + 1;
      state.serieRekord = Math.max(state.serieRekord || 0, state.serie);
      const faktor = serienFaktor(state.serie);
      const basis = (erg.erhalteneXP || 0) * faktor;
      gewinn = Math.round(basis * eff.wissenFaktor);       // Skill "Gelehrter"
      state.wissen += gewinn;
      vergebeXP(state, Math.round(basis * eff.xpFaktor));    // Skill "Erfahren"
      const serieText = state.serie >= 2 ? `  🔥 Serie ×${state.serie} (+${Math.round((faktor - 1) * 100)} %)` : '';
      erg.feedback = `✅ +${gewinn} 📘${serieText}  ${erg.feedback}`.trim();
      // Gewächshaus-Boost: pro Wissenspunkt 1 Minute schneller.
      if (kontext?.typ === 'gewaechshaus') {
        beschleunige(state.gewaechshaus, kontext.slotIndex, gewinn * 60 * 1000);
        ui.toast(`🌱 Wachstum +${gewinn} Minuten!`);
      }
    } else {
      state.serie = 0; // Streak reißt bei einem Fehler ab
    }
    erg.gewinn = gewinn;
    speichere(state);
    ui.aktualisiereHUD();
    return erg;
  },

  // Karte betreten — fach-unabhängig. Noch gesperrte Karten werden mit 💰 Geld
  // freigeschaltet (einmalig, danach jederzeit frei wechselbar).
  biomeWechseln(id) {
    const b = BIOME[id];
    if (!b) return { ok: false, grund: 'Unbekannte Karte.' };
    if (!state.freigeschalteteBiome) state.freigeschalteteBiome = ['bauernhof'];
    if (!state.freigeschalteteBiome.includes(id)) {
      const kosten = b.kosten || 0;
      if (state.geld < kosten) return { ok: false, grund: 'Nicht genug Geld zum Freischalten.' };
      state.geld -= kosten;
      state.freigeschalteteBiome.push(id);
    }
    state.aktivesBiome = id;
    spielfeld.saatBiome(b, Date.now());     // Acker mit den Pflanzen der Karte neu besäen
    welt.setzeBiomePalette(b.palette);
    szene.setzePalette(b.palette);
    aktualisiereVorschau();
    ui.aktualisiereHUD();
    speichere(state);
    return { ok: true };
  },

  fachWechseln(id) {
    const f = holeFach(id);
    if (!f) return;
    if (!f.implementiert) { ui.toast(`${f.name} ist noch nicht implementiert.`); return; }
    state.aktivesFach = id;
    (state.gespielteFaecher ||= []); if (!state.gespielteFaecher.includes(id)) state.gespielteFaecher.push(id);
    entsperreStarter(f);          // Gratis-Starterzauber des Fachs sicherstellen
    setzeAktivenZauberFuer(f);    // passenden aktiven Zauber für das Fach wählen
    aktualisiereVorschau();
    ui.aktualisiereHUD();
    speichere(state);
  },

  spezialEinpflanzen(slotIndex, spezialId) {
    const idx = state.spezialLager.indexOf(spezialId);
    if (idx < 0) return;
    if (pflanzeSpezial(state.gewaechshaus, slotIndex, spezialId, Date.now())) {
      // Skill "Treibhaus-Turbo": Reifezeit dieses Beets verkürzen.
      const slot = state.gewaechshaus.slots[slotIndex];
      if (slot) slot.gesamtMs = Math.round(slot.gesamtMs * skillEffekte().gewaechsTempo);
      state.spezialLager.splice(idx, 1);
      speichere(state);
    }
  },

  spezialErnten(slotIndex) {
    const belohnung = ernteSlot(state.gewaechshaus, slotIndex, Date.now());
    if (belohnung) {
      state.geld += belohnung.belohnung.geld;
      state.wissen += belohnung.belohnung.wissen;
      // 🔮 Essenz (Basis × Skill "Essenzfluss") für den Skill-Baum.
      const essenz = Math.round((belohnung.belohnung.essenz || 0) * skillEffekte().essenzFaktor);
      belohnung.belohnung.essenz = essenz;
      state.essenz = (state.essenz || 0) + essenz;
      speichere(state);
    }
    return belohnung;
  },

  // --- Skill-Baum: Skill mit 🔮 Essenz freischalten/aufwerten ---------------
  skillKaufen(id) {
    const skill = SKILLS[id];
    if (!skill) return { ok: false, grund: 'Unbekannter Skill.' };
    const stufe = state.skills[id] || 0;
    if (stufe >= skill.maxStufe) return { ok: false, grund: 'Maximale Stufe erreicht.' };
    if (skill.voraussetzung && !(state.skills[skill.voraussetzung] > 0)) {
      return { ok: false, grund: `Erst „${SKILLS[skill.voraussetzung].name}" freischalten.` };
    }
    const kosten = skill.kosten(stufe);
    if ((state.essenz || 0) < kosten) return { ok: false, grund: 'Nicht genug Essenz.' };
    state.essenz -= kosten;
    state.skills[id] = stufe + 1;
    wendeSkillsAn();          // passive Effekte (Acker-Tempo) übernehmen
    ui.aktualisiereHUD();
    speichere(state);
    return { ok: true };
  },

  // --- Pop-up-Quiz & Gratis-Zauber-Fenster ---------------------------------
  // Wissens-Kosten des aktiven Zaubers (0 während des Gratis-Fensters).
  aktuelleZauberKosten() {
    const fach = this.getFach();
    const z = fach.zauberAn ? fach.zauberAn(state.aktiverZauber) : null;
    if (!z) return 0;
    if (Date.now() < gratisZaubernBis) return 0;
    return zauberWirkKosten(z.tier || 1);
  },
  gratisRestMs() { return Math.max(0, gratisZaubernBis - Date.now()); },
  starteGratisZaubern(sekunden = 5) {
    gratisZaubernBis = Date.now() + sekunden * 1000;
    ui.aktualisiereHUD();
  },
  // Erzeugt eine Frage aus dem aktuellen Fach für das Pop-up-Quiz.
  erzeugeQuizAufgabe() {
    const fach = this.getFach();
    if (!fach.implementiert || typeof fach.erzeugeAufgabe !== 'function') return null;
    const themen = fach.themen();
    const t = themen[Math.floor(Math.random() * themen.length)];
    return fach.erzeugeAufgabe(t.id, fach.niveauFuer(state, t.id));
  },
  // Prüft eine Quiz-Antwort. Richtig → 5 s Gratis-Zaubern + kleine Wissens-
  // belohnung. Falsch/Timeout → nichts passiert (kein Streak-Verlust).
  quizAntwort(aufgabe, antwort) {
    const fach = this.getFach();
    const erg = fach.prüfeAntwort(aufgabe, antwort);
    if (erg.korrekt) {
      gratisZaubernBis = Date.now() + 5000;
      if (erg.erhalteneXP) state.wissen += erg.erhalteneXP;
      ui.aktualisiereHUD();
      speichere(state);
    }
    return { korrekt: erg.korrekt, feedback: erg.feedback };
  },

  // --- Charakter: Titel & Kosmetik -----------------------------------------
  titelInfo() {
    return { aktuell: titelFuer(state.level), naechster: naechsterTitel(state.level), level: state.level };
  },
  // Liste aller Kosmetik-Gegenstände mit Status (freigeschaltet / angelegt).
  kosmetikInfo() {
    return KOSMETIK_LISTE.map((item) => ({
      item,
      frei: kosmetikFrei(item),
      angelegt: state.kosmetik?.[item.slot] === item.id,
    }));
  },
  // Aktuelle Avatar-Konfiguration (für die Menü-Vorschau).
  kosmetikVorschauCfg() { return loeseKosmetikAuf(state.kosmetik || {}); },
  // Legt einen Gegenstand an/ab (Toggle). id===null legt den Slot frei.
  kosmetikAnlegen(slot, id) {
    if (!state.kosmetik) state.kosmetik = { stab: null, hut: null, kutte: null };
    if (id === null) {
      state.kosmetik[slot] = null;
    } else {
      const item = KOSMETIK[id];
      if (!item || item.slot !== slot) return { ok: false, grund: 'Unbekannter Gegenstand.' };
      if (!kosmetikFrei(item)) return { ok: false, grund: 'Noch nicht freigeschaltet.' };
      state.kosmetik[slot] = (state.kosmetik[slot] === id) ? null : id; // Toggle
    }
    welt.setzeKosmetik(loeseKosmetikAuf(state.kosmetik));
    speichere(state);
    return { ok: true };
  },
  // Erzeugt die 3D-Vorschau im Charakter-Menü (eigener Mini-Renderer).
  erstelleAvatarVorschau(canvas) { return erstelleAvatarVorschau(canvas); },
};

// --- Meilenstein-Logik: alle 100 Ernten eine Spezialpflanze ------------------
function pruefeMeilensteine() {
  while (state.gesamtErnten >= state.naechsterMeilenstein) {
    state.meilensteinNr += 1;
    const id = waehleSpezialpflanze(state.meilensteinNr);
    state.spezialLager.push(id);
    if (!state.spezialSammlung.includes(id)) state.spezialSammlung.push(id);
    state.naechsterMeilenstein += skillEffekte().meilensteinAbstand; // Skill "Sammler"
    ui.toast('🌟 Spezialpflanze erhalten! Ab ins Gewächshaus.');
  }
}

// --- Kosmetik freigeschaltet? In ALLEN Themen des Fachs das geforderte Niveau? -
function kosmetikFrei(item) {
  const f = holeFach(item.fachId);
  if (!f || !f.implementiert || typeof f.niveauFuer !== 'function') return false;
  const need = item.niveau || KOSMETIK_NIVEAU;
  return f.themen().every((t) => f.niveauFuer(state, t.id) >= need);
}

// --- Erfolge prüfen: neu erfüllte freischalten, Bonus vergeben, Meldung zeigen
function checkErfolge() {
  const ctx = {
    pflanzenGesamt: PFLANZEN_LISTE.length,
    spezialGesamt: SPEZIAL_LISTE.length,
    faecherGesamt: alleFaecher().filter((f) => f.implementiert).length,
    biomeGesamt: Object.keys(BIOME).length,
    ackerMax: ACKER_MAX,
  };
  const neu = pruefeErfolge(state, ctx);
  if (!neu.length) return;
  // Boni sind DAUERHAFT (prozentual, via skillEffekte) — hier nur Freischalt-Meldung.
  for (const e of neu) ui.toast(`🏆 Erfolg freigeschaltet: ${e.icon} ${e.name}`);
  ui.aktualisiereHUD();
  speichere(state);
}

// --- Startzustand: Starter des aktiven Fachs + gültigen aktiven Zauber sichern
(() => {
  const f = holeFach(state.aktivesFach) || matheModul;
  entsperreStarter(f);
  if (!state.aktiveZauberProFach) state.aktiveZauberProFach = {};
  if (!state.freigeschalteteZauber.includes(state.aktiverZauber) || !f.zauberAn?.(state.aktiverZauber)) {
    setzeAktivenZauberFuer(f);
  } else {
    state.aktiveZauberProFach[f.id] = state.aktiverZauber;
  }
})();

// =============================================================================
// UI aufbauen & verdrahten
// =============================================================================
const ui = new UI(spiel);
ui.setThetaAnzeige(thetaDeg);
aktualisiereVorschau();
checkErfolge(); // rückwirkend bereits erfüllte Erfolge beim Laden freischalten

// Beim ALLERERSTEN Login die Tutorial-Tour automatisch starten (danach nur noch
// manuell über den ?-Knopf). Kurze Verzögerung, bis das Layout steht.
if (!state.tutorialGesehen) {
  state.tutorialGesehen = true;
  speichere(state);
  setTimeout(() => ui.starteTutorial(), 700);
}

// --- Maus-Zielen: Pointer auf die Bodenebene projizieren ---------------------
const raycaster = new THREE.Raycaster();
const bodenEbene = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = new THREE.Vector2();
const trefferPunkt = new THREE.Vector3();
let zeigerUnten = null; // für Klick-vs-Ziehen-Erkennung

function zeigerZuWinkel(ev) {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, szene.camera);
  if (!raycaster.ray.intersectPlane(bodenEbene, trefferPunkt)) return null;
  const gx = trefferPunkt.x / LOOK.kachelGroesse;
  const gy = -trefferPunkt.z / LOOK.kachelGroesse;
  if (Math.abs(gx) < 0.001 && Math.abs(gy) < 0.001) return null;
  return (Math.atan2(gy, gx) * 180) / Math.PI;
}

canvas.addEventListener('pointermove', (ev) => {
  const grad = zeigerZuWinkel(ev);
  if (grad != null) spiel.setTheta(grad);
});
canvas.addEventListener('pointerdown', (ev) => {
  zeigerUnten = { x: ev.clientX, y: ev.clientY, t: performance.now() };
});
canvas.addEventListener('pointerup', (ev) => {
  if (!zeigerUnten) return;
  const dist = Math.hypot(ev.clientX - zeigerUnten.x, ev.clientY - zeigerUnten.y);
  const dauer = performance.now() - zeigerUnten.t;
  zeigerUnten = null;
  // Kurzer Klick ohne nennenswertes Ziehen = Zaubern (Ziehen = Kamera drehen).
  if (dist < 6 && dauer < 400) spiel.wirkeAktiverZauber();
});

// Leertaste zaubert ebenfalls (außer beim Tippen in Eingabefeldern).
window.addEventListener('keydown', (ev) => {
  if (ev.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    ev.preventDefault();
    spiel.wirkeAktiverZauber();
  }
});

// =============================================================================
// Spielschleife
// =============================================================================
let letzteZeit = performance.now();
let sekundenAkku = 0;
let speicherAkku = 0;
let quizAkku = 0;
const QUIZ_INTERVALL = 300; // alle 5 Minuten ein Pop-up-Quiz

function schleife(jetzt) {
  const dt = Math.min(0.05, (jetzt - letzteZeit) / 1000);
  letzteZeit = jetzt;
  const now = Date.now();

  szene.controls.update();
  spielfeld.aktualisiere(now, aktivesBiome());
  welt.aktualisiere(spielfeld, dt, now);
  szene.renderer.render(szene.scene, szene.camera);

  // einmal pro Sekunde HUD/Timer auffrischen
  sekundenAkku += dt;
  if (sekundenAkku >= 1) {
    sekundenAkku = 0;
    ui.aktualisierePeriodisch();
    checkErfolge();
  }
  // alle 10 Sekunden automatisch speichern (inkl. Acker-Schnappschuss)
  speicherAkku += dt;
  if (speicherAkku >= 10 && !resetLaeuft) {
    speicherAkku = 0;
    state.feldDaten = spielfeld.serialisiere();
    speichere(state);
  }
  // alle 5 Minuten ein Pop-up-Quiz (löst der Spieler es, darf er kurz gratis zaubern)
  quizAkku += dt;
  if (quizAkku >= QUIZ_INTERVALL) {
    quizAkku = 0;
    ui.starteQuiz();
  }

  requestAnimationFrame(schleife);
}
requestAnimationFrame(schleife);

// Beim Schließen/Verstecken sofort speichern (für Idle-Wachstum wichtig).
// Während eines Reset NICHT speichern, sonst überschreibt das Entladen den eben
// gelöschten Spielstand wieder.
function sofortSpeichern() {
  if (resetLaeuft) return;
  state.feldDaten = spielfeld.serialisiere();
  speichere(state);
}
window.addEventListener('beforeunload', sofortSpeichern);
document.addEventListener('visibilitychange', () => { if (document.hidden) sofortSpeichern(); });

// Für die Konsole/Debugging zugänglich machen.
window.ZauberAcker = { state, spiel, spielfeld, welt, szene, ui };
