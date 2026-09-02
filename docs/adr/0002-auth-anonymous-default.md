# Auth Anonymous Default (Supabase)

Konteks: butuh progres/XP/streak/hearts per akun tanpa friction login di hackathon, tapi RLS harus tetap jalan dari detik pertama.

Keputusan: pakai Supabase Anonymous Auth sebagai default. Begitu app load, buat/pakai anon session; penentu user baru vs lama adalah ada/tidaknya `profiles.name`, bukan ada/tidaknya session. `profiles.id = auth.uid()` anon. RLS: `profiles`, `quiz_sessions`, `answers`, `user_aksara_progress` hanya boleh akses `profile_id = auth.uid()` (anon maupun asli); `kb_entries`/`modules` read-only publik. Upgrade ke akun asli (`isAnon=false`, link session) nice-to-have.

Pertimbangan: anon session unik per browser/device, progres tidak cross-device sampai upgrade. Trade-off ini diterima untuk UX tanpa login.
