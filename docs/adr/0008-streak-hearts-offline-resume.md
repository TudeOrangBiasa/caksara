# Streak, Hati, Offline & Resume Sesi

Konteks: Hati & streak butuh reset harian; sesi kuis bisa ditutup tengah jalan; Supabase/Gemini bisa down.

Keputusan: Hati refill 5 penuh tiap hari kalender (cek `heartsRefilledAt` saat refresh, 00:00 WITA) — tanpa beli/timer. Streak di-reset harian oleh cron (`pg_cron`/Supabase Cron, set `streak=0` jika `last_active_date` bukan kemarin). Resume sesi pakai `quiz_sessions.currentIndex+updatedAt` (tawarkan Lanjut/Mulai Ulang). Resilien penuh: progres buffer lokal + sync saat online, Supabase down → soft state + retry, KB cache lokal untuk mode offline.

