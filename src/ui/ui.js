// =============================================================================
// ui.js — Gesamte Bedienoberfläche (HUD, Werkzeugleiste, Panels)
// -----------------------------------------------------------------------------
// Die UI ist bewusst von der Spiellogik getrennt: Sie liest Daten über das
// "spiel"-Controller-Objekt (aus main.js) und ruft dessen Methoden auf. Dadurch
// bleibt der Kern testbar und die UI austauschbar.
// =============================================================================

import { BIOME } from '../data/biome.js';
import { SPEZIALPFLANZEN, SPEZIAL_LISTE } from '../data/spezialpflanzen.js';
import { PFLANZEN, PFLANZEN_LISTE } from '../data/pflanzen.js';
import { fortschritt as ghFortschritt, istReif, verstrichen } from '../core/gewaechshaus.js';
import { alleFaecher } from '../core/fachregister.js';
import { SKILL_LISTE, SKILLS } from '../data/skills.js';
import { ERFOLG_LISTE } from '../data/erfolge.js';
import { SLOT_NAMEN, KOSMETIK_NIVEAU } from '../data/kosmetik.js';
import { Tutorial } from './tutorial.js';

// --- Mini-Helfer zum DOM-Bau ------------------------------------------------
function el(tag, props = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (v != null) e.setAttribute(k, v);
  }
  for (const kind of kinder.flat()) {
    if (kind == null) continue;
    e.append(kind.nodeType ? kind : document.createTextNode(kind));
  }
  return e;
}

function formatDauer(ms) {
  if (ms <= 0) return 'fertig';
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sek}s`;
  return `${sek}s`;
}

export class UI {
  constructor(spiel) {
    this.spiel = spiel;
    this.aktivesPanel = null;
    this.aktuelleAufgabe = null;
    this.aufgabenKontext = { typ: 'normal' };
    this._baueGeruest();
  }

  // ----------------------------------------------------------- Grundgerüst
  _baueGeruest() {
    const wurzel = el('div', { id: 'ui-wurzel' });

    // HUD (oben)
    this.hud = el('div', { id: 'hud' });
    wurzel.append(this.hud);

    // Unten-Container: stapelt Steuerung + Werkzeugleiste überlappungsfrei.
    this.unten = el('div', { id: 'unten' });

    // Zauber-Steuerung (oben im Stapel): aktiver Zauber, θ, Wirken
    this.steuerung = el('div', { id: 'steuerung' });
    this.unten.append(this.steuerung);

    // Werkzeugleiste (unten im Stapel)
    this.werkzeugleiste = el('div', { id: 'werkzeugleiste' });
    const knoepfe = [
      ['📒', 'Aufgaben', () => { this.aufgabenKontext = { typ: 'normal' }; this.oeffne('aufgaben'); }],
      ['🛒', 'Markt', () => this.oeffne('markt')],
      ['✨', 'Zauberbuch', () => this.oeffne('zauberbuch')],
      ['⬆️', 'Upgrades', () => this.oeffne('upgrades')],
      ['🪴', 'Gewächshaus', () => this.oeffne('gewaechshaus')],
      ['🌳', 'Skills', () => this.oeffne('skills')],
      ['🏆', 'Erfolge', () => this.oeffne('erfolge')],
      ['🧙', 'Charakter', () => this.oeffne('charakter')],
      ['📖', 'Codex', () => this.oeffne('codex')],
      ['🗺️', 'Karten', () => this.oeffne('karten')],
    ];
    for (const [icon, name, fn] of knoepfe) {
      this.werkzeugleiste.append(el('button', { class: 'wz-btn', title: name, onclick: fn }, `${icon}`, el('span', {}, name)));
    }
    this.unten.append(this.werkzeugleiste);
    wurzel.append(this.unten);

    // Modal-Overlay für Panels
    this.overlay = el('div', { id: 'overlay', class: 'versteckt', onclick: (e) => { if (e.target === this.overlay) this.schliesse(); } });
    this.panel = el('div', { id: 'panel' });
    this.overlay.append(this.panel);
    wurzel.append(this.overlay);

    // Linke Fächer-Spalte (Emoji + Name) — ersetzt die Fach-Chips unten mittig.
    this.fachSpalte = el('div', { id: 'fach-spalte' });
    wurzel.append(this.fachSpalte);

    // Hilfe-/Tutorial-Knopf oben rechts (startet die Tour jederzeit neu).
    this.hilfeBtn = el('button', { id: 'hilfe-btn', title: 'Tutorial / Hilfe', onclick: () => this.starteTutorial() }, '?');
    wurzel.append(this.hilfeBtn);

    // Toast-Bereich
    this.toastBereich = el('div', { id: 'toasts' });
    wurzel.append(this.toastBereich);

    document.body.append(wurzel);

    this._baueSteuerung();
    this.aktualisiereHUD();

    // Spotlight-Tour (Onboarding) — wird beim ersten Login von main.js gestartet.
    this.tutorial = new Tutorial();
  }

  // Startet die Spotlight-Tour über alle wichtigen Funktionen. Offenes Panel wird
  // vorher geschlossen, damit die Ziel-Elemente sichtbar sind.
  starteTutorial() {
    this.schliesse();
    const schritte = [
      { titel: '🌾 Willkommen bei ZauberAcker!', text: 'Du bist ein magischer Bauer und erntest Pflanzen mit Zaubersprüchen. Diese kurze Tour zeigt dir alle Funktionen — mit ▸ Weiter geht es los.' },
      { sel: '#fach-spalte', titel: 'Fächer wählen', text: 'Links wählst du dein Schulfach. Jedes Fach hat eigene Aufgaben und eine eigene Zauberform.' },
      { sel: '#zauber-leiste', titel: 'Aktiver Zauber', text: 'Hier siehst du deine freigeschalteten Zauber des Fachs und wechselst mit einem Klick. ➕ führt zum Zauberbuch.' },
      { sel: '#steuerung .theta-slider', titel: 'Zielen (Drehung θ)', text: 'Drehe den Zauber mit dem Regler — oder ziele einfach mit der Maus über den Acker.' },
      { sel: '#steuerung .wirk-btn', titel: 'Zaubern', text: 'Wirke den aktiven Zauber (kostet Wissen!). Geht auch per Klick auf den Acker oder mit der Leertaste.' },
      { sel: '#hud', titel: 'Deine Werte', text: '💰 Geld, 📘 Wissen, 🔮 Essenz, ⭐ Level und 🔥 Serie. Wissen brauchst du zum Zaubern und Freischalten.' },
      { sel: '.wz-btn[title="Aufgaben"]', titel: 'Aufgaben lösen', text: 'Löse Aufgaben → 📘 Wissen. Da Zauber Wissen kosten, ist das deine wichtigste Quelle. Alle 5 Min. erscheint außerdem eine Blitzfrage.' },
      { sel: '.wz-btn[title="Markt"]', titel: 'Markt', text: 'Verkaufe geerntete Pflanzen für 💰 Geld.' },
      { sel: '.wz-btn[title="Zauberbuch"]', titel: 'Zauberbuch', text: 'Schalte mit Wissen neue Zauber frei — stärkere brauchen mehr Thema-Niveau.' },
      { sel: '.wz-btn[title="Upgrades"]', titel: 'Upgrades', text: 'Werte deine Zauber auf (Reichweite, Fläche …) oder vergrößere den Acker.' },
      { sel: '.wz-btn[title="Gewächshaus"]', titel: 'Gewächshaus', text: 'Zieh Spezialpflanzen in Echtzeit groß und ernte sie für 🔮 Essenz.' },
      { sel: '.wz-btn[title="Skills"]', titel: 'Skill-Baum', text: 'Gib 🔮 Essenz für dauerhafte Verbesserungen aus.' },
      { sel: '.wz-btn[title="Erfolge"]', titel: 'Erfolge', text: 'Erfolge geben dauerhafte Prozent-Boni (mehr Geld, Wissen, Essenz, XP).' },
      { sel: '.wz-btn[title="Charakter"]', titel: 'Charakter', text: 'Dein Titel (vom Niveau abhängig) und kosmetische Gegenstände, die du pro Fach freischaltest.' },
      { sel: '.wz-btn[title="Codex"]', titel: 'Codex & Karten', text: 'Im Codex sammelst du alle Pflanzenarten; über 🗺️ Karten schaltest du neue Biome frei.' },
      { sel: '#hilfe-btn', titel: 'Jederzeit wieder hier', text: 'Diese Tour kannst du über das ?-Symbol oben rechts jederzeit erneut starten. Viel Spaß beim Zaubern! ✨' },
    ];
    this.tutorial.starte(schritte);
  }

  _baueSteuerung() {
    // Zauber-Schnellwahl unten; die Fach-Auswahl liegt in der linken Spalte.
    this.zauberLeiste = el('div', { class: 'schnellwahl', id: 'zauber-leiste' });

    this.thetaSlider = el('input', {
      type: 'range', min: '0', max: '360', value: '0', class: 'theta-slider',
      oninput: (e) => { this.spiel.setTheta(Number(e.target.value)); this.thetaWert.textContent = `${e.target.value}°`; },
    });
    this.thetaWert = el('span', { class: 'theta-wert' }, '0°');
    this.wirkBtn = el('button', { class: 'wirk-btn', onclick: () => this.spiel.wirkeAktiverZauber() }, '✨ Zaubern');

    this.steuerung.append(
      this.zauberLeiste,
      el('div', { class: 'st-zeile' }, el('span', { class: 'st-label' }, 'Drehung θ:'), this.thetaSlider, this.thetaWert),
      this.wirkBtn,
    );
    this._aktualisiereSchnellwahl();
  }

  // Aktualisiert die Beschriftung des Zaubern-Knopfs (Wissens-Kosten / Gratis).
  _aktualisiereWirkKnopf() {
    if (!this.wirkBtn || typeof this.spiel.aktuelleZauberKosten !== 'function') return;
    const gratis = this.spiel.gratisRestMs && this.spiel.gratisRestMs() > 0;
    const kosten = this.spiel.aktuelleZauberKosten();
    if (gratis) this.wirkBtn.textContent = `✨ Zaubern — GRATIS (${Math.ceil(this.spiel.gratisRestMs() / 1000)}s)`;
    else this.wirkBtn.textContent = kosten > 0 ? `✨ Zaubern (−${kosten} 📘)` : '✨ Zaubern';
  }

  // Baut die linke Fächer-Spalte (Emoji + Name) und die untere Zauber-Leiste neu
  // auf (aktives Fach/Zauber hervorgehoben).
  _aktualisiereSchnellwahl() {
    const s = this.spiel.getState();
    const fach = this.spiel.getFach();

    // Linke Fächer-Spalte: ein Knopf je implementiertem Fach mit Emoji + Name.
    if (this.fachSpalte) {
      this.fachSpalte.innerHTML = '';
      this.fachSpalte.append(el('div', { class: 'fach-spalte-titel' }, 'Fächer'));
      for (const f of alleFaecher()) {
        if (!f.implementiert) continue;
        const aktiv = s.aktivesFach === f.id;
        this.fachSpalte.append(el('button', {
          class: 'fach-btn' + (aktiv ? ' aktiv' : ''), title: f.name,
          onclick: () => this._fachWaehlen(f.id),
        }, el('span', { class: 'fach-emoji' }, f.icon), el('span', { class: 'fach-name' }, f.name)));
      }
    }

    // Untere Zauber-Leiste (Chips des aktiven Fachs).
    if (this.zauberLeiste) {
      this.zauberLeiste.innerHTML = '';
      this.zauberLeiste.append(el('span', { class: 'st-label' }, 'Zauber:'));
      const frei = (fach.alleZauber ? fach.alleZauber() : []).filter((z) => s.freigeschalteteZauber.includes(z.id));
      for (const z of frei) {
        const aktiv = s.aktiverZauber === z.id;
        this.zauberLeiste.append(el('button', {
          class: 'chip' + (aktiv ? ' aktiv' : ''), title: `${z.name} — ${z.beschreibung}`,
          onclick: () => { this.spiel.zauberWaehlen(z.id); this.aktualisiereHUD(); },
        }, z.icon));
      }
      // Direkt zum Zauberbuch (weitere Zauber freischalten).
      this.zauberLeiste.append(el('button', { class: 'chip mehr', title: 'Zauberbuch öffnen', onclick: () => this.oeffne('zauberbuch') }, '➕'));
    }
  }

  // Wechselt das aktive Fach und setzt den Aufgaben-Zustand sauber zurück.
  _fachWaehlen(id) {
    this.spiel.fachWechseln(id);
    this.aktuelleAufgabe = null;
    this._themaId = null;
    this.aktualisiereHUD();
    if (this.aktivesPanel) this._rendern();
  }

  // θ-Anzeige mit der Maus-Steuerung synchron halten.
  setThetaAnzeige(grad) {
    const g = Math.round(((grad % 360) + 360) % 360);
    this.thetaSlider.value = g;
    this.thetaWert.textContent = `${g}°`;
  }

  // -------------------------------------------------------------- HUD
  aktualisiereHUD() {
    const s = this.spiel.getState();
    const fach = this.spiel.getFach();
    const biome = BIOME[s.aktivesBiome];
    this.hud.innerHTML = '';
    this.hud.append(
      el('div', { class: 'hud-block' }, '💰', el('b', {}, `${Math.floor(s.geld)}`), el('small', {}, 'Geld')),
      el('div', { class: 'hud-block' }, '📘', el('b', {}, `${Math.floor(s.wissen)}`), el('small', {}, 'Wissen')),
      el('div', { class: 'hud-block' }, '🔮', el('b', {}, `${Math.floor(s.essenz || 0)}`), el('small', {}, 'Essenz')),
      el('div', { class: 'hud-block' }, '⭐', el('b', {}, `Lv ${s.level}`), el('small', {}, `${s.xp}/${s.xpNaechstesLevel} XP`)),
      el('div', { class: 'hud-block' }, '🔥', el('b', {}, `${s.serie || 0}`), el('small', {}, `Serie · Rekord ${s.serieRekord || 0}`)),
      el('div', { class: 'hud-block' }, biome?.icon || '🌻', el('b', {}, biome?.name || '—'), el('small', {}, fach?.name || '')),
      el('div', { class: 'hud-block' }, '🌱', el('b', {}, `${s.gesamtErnten}`), el('small', {}, `nächste Spezial: ${s.naechsterMeilenstein}`)),
    );
    this._aktualisiereSchnellwahl();
    this._aktualisiereWirkKnopf();
  }

  // -------------------------------------------------------------- Panels
  oeffne(id) {
    this.aktivesPanel = id;
    this.overlay.classList.remove('versteckt');
    this._rendern();
  }
  schliesse() {
    this.aktivesPanel = null;
    this.overlay.classList.add('versteckt');
    this._disposeAvatar();
  }
  // Gibt die 3D-Charakter-Vorschau frei (eigener WebGL-Kontext) — wird beim
  // Schließen/Neu-Rendern aufgerufen, damit kein Renderer im Hintergrund läuft.
  _disposeAvatar() {
    if (this._avatarVorschau) { this._avatarVorschau.dispose(); this._avatarVorschau = null; }
  }
  // Periodische Auffrischung (Timer im Gewächshaus, HUD).
  // Wichtig: das Gewächshaus wird NICHT komplett neu gebaut, sonst würde ein
  // gerade geöffnetes Auswahl-Dropdown jede Sekunde wieder geschlossen.
  aktualisierePeriodisch() {
    this.aktualisiereHUD();
    if (this.aktivesPanel === 'gewaechshaus') this._tickGewaechshaus(Date.now());
  }

  _rendern() {
    if (!this.aktivesPanel) return;
    this._disposeAvatar(); // alte Charakter-Vorschau freigeben (falls offen)
    this.panel.innerHTML = '';
    const kopf = el('div', { class: 'panel-kopf' },
      el('h2', {}, this._titel(this.aktivesPanel)),
      el('button', { class: 'schliessen', onclick: () => this.schliesse() }, '✕'),
    );
    const koerper = el('div', { class: 'panel-koerper' });
    this.panel.append(kopf, koerper);
    ({
      aufgaben: () => this._renderAufgaben(koerper),
      markt: () => this._renderMarkt(koerper),
      zauberbuch: () => this._renderZauberbuch(koerper),
      upgrades: () => this._renderUpgrades(koerper),
      gewaechshaus: () => this._renderGewaechshaus(koerper),
      skills: () => this._renderSkillbaum(koerper),
      erfolge: () => this._renderErfolge(koerper),
      charakter: () => this._renderCharakter(koerper),
      codex: () => this._renderCodex(koerper),
      karten: () => this._renderKarten(koerper),
    })[this.aktivesPanel]?.();
  }

  _titel(id) {
    return { aufgaben: '📒 Aufgaben', markt: '🛒 Bauernmarkt', zauberbuch: '✨ Zauberbuch',
      upgrades: '⬆️ Funktions-Upgrades', gewaechshaus: '🪴 Gewächshaus', skills: '🌳 Skill-Baum',
      erfolge: '🏆 Erfolge', charakter: '🧙 Charakter', codex: '📖 Codex', karten: '🗺️ Karten & Biome' }[id] || id;
  }

  // Chip-Leiste zum direkten Fachwechsel (in der linken Spalte UND im Aufgaben-Panel).
  _fachUmschalter(s) {
    const leiste = el('div', { class: 'aufg-faecher' });
    for (const f of alleFaecher()) {
      if (!f.implementiert) continue;
      const aktiv = s.aktivesFach === f.id;
      leiste.append(el('button', {
        class: 'aufg-fach-chip' + (aktiv ? ' aktiv' : ''), title: f.name,
        onclick: () => this._fachWaehlen(f.id),
      }, `${f.icon} ${f.name}`));
    }
    return leiste;
  }

  // ----------------------------------------------------- Panel: Aufgaben
  _renderAufgaben(box) {
    const fach = this.spiel.getFach();
    const s = this.spiel.getState();

    // Fach-Umschaltleiste: auch hier direkt zwischen den Fächern wechseln.
    box.append(this._fachUmschalter(s));

    if (!fach.implementiert) {
      box.append(el('p', { class: 'hinweis' }, `${fach.name} ist noch nicht implementiert.`),
        el('p', {}, fach.konzept || ''));
      return;
    }

    // Kontext-Hinweis (Gewächshaus-Boost)
    if (this.aufgabenKontext.typ === 'gewaechshaus') {
      box.append(el('div', { class: 'kontext' }, `🪴 Lösung beschleunigt das Wachstum in Beet ${this.aufgabenKontext.slotIndex + 1}.`));
    }

    // Wissensstand-Dashboard (Lern-App-Übersicht)
    this._renderWissensstand(box, fach, s);

    // _themaId auf ein gültiges Thema des AKTIVEN Fachs zwingen (z. B. nach
    // einem Fachwechsel) — sonst werden Themen/Aufgaben inkonsistent.
    const themen = fach.themen();
    if (!themen.some((t) => t.id === this._themaId)) this._themaId = themen[0].id;

    // Themen-Auswahl
    const themenLeiste = el('div', { class: 'themen' });
    for (const t of themen) {
      const niveau = fach.niveauFuer(s, t.id);
      const aktiv = this._themaId === t.id;
      themenLeiste.append(el('button', {
        class: 'thema-btn' + (aktiv ? ' aktiv' : ''),
        onclick: () => { this._themaId = t.id; this.aktuelleAufgabe = null; this._neueAufgabe(); },
      }, `${t.name}`, el('small', {}, `Niveau ${niveau}`)));
    }
    box.append(themenLeiste);

    // Neue Aufgabe nur erzeugen, wenn keine vorliegt oder das Thema gewechselt hat.
    if (!this.aktuelleAufgabe || this.aktuelleAufgabe.themaId !== this._themaId) {
      this.aktuelleAufgabe = this._zieheAufgabe(fach, this._themaId, fach.niveauFuer(s, this._themaId));
    }
    const a = this.aktuelleAufgabe;

    const frageBox = el('div', { class: 'aufgabe' }, el('p', { class: 'frage' }, a.frage));
    const feedback = el('div', { class: 'feedback' });

    if (a.typ === 'mc') {
      const optBox = el('div', { class: 'optionen' });
      a.optionen.forEach((opt, i) => {
        optBox.append(el('button', { class: 'opt-btn', onclick: () => this._antwort(i, feedback, optBox) }, opt));
      });
      frageBox.append(optBox);
    } else {
      const input = el('input', { type: 'text', class: 'antwort-input', placeholder: 'Antwort (Zahl, z. B. 3,5 oder 1/2)' });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._antwort(input.value, feedback); });
      const ok = el('button', { class: 'wirk-btn', onclick: () => this._antwort(input.value, feedback) }, 'Prüfen');
      frageBox.append(el('div', { class: 'eingabe-zeile' }, input, ok));
    }

    const naechste = el('button', { class: 'sek-btn', onclick: () => this._neueAufgabe() }, '↻ Neue Aufgabe');
    box.append(frageBox, feedback, naechste);
  }

  // Wissensstand-Übersicht: globale Werte + umschaltbar zwischen Niveau je Thema
  // (aktuelles Fach) und einer Gesamtübersicht über ALLE Fächer.
  _renderWissensstand(box, fach, s) {
    const richtig = s.aufgabenRichtig || 0, gesamt = s.aufgabenGesamt || 0;
    const quote = gesamt ? Math.round((richtig / gesamt) * 100) : 0;

    const kachel = (icon, wert, label) => el('div', { class: 'ws-kachel' },
      el('span', { class: 'ws-icon' }, icon), el('b', {}, `${wert}`), el('small', {}, label));

    const kacheln = el('div', { class: 'ws-kacheln' },
      kachel('📘', Math.floor(s.wissen), 'Wissen'),
      kachel('⭐', `Lv ${s.level}`, `${s.xp}/${s.xpNaechstesLevel} XP`),
      kachel('🔥', s.serie || 0, `Serie (Rekord ${s.serieRekord || 0})`),
      kachel('✅', `${quote}%`, `${richtig}/${gesamt} richtig`),
    );

    const modus = this._wsModus || 'fach';
    const toggle = el('div', { class: 'ws-toggle' },
      el('button', { class: 'ws-toggle-btn' + (modus === 'fach' ? ' aktiv' : ''),
        onclick: () => { this._wsModus = 'fach'; this._rendern(); } }, `${fach.icon} ${fach.name}`),
      el('button', { class: 'ws-toggle-btn' + (modus === 'alle' ? ' aktiv' : ''),
        onclick: () => { this._wsModus = 'alle'; this._rendern(); } }, '🎓 Alle Fächer'),
    );

    const koerper = (modus === 'alle') ? this._wsAlleFaecher(s) : this._wsThemen(fach, s);

    box.append(el('div', { class: 'wissensstand' },
      el('div', { class: 'ws-titel' }, '🎓 Wissensstand'),
      kacheln, toggle, koerper));
  }

  // Niveau-Balken (1–10) je Thema des AKTIVEN Fachs.
  _wsThemen(fach, s) {
    const wrap = el('div', { class: 'ws-themen' });
    for (const t of fach.themen()) {
      const m = Math.max(1, Math.min(10, s.meisterung?.[t.id] ?? fach.startNiveau ?? 1));
      const pct = Math.round(((m - 1) / 9) * 100);
      wrap.append(el('div', { class: 'ws-thema' },
        el('div', { class: 'ws-thema-kopf' }, el('span', {}, t.name), el('span', { class: 'ws-niveau' }, `Niveau ${Math.round(m)}/10`)),
        el('div', { class: 'ws-balken' }, el('div', { class: 'ws-fuellung', style: `width:${pct}%` }))));
    }
    return wrap;
  }

  // Gesamtübersicht: Ø-Niveau je implementiertem Fach (Zeile klickbar → Fachwechsel).
  _wsAlleFaecher(s) {
    const wrap = el('div', { class: 'ws-themen' });
    for (const f of alleFaecher()) {
      if (!f.implementiert) continue;
      const themen = f.themen();
      const summe = themen.reduce((acc, t) => acc + Math.max(1, Math.min(10, s.meisterung?.[t.id] ?? f.startNiveau ?? 1)), 0);
      const avg = themen.length ? summe / themen.length : 1;
      const pct = Math.round(((avg - 1) / 9) * 100);
      const aktiv = s.aktivesFach === f.id;
      wrap.append(el('div', { class: 'ws-thema ws-fach-zeile' + (aktiv ? ' aktiv' : ''), title: `Zu ${f.name} wechseln`,
        onclick: () => this._fachWaehlen(f.id) },
        el('div', { class: 'ws-thema-kopf' },
          el('span', {}, `${f.icon} ${f.name}`),
          el('span', { class: 'ws-niveau' }, `Ø Niveau ${avg.toFixed(1)}/10`)),
        el('div', { class: 'ws-balken' }, el('div', { class: 'ws-fuellung', style: `width:${pct}%` }))));
    }
    return wrap;
  }

  // Zieht eine Aufgabe und vermeidet Wiederholungen robust: bevorzugt eine Frage,
  // die nicht unter den letzten 5 war; ist der Aufgabenpool dafür zu klein, wird
  // GARANTIERT zumindest nicht die unmittelbar vorige Frage wiederholt.
  _zieheAufgabe(fach, themaId, niveau) {
    if (!this._aufgabenVerlauf) this._aufgabenVerlauf = [];
    const fenster = this._aufgabenVerlauf;
    const letzte = fenster[fenster.length - 1];
    let gewaehlt = null, fallback = null;
    for (let i = 0; i < 24; i++) {
      const kand = fach.erzeugeAufgabe(themaId, niveau);
      if (!fenster.includes(kand.frage)) { gewaehlt = kand; break; }   // ideal: ganz neu
      if (!fallback && kand.frage !== letzte) fallback = kand;          // zumindest ≠ letzte
      if (!fallback) fallback = kand;                                   // Notnagel
    }
    const neu = gewaehlt || fallback;
    fenster.push(neu.frage);
    while (fenster.length > 5) fenster.shift();
    return neu;
  }

  _neueAufgabe() {
    const fach = this.spiel.getFach();
    const s = this.spiel.getState();
    const themen = fach.themen();
    if (!themen.some((t) => t.id === this._themaId)) this._themaId = themen[0].id;
    this.aktuelleAufgabe = this._zieheAufgabe(fach, this._themaId, fach.niveauFuer(s, this._themaId));
    this._rendern();
  }

  _antwort(antwort, feedbackEl, optBox) {
    const ergebnis = this.spiel.antwortAbgeben(this.aktuelleAufgabe, antwort, this.aufgabenKontext);
    feedbackEl.className = 'feedback ' + (ergebnis.korrekt ? 'richtig' : 'falsch');
    feedbackEl.textContent = ergebnis.feedback;
    if (optBox) [...optBox.children].forEach((b) => (b.disabled = true));
    if (ergebnis.korrekt) {
      this.aktualisiereHUD();
      // kurz die Lösung zeigen, dann automatisch nächste Aufgabe
      setTimeout(() => { if (this.aktivesPanel === 'aufgaben') this._neueAufgabe(); }, 1600);
    }
  }

  // Öffnet die Aufgaben im Gewächshaus-Boost-Kontext.
  oeffneAufgabenFuerBoost(slotIndex) {
    this.aufgabenKontext = { typ: 'gewaechshaus', slotIndex };
    this.aktuelleAufgabe = null;
    this.oeffne('aufgaben');
  }

  // ----------------------------------------------------- Panel: Markt
  _renderMarkt(box) {
    const s = this.spiel.getState();
    const eintraege = Object.entries(s.inventar).filter(([, n]) => n > 0);
    if (!eintraege.length) {
      box.append(el('p', { class: 'hinweis' }, 'Dein Inventar ist leer. Ernte Pflanzen mit Zaubern!'));
      return;
    }
    let summe = 0;
    const liste = el('div', { class: 'liste' });
    for (const [id, n] of eintraege) {
      const p = PFLANZEN[id]; const wert = (p?.wert || 0) * n; summe += wert;
      liste.append(el('div', { class: 'listen-zeile' },
        el('span', {}, `${p?.emoji || '🌱'} ${p?.name || id}`),
        el('span', {}, `×${n}`),
        el('span', { class: 'preis' }, `${wert} 💰`)));
    }
    box.append(liste,
      el('div', { class: 'gesamt' }, `Gesamt: ${summe} 💰`),
      el('button', { class: 'wirk-btn', onclick: () => { const e = this.spiel.verkaufen(); this.toast(`Verkauft für ${e} 💰`); this._rendern(); this.aktualisiereHUD(); } }, '🛒 Alles verkaufen'));
  }

  // ----------------------------------------------------- Panel: Zauberbuch
  _renderZauberbuch(box) {
    const fach = this.spiel.getFach();
    const s = this.spiel.getState();
    box.append(el('p', { class: 'hinweis' }, 'Schalte Zauber mit 📘 Wissen frei und wähle deinen aktiven Erntezauber. Stärkere Zauber verlangen mehr Thema-Niveau und sind teurer.'));
    const liste = el('div', { class: 'liste' });
    for (const z of fach.alleZauber()) {
      const frei = s.freigeschalteteZauber.includes(z.id);
      const aktiv = s.aktiverZauber === z.id;
      const zeile = el('div', { class: 'zauber-zeile' + (aktiv ? ' aktiv' : '') });
      zeile.append(el('div', { class: 'zauber-info' },
        el('b', {}, `${z.icon} ${z.name}`),
        el('small', {}, z.beschreibung)));
      if (frei) {
        zeile.append(el('button', { class: aktiv ? 'sek-btn' : 'wirk-btn', disabled: aktiv ? '' : null,
          onclick: () => { this.spiel.zauberWaehlen(z.id); this.aktualisiereHUD(); this._rendern(); } }, aktiv ? 'aktiv' : 'wählen'));
      } else {
        const reqNiveau = z.freischalt?.niveau ?? 1;
        const niveau = (typeof fach.niveauFuer === 'function') ? fach.niveauFuer(s, z.themaId) : Math.round(s.meisterung?.[z.themaId] ?? 1);
        const kann = s.wissen >= z.freischalt.wissen && niveau >= reqNiveau;
        const label = `🔒 ${z.freischalt.wissen} 📘` + (reqNiveau > 1 ? ` · ab Niv. ${reqNiveau}` : '');
        zeile.append(el('button', { class: 'wirk-btn', disabled: kann ? null : '',
          onclick: () => { const r = this.spiel.zauberFreischalten(z.id); if (r.ok) this.toast(`${z.name} freigeschaltet!`); else this.toast(r.grund); this.aktualisiereHUD(); this._rendern(); } },
          label));
      }
      liste.append(zeile);
    }
    box.append(liste);
  }

  // ----------------------------------------------------- Panel: Upgrades
  _renderUpgrades(box) {
    const fach = this.spiel.getFach();
    const s = this.spiel.getState();
    const frei = fach.alleZauber().filter((z) => s.freigeschalteteZauber.includes(z.id));

    // --- Fach-übergreifend: Acker um eine ganze Umrandung vergrößern --------
    const acker = this.spiel.ackerInfo();
    box.append(el('h3', {}, '🌍 Acker (fach-übergreifend)'));
    box.append(el('p', { class: 'hinweis' }, 'Vergrößert den Acker um eine ganze Umrandung — wichtig, wenn Zauber über den Rand hinausreichen.'));
    box.append(el('div', { class: 'liste' },
      el('div', { class: 'listen-zeile' },
        el('span', {}, `Acker-Radius: ${acker.radius}  (${2 * acker.radius + 1}×${2 * acker.radius + 1})`),
        el('span', {}, acker.max ? 'maximal' : '+1 Umrandung'),
        el('button', { class: 'wirk-btn', disabled: (acker.max || !acker.kannKaufen) ? '' : null,
          onclick: () => { const r = this.spiel.ackerVergroessern(); if (r.ok) this.toast(`Acker vergrößert auf Radius ${r.radius}!`); else this.toast(r.grund); this.aktualisiereHUD(); this._rendern(); } },
          acker.max ? 'max' : `${acker.kosten} 💰`))));

    box.append(el('h3', {}, '✨ Zauber-Upgrades'));
    box.append(el('p', { class: 'hinweis' }, 'Werte deine Zauber mit 💰 Geld auf — größere Reichweite, Fläche oder Parameter. Stärkere (höherstufige) Zauber sind teurer aufzuwerten.'));
    if (!frei.length) box.append(el('p', { class: 'hinweis' }, 'Noch keine Zauber freigeschaltet.'));
    for (const z of frei) {
      box.append(el('h3', {}, `${z.icon} ${z.name}`));
      const stufen = s.zauberStufen[z.id] || {};
      const liste = el('div', { class: 'liste' });
      for (const up of z.upgrades) {
        const stufe = stufen[up.schluessel] || 0;
        const max = stufe >= up.max;
        const kosten = fach.upgradeKosten(z, up.schluessel, stufe);
        const kann = !max && s.geld >= kosten;
        liste.append(el('div', { class: 'listen-zeile' },
          el('span', {}, `${up.name}`),
          el('span', {}, `Stufe ${stufe}/${up.max}`),
          el('button', { class: 'wirk-btn', disabled: kann ? null : '',
            onclick: () => { const r = this.spiel.upgradeKaufen(z.id, up.schluessel); if (r.ok) this.toast('Upgrade gekauft!'); else this.toast(r.grund); this.aktualisiereHUD(); this._rendern(); } },
            max ? 'max' : `${kosten} 💰`)));
      }
      box.append(liste);
    }

    // --- Konto & Entwicklung -----------------------------------------------
    const nutzer = this.spiel.getNutzer?.();
    box.append(el('h3', {}, '👤 Konto'));
    box.append(el('div', { class: 'liste' },
      el('div', { class: 'listen-zeile' },
        el('span', {}, `Angemeldet als: ${nutzer?.username || '—'}${nutzer?.email ? ' (' + nutzer.email + ')' : ''}`),
        el('button', { class: 'sek-btn', onclick: () => this.spiel.abmelden() }, '🚪 Abmelden'))));

    box.append(el('h3', {}, '🧪 Entwicklung'));
    box.append(el('div', { class: 'liste' },
      el('div', { class: 'listen-zeile' },
        el('span', {}, 'Spielstand komplett zurücksetzen (zum Testen)'),
        el('button', { class: 'sek-btn',
          onclick: () => { if (window.confirm('Wirklich den gesamten Spielstand zurücksetzen? Das kann nicht rückgängig gemacht werden.')) this.spiel.resetSpielstand(); } },
          '♻️ Zurücksetzen'))));
  }

  // ----------------------------------------------------- Panel: Gewächshaus
  _renderGewaechshaus(box) {
    const s = this.spiel.getState();
    const now = Date.now();
    this._ghTick = []; // Handles für die sekündliche Timer-Aktualisierung

    // Lager an gedroppten Spezialpflanzen
    if (s.spezialLager.length) {
      const lager = el('div', { class: 'lager' }, el('b', {}, 'Bereit zum Einpflanzen: '));
      const zaehl = {};
      s.spezialLager.forEach((id) => (zaehl[id] = (zaehl[id] || 0) + 1));
      for (const [id, n] of Object.entries(zaehl)) {
        const d = SPEZIALPFLANZEN[id];
        lager.append(el('span', { class: 'lager-chip' }, `${d?.emoji || '🌟'} ${d?.name || id} ×${n}`));
      }
      box.append(lager);
    } else {
      box.append(el('p', { class: 'hinweis' }, 'Noch keine Spezialpflanzen im Lager. Alle 100 Ernten erscheint eine!'));
    }

    const beete = el('div', { class: 'beete' });
    s.gewaechshaus.slots.forEach((slot, i) => {
      const beet = el('div', { class: 'beet' });
      beet.append(el('div', { class: 'beet-nr' }, `Beet ${i + 1}`));
      if (!slot) {
        // Auswahl zum Einpflanzen, wenn Lager etwas hat
        if (s.spezialLager.length) {
          const sel = el('select', { class: 'spezial-select' });
          const eindeutig = [...new Set(s.spezialLager)];
          eindeutig.forEach((id) => sel.append(el('option', { value: id }, SPEZIALPFLANZEN[id]?.name || id)));
          beet.append(sel, el('button', { class: 'wirk-btn', onclick: () => { this.spiel.spezialEinpflanzen(i, sel.value); this._rendern(); } }, '🌱 Einpflanzen'));
        } else {
          beet.append(el('div', { class: 'beet-leer' }, 'leer'));
        }
      } else {
        const d = SPEZIALPFLANZEN[slot.spezialId];
        const f = ghFortschritt(slot, now);
        const reif = istReif(slot, now);
        const rest = slot.gesamtMs - verstrichen(slot, now);
        beet.append(el('div', { class: 'beet-pflanze' }, `${d?.emoji || '🌟'} ${d?.name || slot.spezialId}`));
        const fuellung = el('div', { class: 'fuellung', style: `width:${Math.round(f * 100)}%` });
        const restEl = el('div', { class: 'rest' }, reif ? '✅ erntereif!' : `⏳ ${formatDauer(rest)}`);
        beet.append(el('div', { class: 'fortschritt' }, fuellung), restEl);
        if (reif) {
          beet.append(el('button', { class: 'wirk-btn', onclick: () => { const b = this.spiel.spezialErnten(i); if (b) this.toast(`Geerntet: +${b.belohnung.geld} 💰 +${b.belohnung.wissen} 📘 +${b.belohnung.essenz} 🔮`); this._rendern(); this.aktualisiereHUD(); } }, '🌾 Ernten'));
        } else {
          beet.append(el('button', { class: 'sek-btn', onclick: () => this.oeffneAufgabenFuerBoost(i) }, '📒 Aufgabe → Boost'));
        }
        // Für die sekündliche Aktualisierung merken (ohne DOM-Neuaufbau).
        this._ghTick.push({ slotIndex: i, fuellung, restEl, warReif: reif });
      }
      beete.append(beet);
    });
    box.append(beete);
  }

  // Aktualisiert NUR die Fortschrittsbalken/Restzeiten der Beete in-place — so
  // bleibt ein offenes Auswahl-Dropdown erhalten. Wird ein Beet neu reif, wird
  // einmalig komplett neu gerendert (damit der Ernten-Knopf erscheint).
  _tickGewaechshaus(now) {
    const s = this.spiel.getState();
    if (!this._ghTick) return;
    for (const t of this._ghTick) {
      const slot = s.gewaechshaus.slots[t.slotIndex];
      if (!slot) continue;
      const f = ghFortschritt(slot, now);
      const reif = istReif(slot, now);
      const rest = slot.gesamtMs - verstrichen(slot, now);
      if (t.fuellung) t.fuellung.style.width = `${Math.round(f * 100)}%`;
      if (t.restEl) t.restEl.textContent = reif ? '✅ erntereif!' : `⏳ ${formatDauer(rest)}`;
      if (reif && !t.warReif) { t.warReif = true; this._rendern(); return; }
    }
  }

  // ----------------------------------------------------- Panel: Skill-Baum
  _renderSkillbaum(box) {
    const s = this.spiel.getState();
    const skills = s.skills || {};
    box.append(el('p', { class: 'hinweis' }, '🔮 Essenz verdienst du, indem du Spezialpflanzen im Gewächshaus großziehst und erntest. Gib sie hier für dauerhafte Verbesserungen aus.'));
    box.append(el('div', { class: 'essenz-anzeige' }, `Verfügbare Essenz: ${Math.floor(s.essenz || 0)} 🔮`));

    // Nach Tier gruppiert darstellen (ergibt die "Baum"-Spalten).
    const tiers = [...new Set(SKILL_LISTE.map((sk) => sk.tier))].sort((a, b) => a - b);
    for (const tier of tiers) {
      box.append(el('h3', {}, `Stufe ${tier}`));
      const reihe = el('div', { class: 'skill-reihe' });
      for (const sk of SKILL_LISTE.filter((x) => x.tier === tier)) {
        const stufe = skills[sk.id] || 0;
        const max = stufe >= sk.maxStufe;
        const vorErfuellt = !sk.voraussetzung || (skills[sk.voraussetzung] > 0);
        const kosten = max ? 0 : sk.kosten(stufe);
        const kann = !max && vorErfuellt && (s.essenz || 0) >= kosten;

        const karte = el('div', { class: 'skill-karte' + (stufe > 0 ? ' aktiv' : '') + (vorErfuellt ? '' : ' gesperrt') });
        karte.append(
          el('div', { class: 'skill-kopf' }, el('span', { class: 'skill-icon' }, sk.icon), el('b', {}, sk.name),
            el('span', { class: 'skill-stufe' }, sk.maxStufe > 1 ? `${stufe}/${sk.maxStufe}` : (stufe ? '✓' : ''))),
          el('small', {}, sk.beschreibung),
        );
        if (!vorErfuellt) {
          karte.append(el('span', { class: 'badge gesperrt' }, `🔒 braucht „${SKILLS[sk.voraussetzung].name}"`));
        } else if (max) {
          karte.append(el('span', { class: 'badge' }, 'max'));
        } else {
          karte.append(el('button', { class: 'wirk-btn', disabled: kann ? null : '',
            onclick: () => { const r = this.spiel.skillKaufen(sk.id); if (r.ok) this.toast(`${sk.name} freigeschaltet!`); else this.toast(r.grund); this.aktualisiereHUD(); this._rendern(); } },
            `${kosten} 🔮`));
        }
        reihe.append(karte);
      }
      box.append(reihe);
    }
  }

  // ----------------------------------------------------- Panel: Erfolge
  _renderErfolge(box) {
    const s = this.spiel.getState();
    const frei = s.erfolge || [];
    const kat = { geld: '💰 Verkauf', wissen: '📘 Wissen', essenz: '🔮 Essenz', xp: '⭐ XP' };
    box.append(el('p', { class: 'hinweis' },
      `Freigeschaltet: ${frei.length} / ${ERFOLG_LISTE.length}. Jeder Erfolg gibt einen DAUERHAFTEN Prozent-Bonus — schwerere Erfolge mehr.`));
    const gitter = el('div', { class: 'codex-gitter' });
    for (const e of ERFOLG_LISTE) {
      const ok = frei.includes(e.id);
      const bonusText = e.bonus
        ? Object.entries(e.bonus).map(([k, v]) => `+${Math.round(v * 100)} % ${kat[k] || k}`).join('  ')
        : '';
      gitter.append(el('div', { class: 'codex-karte' + (ok ? '' : ' unbekannt') },
        el('div', { class: 'codex-emoji' }, ok ? e.icon : '🔒'),
        el('b', {}, e.name),
        el('small', {}, e.beschreibung),
        bonusText ? el('small', { class: 'preis' }, bonusText) : null));
    }
    box.append(gitter);
  }

  // ----------------------------------------------------- Panel: Charakter
  _renderCharakter(box) {
    const s = this.spiel.getState();
    const titel = this.spiel.titelInfo();
    const naechsterTxt = titel.naechster
      ? `Nächster Titel: „${titel.naechster.name}" ab Level ${titel.naechster.ab}`
      : 'Höchster Titel erreicht!';
    box.append(el('div', { class: 'char-titel' },
      el('div', { class: 'char-titel-name' }, `🧙 ${titel.aktuell}`),
      el('small', {}, `Level ${s.level} · ${naechsterTxt}`)));

    // 3D-Vorschau (eigener Mini-Renderer; erst nach dem Einhängen starten).
    const canvas = el('canvas', { class: 'avatar-canvas' });
    box.append(canvas);
    setTimeout(() => {
      if (this.aktivesPanel !== 'charakter') return;
      this._disposeAvatar();
      this._avatarVorschau = this.spiel.erstelleAvatarVorschau(canvas);
      this._avatarVorschau.setzeKosmetik(this.spiel.kosmetikVorschauCfg());
    }, 0);

    box.append(el('p', { class: 'hinweis' },
      `Schalte Gegenstände frei, indem du in ALLEN Bereichen eines Fachs Niveau ${KOSMETIK_NIVEAU} erreichst. Klick zum An-/Ablegen.`));
    const slotsBox = el('div', { class: 'kosmetik-slots' });
    box.append(slotsBox);
    this._fuelleKosmetikSlots(slotsBox);
  }

  // Baut die drei Kosmetik-Slot-Listen (Stab/Hut/Kutte) — ohne das Panel komplett
  // neu zu rendern (die 3D-Vorschau bleibt so erhalten).
  _fuelleKosmetikSlots(box) {
    box.innerHTML = '';
    const info = this.spiel.kosmetikInfo();
    for (const slot of ['stab', 'hut', 'kutte']) {
      const items = info.filter((x) => x.item.slot === slot);
      const gruppe = el('div', { class: 'kosmetik-gruppe' });
      gruppe.append(el('h3', {}, SLOT_NAMEN[slot] || slot));
      const gitter = el('div', { class: 'codex-gitter' });
      for (const { item, frei, angelegt } of items) {
        const karte = el('div', { class: 'codex-karte' + (frei ? '' : ' unbekannt') + (angelegt ? ' aktiv' : '') });
        karte.append(
          el('div', { class: 'codex-emoji' }, frei ? item.icon : '🔒'),
          el('b', {}, item.name),
          el('small', {}, frei ? `aus ${this._fachName(item.fachId)}` : `${this._fachName(item.fachId)}: Niveau ${item.niveau || KOSMETIK_NIVEAU} in allen Bereichen`));
        if (frei) {
          karte.append(el('button', { class: angelegt ? 'sek-btn' : 'wirk-btn',
            onclick: () => {
              this.spiel.kosmetikAnlegen(slot, angelegt ? null : item.id);
              if (this._avatarVorschau) this._avatarVorschau.setzeKosmetik(this.spiel.kosmetikVorschauCfg());
              this._fuelleKosmetikSlots(box);
            } }, angelegt ? 'ablegen' : 'anlegen'));
        }
        gitter.append(karte);
      }
      gruppe.append(gitter);
      box.append(gruppe);
    }
  }

  _fachName(id) {
    const f = alleFaecher().find((x) => x.id === id);
    return f ? `${f.icon} ${f.name}` : id;
  }

  // ----------------------------------------------------- Panel: Codex
  _renderCodex(box) {
    const s = this.spiel.getState();
    const entdeckt = s.entdecktePflanzen || [];

    // --- Normale Pflanzenarten (über alle Karten) ---
    box.append(el('h3', {}, '🌱 Pflanzenarten'));
    box.append(el('p', { class: 'hinweis' }, `Entdeckt: ${entdeckt.length} / ${PFLANZEN_LISTE.length} Arten — ernte eine Pflanze, um sie hier freizuschalten.`));
    const pGitter = el('div', { class: 'codex-gitter' });
    for (const p of PFLANZEN_LISTE) {
      const e = entdeckt.includes(p.id);
      pGitter.append(el('div', { class: 'codex-karte' + (e ? '' : ' unbekannt') },
        el('div', { class: 'codex-emoji' }, e ? p.emoji : '❔'),
        el('b', {}, e ? p.name : '???'),
        el('small', {}, e ? `Wert: ${p.wert} 💰` : 'noch nicht geerntet')));
    }
    box.append(pGitter);

    // --- Spezialpflanzen ---
    box.append(el('h3', {}, '🌟 Spezialpflanzen'));
    box.append(el('p', { class: 'hinweis' }, `Entdeckt: ${s.spezialSammlung.length} / ${SPEZIAL_LISTE.length} Spezialpflanzen.`));
    const gitter = el('div', { class: 'codex-gitter' });
    for (const d of SPEZIAL_LISTE) {
      const e = s.spezialSammlung.includes(d.id);
      gitter.append(el('div', { class: 'codex-karte' + (e ? '' : ' unbekannt') },
        el('div', { class: 'codex-emoji' }, e ? d.emoji : '❔'),
        el('b', {}, e ? d.name : '???'),
        el('small', {}, e ? d.text : 'noch nicht entdeckt')));
    }
    box.append(gitter);
  }

  // ----------------------------------------------------- Panel: Karten
  _renderKarten(box) {
    const s = this.spiel.getState();
    const frei = s.freigeschalteteBiome || ['bauernhof'];
    box.append(el('p', { class: 'hinweis' }, 'Karten sind fach-unabhängig — spiele sie mit jedem Fach. Spätere Karten kosten mehr 💰 zum Freischalten; ihre Pflanzen bringen dafür viel mehr Geld auf dem Markt.'));
    const gitter = el('div', { class: 'codex-gitter' });
    for (const b of Object.values(BIOME)) {
      const istFrei = frei.includes(b.id);
      const aktiv = s.aktivesBiome === b.id;
      const emojis = b.pflanzen.map((id) => PFLANZEN[id]?.emoji || '🌱').join(' ');
      const werte = b.pflanzen.map((id) => PFLANZEN[id]?.wert || 0);
      const karte = el('div', { class: 'codex-karte' + (aktiv ? ' aktiv' : '') },
        el('div', { class: 'codex-emoji' }, b.icon),
        el('b', {}, b.name),
        el('small', {}, emojis),
        el('small', {}, `Marktwert: ${Math.min(...werte)}–${Math.max(...werte)} 💰`));
      if (aktiv) {
        karte.append(el('span', { class: 'badge' }, 'aktiv'));
      } else if (istFrei) {
        karte.append(el('button', { class: 'wirk-btn', onclick: () => { const r = this.spiel.biomeWechseln(b.id); if (r.ok) this.toast(`Karte: ${b.name}`); else this.toast(r.grund); this._rendern(); this.aktualisiereHUD(); } }, 'betreten'));
      } else {
        const kann = s.geld >= (b.kosten || 0);
        karte.append(el('button', { class: 'wirk-btn', disabled: kann ? null : '',
          onclick: () => { const r = this.spiel.biomeWechseln(b.id); if (r.ok) this.toast(`${b.name} freigeschaltet!`); else this.toast(r.grund); this._rendern(); this.aktualisiereHUD(); } },
          `🔒 ${b.kosten} 💰`));
      }
      gitter.append(karte);
    }
    box.append(gitter);
  }

  // ------------------------------------------------- Pop-up-Quiz (alle 5 Min.)
  // Zeigt eine 30-Sekunden-Frage aus dem aktuellen Fach. Richtig beantwortet →
  // 5 s Gratis-Zaubern (Logik im Controller). Falsch/Timeout → nichts passiert.
  starteQuiz() {
    if (this._quizOffen) return;
    const aufgabe = (typeof this.spiel.erzeugeQuizAufgabe === 'function') && this.spiel.erzeugeQuizAufgabe();
    if (!aufgabe) return;
    this._quizOffen = true;
    const fach = this.spiel.getFach();
    const DAUER = 30;

    const zeitEl = el('span', { class: 'quiz-zeit' }, `${DAUER}s`);
    const balken = el('div', { class: 'quiz-balken-fuellung' });
    const frageBox = el('div', { class: 'aufgabe' }, el('p', { class: 'frage' }, aufgabe.frage));

    const overlay = el('div', { class: 'quiz-overlay' });
    let beendet = false, intervall = null;
    const schliesse = () => { if (intervall) clearInterval(intervall); overlay.remove(); this._quizOffen = false; };
    const beantworte = (antwort) => {
      if (beendet) return; beendet = true;
      if (intervall) clearInterval(intervall);
      const erg = this.spiel.quizAntwort(aufgabe, antwort);
      if (erg.korrekt) { this.toast('✨ Richtig! 5 Sekunden lang gratis zaubern!'); this.aktualisiereHUD(); }
      else this.toast('Leider falsch — nichts passiert.');
      setTimeout(schliesse, 300);
    };

    if (aufgabe.typ === 'mc') {
      const optBox = el('div', { class: 'optionen' });
      aufgabe.optionen.forEach((opt, i) => optBox.append(el('button', { class: 'opt-btn', onclick: () => beantworte(i) }, opt)));
      frageBox.append(optBox);
    } else {
      const input = el('input', { type: 'text', class: 'antwort-input', placeholder: 'Antwort (Zahl, z. B. 3,5)' });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') beantworte(input.value); });
      frageBox.append(el('div', { class: 'eingabe-zeile' }, input, el('button', { class: 'wirk-btn', onclick: () => beantworte(input.value) }, 'Prüfen')));
      setTimeout(() => input.focus(), 50);
    }

    overlay.append(el('div', { class: 'quiz-karte' },
      el('div', { class: 'quiz-kopf' }, el('h2', {}, '⏱️ Blitz-Frage'), zeitEl),
      el('p', { class: 'hinweis' }, `${fach.icon} ${fach.name} — richtig beantworten ⇒ 5 Sekunden gratis zaubern!`),
      frageBox,
      el('div', { class: 'quiz-balken' }, balken)));
    document.body.append(overlay);

    let rest = DAUER;
    intervall = setInterval(() => {
      rest -= 1;
      zeitEl.textContent = `${Math.max(0, rest)}s`;
      balken.style.width = `${Math.max(0, (rest / DAUER) * 100)}%`;
      if (rest <= 0) {
        if (!beendet) { beendet = true; this.toast('⏱️ Zeit abgelaufen — nichts passiert.'); }
        schliesse();
      }
    }, 1000);
  }

  // -------------------------------------------------------------- Toast
  toast(text) {
    const t = el('div', { class: 'toast' }, text);
    this.toastBereich.append(t);
    setTimeout(() => t.classList.add('weg'), 50);
    setTimeout(() => t.remove(), 2600);
  }
}
