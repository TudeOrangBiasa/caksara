-- V9 (#30): Cron reset streak harian 00:00 WITA via pg_cron.
--
-- WITA = UTC+8 tetap (tanpa DST), jadi 00:00 WITA = 16:00 UTC hari sebelumnya.
-- Perbandingan memakai tanggal WITA, bukan current_date UTC, supaya pengguna
-- yang aktif kemarin (WITA) tidak ikut ter-reset.
--
-- BUTUH: tabel public.profiles dari `bun run db:push` (supabase/schema.ts).
-- CARA APPLY: Supabase Dashboard > SQL Editor > tempel file ini > Run.
-- (pg_cron butuh hak via dashboard; tidak bisa lewat drizzle-kit push.)
-- Cermin lokal untuk mode anon sudah ada di applyOvernightReset (profile-store.ts).

create extension if not exists pg_cron with schema extensions;

-- Hapus jadwal lama bila migrasi dijalankan ulang.
select cron.unschedule('reset-streak-harian')
where exists (select 1 from cron.job where jobname = 'reset-streak-harian');

select cron.schedule(
  'reset-streak-harian',
  '0 16 * * *',
  $$
  update public.profiles set streak = 0
  where last_active_date < to_char(
    (now() at time zone 'Asia/Makassar') - interval '1 day',
    'YYYY-MM-DD'
  )
    and streak <> 0
  $$
);
