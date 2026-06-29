-- =============================================================================
-- ZauberAcker — Datenbank-Schema für Supabase
-- -----------------------------------------------------------------------------
-- So anwenden: Supabase-Dashboard → SQL Editor → "New query" → diesen Inhalt
-- einfügen → "Run". Einmalig nötig.
--
-- Hinweis: Eine separate "nutzer"-Tabelle braucht es NICHT — Supabase Auth
-- verwaltet Konten (E-Mail, Passwort-Hash, Sessions) in der eingebauten Tabelle
-- auth.users. Der Benutzername liegt dort in den user_metadata. Hier wird nur
-- der Spielstand gespeichert: ein JSON-Blob (= das heutige state-Objekt) pro
-- Nutzer.
-- =============================================================================

-- Spielstände: genau eine Zeile pro Nutzer.
create table if not exists public.spielstand (
  nutzer_id       uuid primary key references auth.users(id) on delete cascade,
  daten           jsonb       not null,
  version         int         not null default 2,
  aktualisiert_am timestamptz not null default now()
);

-- Row Level Security: jeder Nutzer darf NUR seine eigene Zeile sehen/ändern.
-- Ohne diese Regeln könnte mit dem öffentlichen anon-Key jeder alles lesen —
-- daher ist RLS hier die eigentliche Absicherung.
alter table public.spielstand enable row level security;

create policy "eigenen Stand lesen"
  on public.spielstand for select
  using (auth.uid() = nutzer_id);

create policy "eigenen Stand anlegen"
  on public.spielstand for insert
  with check (auth.uid() = nutzer_id);

create policy "eigenen Stand aendern"
  on public.spielstand for update
  using (auth.uid() = nutzer_id)
  with check (auth.uid() = nutzer_id);
