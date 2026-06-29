// =============================================================================
// startbildschirm.js — Anmelde-/Registrierungs-Fenster beim Spielstart
// -----------------------------------------------------------------------------
// Zeigt beim Öffnen ein Vollbild-Fenster, das nach Benutzername, E-Mail und
// Passwort fragt (Tabs: Anmelden / Registrieren). Spricht nur mit der
// auth-Schnittstelle (core/auth.js) und liefert per Promise den angemeldeten
// Nutzer zurück. Erst danach startet das eigentliche Spiel (main.js).
// =============================================================================

// Mini-DOM-Helfer (lokal, damit der Startbildschirm unabhängig von ui.js ist).
function el(tag, props = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (v != null) e.setAttribute(k, v);
  }
  for (const kind of kinder.flat()) if (kind != null) e.append(kind.nodeType ? kind : document.createTextNode(kind));
  return e;
}

import { CLOUD_AKTIV } from '../core/cloud.js';

const istEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

const HINWEIS = CLOUD_AKTIV
  ? '🔒 Dein Hof wird sicher online gespeichert (Supabase) und ist auf jedem Gerät verfügbar.'
  : '🔒 Lokaler Demo-Login: Daten bleiben auf diesem Gerät. Passwörter werden nur als Hash gespeichert. Echte Online-Konten folgen mit der Datenbank.';

// Zeigt den Startbildschirm und löst das Promise auf, sobald der Nutzer
// angemeldet oder registriert ist (oder als Gast fortfährt).
export function zeigeStartbildschirm(auth) {
  return new Promise((resolve) => {
    let modus = 'registrieren'; // 'anmelden' | 'registrieren'

    const overlay = el('div', { id: 'start-overlay' });
    const karte = el('div', { class: 'start-karte' });
    overlay.append(karte);
    document.body.append(overlay);

    function fertig(nutzer) { overlay.remove(); resolve(nutzer); }

    function rendern() {
      karte.innerHTML = '';
      const fehler = el('div', { class: 'start-fehler' });

      // Eingabefelder je nach Modus
      const felder = {};
      const feld = (key, props) => (felder[key] = el('input', { class: 'start-input', ...props }));

      const formInhalt = [];
      if (modus === 'registrieren') {
        formInhalt.push(
          feld('username', { type: 'text', placeholder: 'Benutzername', autocomplete: 'username' }),
          feld('email', { type: 'email', placeholder: 'E-Mail-Adresse', autocomplete: 'email' }),
          feld('passwort', { type: 'password', placeholder: 'Passwort (mind. 6 Zeichen)', autocomplete: 'new-password' }),
          feld('passwort2', { type: 'password', placeholder: 'Passwort wiederholen', autocomplete: 'new-password' }),
        );
      } else {
        formInhalt.push(
          feld('email', { type: 'email', placeholder: 'E-Mail-Adresse', autocomplete: 'email' }),
          feld('passwort', { type: 'password', placeholder: 'Passwort', autocomplete: 'current-password' }),
        );
      }

      async function absenden() {
        fehler.textContent = '';
        const username = felder.username?.value.trim() || '';
        const email = (felder.email?.value || '').trim();
        const passwort = felder.passwort?.value || '';

        // Validierung
        if (modus === 'registrieren' && username.length < 2) return (fehler.textContent = 'Bitte einen Benutzernamen (mind. 2 Zeichen) eingeben.');
        if (!istEmail(email)) return (fehler.textContent = 'Bitte eine gültige E-Mail-Adresse eingeben.');
        if (passwort.length < 6) return (fehler.textContent = 'Das Passwort muss mindestens 6 Zeichen haben.');
        if (modus === 'registrieren' && passwort !== felder.passwort2.value) return (fehler.textContent = 'Die Passwörter stimmen nicht überein.');

        sendenBtn.disabled = true;
        try {
          const r = modus === 'registrieren'
            ? await auth.registriere({ username, email, passwort })
            : await auth.anmelden({ email, passwort });
          if (r.ok) fertig(r.nutzer);
          else { fehler.textContent = r.fehler || 'Anmeldung fehlgeschlagen.'; sendenBtn.disabled = false; }
        } catch (e) {
          fehler.textContent = 'Unerwarteter Fehler. Bitte erneut versuchen.';
          sendenBtn.disabled = false;
        }
      }

      const form = el('form', { class: 'start-form', onsubmit: (e) => { e.preventDefault(); absenden(); } }, ...formInhalt);
      const sendenBtn = el('button', { type: 'submit', class: 'start-go' }, modus === 'registrieren' ? 'Konto erstellen' : 'Anmelden');
      form.append(sendenBtn);

      const tabs = el('div', { class: 'start-tabs' },
        el('button', { class: 'start-tab' + (modus === 'anmelden' ? ' aktiv' : ''), onclick: () => { modus = 'anmelden'; rendern(); } }, 'Anmelden'),
        el('button', { class: 'start-tab' + (modus === 'registrieren' ? ' aktiv' : ''), onclick: () => { modus = 'registrieren'; rendern(); } }, 'Registrieren'),
      );

      karte.append(
        el('div', { class: 'start-logo' }, '🌾'),
        el('h1', { class: 'start-titel' }, 'ZauberAcker'),
        el('p', { class: 'start-sub' }, 'Melde dich an, damit dein Hof gespeichert wird.'),
        tabs,
        form,
        fehler,
        el('button', { class: 'start-gast', onclick: async () => { const r = await auth.gast(); fertig(r.nutzer); } }, 'Ohne Konto fortfahren (Gast)'),
        el('p', { class: 'start-hinweis' }, HINWEIS),
      );

      (felder.username || felder.email)?.focus();
    }

    rendern();
  });
}
