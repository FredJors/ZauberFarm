// =============================================================================
// auth.js — Anmeldung/Registrierung über eine austauschbare Schnittstelle
// -----------------------------------------------------------------------------
// WICHTIG: Dies ist ein LOKALER PLATZHALTER (Frontend-only), KEINE echte
// Authentifizierung. Passwörter werden nur als gesalzener SHA-256-Hash im
// localStorage abgelegt — das schützt NICHT vor echten Angreifern. Sobald ein
// Backend/eine Datenbank existiert, ersetzt man allein den ADAPTER (siehe
// setzeAdapter) durch echte serverseitige Auth (Hashing am Server via
// bcrypt/argon2, HTTPS, Sessions/JWT). Der Rest des Spiels bleibt unverändert.
//
// Adapter-Schnittstelle (austauschbar gegen REST/Supabase/Firebase/…):
//   registriere({ username, email, passwort }) → { ok, nutzer? , fehler? }
//   anmelden({ email, passwort })             → { ok, nutzer? , fehler? }
// nutzer (öffentlich): { id, username, email }
// =============================================================================

const NUTZER_KEY = 'zauberacker.nutzer';     // lokale "Konten"-Tabelle
const SITZUNG_KEY = 'zauberacker.sitzung';   // aktuell angemeldeter Nutzer

// --- Hilfen (Web Crypto; nur im sicheren Kontext: https / localhost) ---------
function zufallsHex(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function hashPasswort(passwort, salt) {
  const data = new TextEncoder().encode(`${salt}:${passwort}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const oeffentlich = (n) => ({ id: n.id, username: n.username, email: n.email });
const ladeKonten = () => { try { return JSON.parse(localStorage.getItem(NUTZER_KEY)) || {}; } catch { return {}; } };
const speichereKonten = (m) => localStorage.setItem(NUTZER_KEY, JSON.stringify(m));

// --- Lokaler Standard-Adapter (später ersetzbar) -----------------------------
const lokalerAdapter = {
  async registriere({ username, email, passwort }) {
    const konten = ladeKonten();
    const key = email.trim().toLowerCase();
    if (konten[key]) return { ok: false, fehler: 'Diese E-Mail ist bereits registriert.' };
    const salt = zufallsHex();
    const hash = await hashPasswort(passwort, salt);
    const nutzer = {
      id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      username: username.trim(), email: key, salt, hash,
    };
    konten[key] = nutzer;
    speichereKonten(konten);
    return { ok: true, nutzer: oeffentlich(nutzer) };
  },
  async anmelden({ email, passwort }) {
    const nutzer = ladeKonten()[email.trim().toLowerCase()];
    if (!nutzer) return { ok: false, fehler: 'Kein Konto mit dieser E-Mail gefunden.' };
    const hash = await hashPasswort(passwort, nutzer.salt);
    if (hash !== nutzer.hash) return { ok: false, fehler: 'Falsches Passwort.' };
    return { ok: true, nutzer: oeffentlich(nutzer) };
  },
};

let adapter = lokalerAdapter;

export const auth = {
  // Backend später hier einhängen: auth.setzeAdapter(meinDatenbankAdapter)
  setzeAdapter(neu) { adapter = neu; },

  // Aktuell angemeldeter Nutzer (oder null) — überlebt Neuladen (lokaler Spiegel).
  aktuelleSitzung() { try { return JSON.parse(localStorage.getItem(SITZUNG_KEY)) || null; } catch { return null; } },

  // Sitzung beim Start prüfen. Mit Backend-Adapter (z. B. Supabase) wird die
  // echte Server-Sitzung verifiziert; ohne Adapter ist es der lokale Spiegel.
  async sitzung() {
    if (adapter.sitzung) {
      try {
        const n = await adapter.sitzung();
        if (n) localStorage.setItem(SITZUNG_KEY, JSON.stringify(n));
        else localStorage.removeItem(SITZUNG_KEY);
        return n;
      } catch (e) {
        console.warn('Sitzung prüfen fehlgeschlagen:', e);
        return this.aktuelleSitzung();
      }
    }
    return this.aktuelleSitzung();
  },

  async registriere(daten) {
    const r = await adapter.registriere(daten);
    if (r.ok) localStorage.setItem(SITZUNG_KEY, JSON.stringify(r.nutzer));
    return r;
  },
  async anmelden(daten) {
    const r = await adapter.anmelden(daten);
    if (r.ok) localStorage.setItem(SITZUNG_KEY, JSON.stringify(r.nutzer));
    return r;
  },
  async abmelden() {
    localStorage.removeItem(SITZUNG_KEY);
    if (adapter.abmelden) { try { await adapter.abmelden(); } catch (e) { console.warn('Abmelden (Backend):', e); } }
  },

  // Schnellstart ohne Konto (eigener, lokaler Spielstand unter id "gast").
  async gast() {
    const nutzer = { id: 'gast', username: 'Gast', email: '' };
    localStorage.setItem(SITZUNG_KEY, JSON.stringify(nutzer));
    return { ok: true, nutzer };
  },
};
