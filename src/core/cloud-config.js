// =============================================================================
// cloud-config.js — Zugangsdaten für die Online-Datenbank (Supabase)
// -----------------------------------------------------------------------------
// Die zwei Werte stammen aus dem Supabase-Projekt:
//   Project Settings → API
//     • "Project URL"        → SUPABASE_URL
//     • "Publishable key"     → SUPABASE_PUBLISHABLE_KEY  (beginnt mit sb_publishable_)
//
// Beide Werte sind ÖFFENTLICH und dürfen im Browser stehen (und in Git) — sie
// sind dafür gemacht. Geschützt werden die Daten durch "Row Level Security"
// (siehe supabase-schema.sql), nicht durch Geheimhaltung dieses Schlüssels.
//
// ⚠️ NIEMALS den "Secret key" (sb_secret_…) oder service_role hier eintragen —
//    der umgeht alle Sicherheitsregeln und gehört ausschließlich auf einen Server.
//
// Solange hier Platzhalter stehen, bleibt die Cloud AUS und das Spiel läuft rein
// lokal (localStorage). Mit echten Werten schaltet sich die Datenbank automatisch
// scharf.
// =============================================================================

export const SUPABASE_URL = 'https://yisfpvlvxhrnwgjlxewn.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nqWEUS3giuFlgMLu_BeHGA_TZwP5_aX';

// True, sobald oben echte Werte stehen. Steuert, ob die Cloud genutzt wird.
export function cloudKonfiguriert() {
  return (
    !SUPABASE_URL.includes('DEIN-PROJEKT') &&
    /^https:\/\/.+\.supabase\.co/.test(SUPABASE_URL) &&
    SUPABASE_PUBLISHABLE_KEY.startsWith('sb_') &&
    SUPABASE_PUBLISHABLE_KEY.length > 20
  );
}
