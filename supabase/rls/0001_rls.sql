-- RLS awal CAKSARA (ADR-0002: Auth Anonymous default).
--
-- Cara apply (pilih satu):
-- 1. `bun run db:apply-sql supabase/rls/0001_rls.sql` (DATABASE_URL dari .env root)
-- 2. Supabase Dashboard > SQL Editor > tempel file ini > Run (setelah `bun run db:push`).
-- Prasyarat: tabel dari supabase/schema.ts sudah ada; Authentication > Anonymous = ON.
-- File idempoten: aman dijalankan ulang (drop policy if exists + enable RLS).

-- 1. Nyalakan RLS di tabel privat.
alter table public.profiles enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.answers enable row level security;
alter table public.user_aksara_progress enable row level security;
alter table public.quiz_calls enable row level security;

-- 2. Pemilik baris = auth.uid() (anon maupun asli). Pola sama untuk semua
-- tabel privat: buat policy per tabel dengan klausa USING/WITH CHECK sendiri.

-- profiles: id = auth.uid()
drop policy if exists "own_profile_all" on public.profiles;
create policy "own_profile_all" on public.profiles
  for all using (auth.uid()::text = id) with check (auth.uid()::text = id);

-- quiz_sessions: profile_id = auth.uid()
drop policy if exists "own_sessions_all" on public.quiz_sessions;
create policy "own_sessions_all" on public.quiz_sessions
  for all using (auth.uid()::text = profile_id) with check (auth.uid()::text = profile_id);

-- answers: lewat kepemilikan sesi induk
drop policy if exists "own_answers_all" on public.answers;
create policy "own_answers_all" on public.answers
  for all using (
    exists (
      select 1 from public.quiz_sessions s
      where s.id = answers.session_id and s.profile_id = auth.uid()::text
    )
  ) with check (
    exists (
      select 1 from public.quiz_sessions s
      where s.id = answers.session_id and s.profile_id = auth.uid()::text
    )
  );

-- user_aksara_progress: profile_id = auth.uid()
drop policy if exists "own_progress_all" on public.user_aksara_progress;
create policy "own_progress_all" on public.user_aksara_progress
  for all using (auth.uid()::text = profile_id) with check (auth.uid()::text = profile_id);

-- quiz_calls: profile_id = auth.uid()
drop policy if exists "own_calls_all" on public.quiz_calls;
create policy "own_calls_all" on public.quiz_calls
  for all using (auth.uid()::text = profile_id) with check (auth.uid()::text = profile_id);

-- 3. Tabel publik read-only: kb_entries + modules bisa dibaca semua orang,
-- tulis hanya service_role (tanpa policy insert/update/delete = ditolak).
alter table public.kb_entries enable row level security;
alter table public.modules enable row level security;
drop policy if exists "public_read_kb" on public.kb_entries;
create policy "public_read_kb" on public.kb_entries for select using (true);
drop policy if exists "public_read_modules" on public.modules;
create policy "public_read_modules" on public.modules for select using (true);
