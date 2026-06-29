// =============================================================================
// cloud.js — Online-Datenbank-Anbindung (Supabase): Auth + Spielstand-Sync
// -----------------------------------------------------------------------------
// Dieses Modul ist der EINZIGE Berührungspunkt zwischen Spiel und Supabase. Es
// ist additiv und greift NUR, wenn in cloud-config.js echte Schlüssel stehen:
//
//   • Auth:        ersetzt den lokalen Login-Adapter (echte Konten, serverseitiges
//                  Passwort-Hashing, JWT-Sessions) über auth.setzeAdapter(...).
//   • Persistenz:  spiegelt den Spielstand offline-first in die Cloud. localStorage
//                  bleibt schneller lokaler Cache; im Hintergrund (entprellt) wird
//                  in die DB-Tabelle "spielstand" geschrieben. Beim Start gewinnt
//                  der neuere Stand (Last-Write-Wins über letzterZeitstempel).
//
// Ist die Cloud NICHT konfiguriert, bleibt alles wie zuvor (localStorage) und
// supabase-js wird nicht einmal geladen (dynamischer Import erst bei Bedarf).
// =============================================================================

import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, cloudKonfiguriert } from './cloud-config.js';
import { auth } from './auth.js';
import { setzeSpeicherHook, speicherKeyFuer } from './spielzustand.js';

export const CLOUD_AKTIV = cloudKonfiguriert();

const SYNC_VERZOEGERUNG_MS = 4000; // Schreibrate drosseln (statt bei jeder Aktion)
const TABELLE = 'spielstand';
const BESTEN_TABELLE = 'bestenliste';

// --- Supabase-Client (faul geladen, damit ohne Cloud nichts gefetcht wird) ---
let supabasePromise = null;
async function client() {
  if (!supabasePromise) {
    supabasePromise = import('@supabase/supabase-js').then((mod) =>
      mod.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      }),
    );
  }
  return supabasePromise;
}

const oeffentlich = (u) => ({
  id: u.id,
  username: u.user_metadata?.username || (u.email ? u.email.split('@')[0] : 'Spieler'),
  email: u.email || '',
});

function uebersetzeFehler(error) {
  const m = (error?.message || '').toLowerCase();
  if (m.includes('already registered') || m.includes('already exists')) return 'Diese E-Mail ist bereits registriert.';
  if (m.includes('invalid login')) return 'E-Mail oder Passwort ist falsch.';
  if (m.includes('email not confirmed')) return 'Bitte zuerst die E-Mail bestätigen (Postfach prüfen).';
  if (m.includes('password')) return 'Das Passwort ist zu schwach (mind. 6 Zeichen).';
  return error?.message || 'Anmeldung fehlgeschlagen.';
}

// --- Auth-Adapter (austauschbar gegen core/auth.js: setzeAdapter) ------------
const supabaseAuthAdapter = {
  async registriere({ username, email, passwort }) {
    const sb = await client();
    const { data, error } = await sb.auth.signUp({
      email, password: passwort, options: { data: { username } },
    });
    if (error) return { ok: false, fehler: uebersetzeFehler(error) };
    if (!data.session) {
      // E-Mail-Bestätigung ist im Projekt aktiv → Konto angelegt, aber Login folgt
      // erst nach Bestätigung. (Empfehlung: Bestätigung im Dashboard deaktivieren.)
      return { ok: false, fehler: 'Konto erstellt — bitte E-Mail bestätigen und dann anmelden.' };
    }
    return { ok: true, nutzer: oeffentlich(data.user) };
  },

  async anmelden({ email, passwort }) {
    const sb = await client();
    const { data, error } = await sb.auth.signInWithPassword({ email, password: passwort });
    if (error) return { ok: false, fehler: uebersetzeFehler(error) };
    return { ok: true, nutzer: oeffentlich(data.user) };
  },

  // Bestehende Sitzung beim Start wiederherstellen (oder null).
  async sitzung() {
    const sb = await client();
    const { data } = await sb.auth.getSession();
    const u = data.session?.user;
    return u ? oeffentlich(u) : null;
  },

  async abmelden() {
    const sb = await client();
    await sb.auth.signOut();
  },
};

// --- Spielstand laden/speichern (DB-Tabelle "spielstand") --------------------
async function ladeCloudSpielstand(nutzerId) {
  const sb = await client();
  const { data, error } = await sb.from(TABELLE).select('daten').eq('nutzer_id', nutzerId).maybeSingle();
  if (error) { console.warn('Cloud-Laden fehlgeschlagen:', error.message); return null; }
  return data?.daten || null;
}

async function speichereCloudSpielstand(nutzerId, state) {
  const sb = await client();
  const { error } = await sb.from(TABELLE).upsert({
    nutzer_id: nutzerId,
    daten: state,
    version: state.version ?? 2,
    aktualisiert_am: new Date().toISOString(),
  });
  if (error) console.warn('Cloud-Speichern fehlgeschlagen:', error.message);
}

// --- Bestenliste (öffentlich lesbar, nur eigene Zeile schreibbar) ------------
// Punktzahl = Level (einfach, aussagekräftig). Eigene Tabelle statt Sicht, damit
// RLS das Lesen erlaubt, ohne die privaten Spielstände freizugeben.
function punkteAus(state) { return Math.max(0, Math.floor(state.level || 1)); }

let letztePunkte = null;
async function aktualisiereBestenliste(state) {
  const punkte = punkteAus(state);
  if (punkte === letztePunkte) return; // nur bei Änderung schreiben
  const sb = await client();
  const { error } = await sb.from(BESTEN_TABELLE).upsert({
    nutzer_id: state.nutzerId,
    name: state.nutzerName || 'Spieler',
    punkte,
    aktualisiert_am: new Date().toISOString(),
  });
  if (error) console.warn('Bestenliste-Update fehlgeschlagen:', error.message);
  else letztePunkte = punkte;
}

// Top-Einträge absteigend, paginiert. Holt NUR die angezeigten Spalten (kein
// select *) und nutzt den Index auf "punkte" über order(...).range(...).
export async function ladeBestenliste(limit = 20, offset = 0) {
  if (!CLOUD_AKTIV) return [];
  const sb = await client();
  const { data, error } = await sb.from(BESTEN_TABELLE)
    .select('name, punkte')
    .order('punkte', { ascending: false })
    .order('aktualisiert_am', { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) { console.warn('Bestenliste-Laden fehlgeschlagen:', error.message); return []; }
  return data || [];
}

// --- Entprelltes Hintergrund-Speichern (Hook aus spielzustand.js) ------------
let syncTimer = null;
let letzterState = null;
let letzteSyncSignatur = null; // Inhalt (ohne Zeitstempel) beim letzten Cloud-Schreiben

// Signatur des Spielstands OHNE letzterZeitstempel: nur ECHTE Inhaltsänderungen
// sollen einen Schreibvorgang auslösen. Sonst speichert ein untätiger Tab alle
// 10 s in die Cloud (letzterZeitstempel ändert sich ja immer) → unnötige Last.
function signatur(state) {
  try { const { letzterZeitstempel, ...rest } = state; return JSON.stringify(rest); } catch { return null; }
}

function planeCloudSync(state) {
  if (!state?.nutzerId || state.nutzerId === 'gast') return; // Gäste bleiben lokal
  const sig = signatur(state);
  if (sig !== null && sig === letzteSyncSignatur) return;    // nichts Wesentliches geändert
  letzterState = state;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    const s = letzterState;
    if (!s) return;
    const aktuelleSig = signatur(s);
    speichereCloudSpielstand(s.nutzerId, s)
      .then(() => { letzteSyncSignatur = aktuelleSig; return aktualisiereBestenliste(s); })
      .catch((e) => console.warn('Cloud-Sync:', e));
  }, SYNC_VERZOEGERUNG_MS);
}

function schreibeLokal(nutzerId, state) {
  try { localStorage.setItem(speicherKeyFuer(nutzerId), JSON.stringify(state)); } catch {}
}
function leseLokal(nutzerId) {
  try { const r = localStorage.getItem(speicherKeyFuer(nutzerId)); return r ? JSON.parse(r) : null; } catch { return null; }
}

// Beim Start lokalen Cache und Cloud abgleichen → neuerer Stand gewinnt, danach
// liest das Spiel wie gewohnt aus localStorage (ladeSpielstand()).
export async function synchronisiereBeimStart(nutzerId) {
  if (!CLOUD_AKTIV || !nutzerId || nutzerId === 'gast') return;
  const cloud = await ladeCloudSpielstand(nutzerId);
  const lokal = leseLokal(nutzerId);
  if (!cloud && !lokal) return;                                  // frischer Start
  if (cloud && !lokal) { schreibeLokal(nutzerId, cloud); return; }
  if (!cloud && lokal) { await speichereCloudSpielstand(nutzerId, lokal); return; }
  // beide vorhanden → Last-Write-Wins über letzterZeitstempel
  if ((cloud.letzterZeitstempel || 0) >= (lokal.letzterZeitstempel || 0)) schreibeLokal(nutzerId, cloud);
  else await speichereCloudSpielstand(nutzerId, lokal);
}

// Sofort (ungebremst) in die Cloud schreiben — z. B. bei Abmelden/Seitenschluss.
export async function spueleCloud() {
  if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
  const s = letzterState;
  if (CLOUD_AKTIV && s?.nutzerId && s.nutzerId !== 'gast') {
    try { await speichereCloudSpielstand(s.nutzerId, s); letzteSyncSignatur = signatur(s); await aktualisiereBestenliste(s); } catch (e) { console.warn('Cloud-Spülen:', e); }
  }
}

// Cloud scharfschalten: Auth-Adapter + Speicher-Hook setzen. Vor dem Login
// aufrufen. Gibt true zurück, wenn die Cloud aktiv ist.
export function initialisiereCloud() {
  if (!CLOUD_AKTIV) return false;
  auth.setzeAdapter(supabaseAuthAdapter);
  setzeSpeicherHook(planeCloudSync);
  return true;
}
