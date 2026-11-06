# Caksara, web edukasi interaktif aksara Bali

INVENTION 2026, kategori Web Design. Tema tahun ini "Building Smarter Communities Through Digital Learning".

Caksara itu edutainment buat aksara Bali. Empat modul berurutan, Sapaan dan Adat, lalu Wresastra, lalu Andap dan Alus, lalu Tradisi. Tiap modul ditutup Sesi Kuis berisi 3 soal yang digenerate Gemini Flash dari Knowledge Base terpercaya, jadi isinya ngutip sumber, bukan ngarang. Progres dicatat per Profil Anon, lengkap dengan XP, Hati, Streak, dan Mastery. Kamu masuk, pilih nama panggilan dulu, langsung main. Google itu opsional, dan yang mau adu rajin bisa lihat papan peringkat top 20 XP.

## Stack

React, Vite, dan TypeScript di depan. Tailwind plus Material 3 buat tampilan, oxlint dan oxfmt buat jaga kode tetap rapi, Zod di tiap batas data, Drizzle ORM ke Supabase. Supabase-nya dipakai penuh, Postgres, Auth Anonymous, Auth Google, Edge Function, Storage, RLS, sampai Cron. Model kuisnya `gemini-3.1-flash-lite` dengan temp 0.3. Glyph Bali dirender Noto Sans Balinese yang di self-host, rentang U+1B00 sampai U+1B7F. Deploynya pisah, FE di Vercel dan DB plus Edge di Supabase.

## Kuis dan Guru Virtual

Sesi Kuis digenerate Edge Function `supabase/functions/generate-quiz/index.ts`. Modelnya `gemini-3.1-flash-lite`, temp 0.3, `responseSchema` JSON plus Zod `quizSchema`. Aturannya simpel dan saya suka bagian ini. Setiap soal Gemini wajib mengutip KB Entry yang di-inject, formatnya `sourceRef` berisi "KB#id · Basis Pengetahuan". Kalau soal datang tanpa kutipan valid, server menolaknya dan jatuh ke bank fallback. Header `x-quiz-source` bilang jujur isinya `gemini` atau `fallback`.

Guru Virtual itu Gemini RAG Digifest, lihat #94 dan #95. Edge Function `supabase/functions/guru-rag/index.ts` memakai model `gemini-3.1-flash-lite`, temp 0.3, `responseSchema` berisi `{ answer, entryIds, outside }` plus Zod `ragResponseSchema`. Seluruh 27 entri KB, id plus judul plus isi ringkas, di-inject sebagai konteks terikat. Kalau model mengarang `entryIds` asing, server membuangnya. Kalau `outside:true`, FE merender kalimat tolak exact sesuai #90. Kalau gagal atau tanpa key, responsnya 503 plus fallback lokal, `getTeacherReply` atau explanation statis, jadi layar tidak pernah blank. Mode `explain` melayani tombol "Kenapa?" pada jawaban kuis yang salah, jawabannya 2 sampai 3 kalimat plus chip sumber. Secrets seperti `GEMINI_API_KEY` hanya hidup di Supabase Edge dashboard. Jangan pernah commit.

## Struktur

```
caksara/
├─ supabase/
│  ├─ schema.ts              # Drizzle schema (ADR-0002)
│  ├─ migrations/
│  └─ functions/generate-quiz/
├─ apps/web/
│  ├─ src/app/routes.tsx
│  ├─ src/lib/supabase.ts
│  ├─ src/lib/zod/question.ts
│  └─ src/styles/aksara.css
├─ docs/CODING_STANDARDS.md
├─ drizzle.config.ts
└─ caksara-docs/              # PRD, Storyboard, Dev Guide (sumber kebenaran)
```

## Quick start

```bash
bun install
cp apps/web/.env.example apps/web/.env  # isi VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
bun run dev:web    # web di http://localhost:5173
bun run check      # oxlint + oxfmt
bun run db:push    # drizzle-kit push ke Supabase (butuh DATABASE_URL)
```

Saya biasanya mulai dari tiga perintah pertama. Kalau mau cek bentuk aksara dan soalnya, lihat `caksara-docs/README.md` buat viewer verifikasinya.

## Glosarium dan maskot

Istilah yang dipakai di repo ini, Wresastra, Modul, Sesi Kuis, Hati, XP, Streak, KB Entry, Guru Virtual, Mastery, Profil Anon, semuanya didefinisikan di `../CONTEXT.md`. Baca itu dulu kalau bingung, definisinya pendek.

Maskot produk ini Bedawang Nala. Asetnya lokal di `apps/web/public/assets/bedawang-*.png`, dipakai di favicon, splash, dan header.

Soal keputusan arsitektur, baca `../docs/adr/0001..0014`. Isinya stack lock, anon auth, KB seed, audio Mendeley, bulk plus cache, dan lain-lain. Satu yang penting, native final pakai Capacitor Android plus Electron, tanpa iOS dan tanpa Tauri, lihat ADR-0014 dan #99.

## Deploy

FE jalan via Vercel dengan `vercel.json`. DB, Edge, dan Storage jalan via Supabase. API key Gemini hanya ada di Edge Function, tidak di tempat lain.

### Vercel env

Bagian ini panduan, bukan secrets. FE cuma butuh 2 env publik, `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`. Publishable key aman ikut ke bundle karena RLS mengunci per `auth.uid()`. Jangan taruh `GEMINI_API_KEY` di Vercel atau FE. Ia hanya hidup di Edge Function, deploy pakai `supabase functions deploy generate-quiz` lalu `supabase secrets set GEMINI_API_KEY=...`.

```bash
cp apps/web/.env.example apps/web/.env  # isi 2 VITE_* dari Supabase Dashboard > Project Settings > API
bunx vercel env add VITE_SUPABASE_URL preview production   # ulangi per env; production = deploy --prod
bunx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview production
bunx vercel env ls            # verifikasi; redeploy agar env berlaku
```

Checklist E2E buat juri, manual, maksimal 15 menit. Onboarding, lalu Sesi Kuis yang ada badge Latin `dengar_pilih` plus atribusi, lalu Profil. 18 Wresastra tanpa tofu di 390 dan 1280 plus zoom 200%. `bun run check:secrets` hijau, artinya tidak ada GEMINI di bundle. RLS A tidak sama dengan B via `supabase/rls/0001_rls.sql`. Edge 429 sebelum Gemini, lihat `x-quiz-source`. Terakhir `bun run build` plus Vercel preview hijau.

<!-- BEGIN digifest-authdocs (#89 #91), jangan gabung dengan seksi AI OwnerI -->

## Auth Google dan papan peringkat (#89)

Login itu Supabase Auth dengan provider Google saja, `signInWithOAuth({ provider: 'google' })`, lihat `apps/web/src/lib/auth-google.ts`. Alurnya santai. Setelah nama panggilan, app menawarkan `Simpan pakai Google` dan `Lewati dulu`, tidak blocking. Tamu tetap main penuh dengan XP dan Hati di `localStorage`, dan setelah OAuth sukses progres lokal dimigrasi ke baris server, `profile_id = auth.uid()`, dengan XP dan streak menang-maks.

Papan peringkat tersimpan di `leaderboard_entries` berisi `display_name`, `suffix` 100 sampai 999 dari hash stabil `profile_id`, `xp`, dan `updated_at`. Tampilnya di tab Profil sebagai `Nama NNN`, top 20 diurut XP desc. RLSnya, SELECT publik buat anon plus auth, tulis hanya baris sendiri, lihat `supabase/rls/0001_rls.sql` plus migrasi `supabase/migrations/0001_*`.

Redirect URL yang wajib didaftarkan ada di Dashboard Supabase, menu Authentication, submenu URL Configuration, bagian Redirect URLs. Provider Google diaktifkan Tude di dashboard. Daftarnya:

1. `http://localhost:5173/` buat dev lokal.
1. `https://<proyek>.vercel.app/` buat preview plus production.
1. `app.caksara.web://auth/callback` buat shell Android #100, custom scheme dengan allowlist manual.

Akun demo Google buat juri dibagikan via kanal panitia, bukan repo.

## Batasan yang diketahui (#91)

1. Web Speech, `speechSynthesis` di `lib/speech.ts`, hanya membacakan teks Latin dengan `lang id-ID` dan rate 0.9. Tidak ada voice Bali, dan glyph aksara tidak pernah dibacakan, lihat ADR-0005. Audio kurasi Mendeley dipakai bila entrinya sudah terkurasi.
1. KB berisi 27 materi, 18 wresastra plus 9 kosakata dan budaya. Guru Virtual menjawab dari materi lokal ini saja.
1. Live-OAuth hanya jalan bila provider Google aktif di dashboard Supabase. Tanpa itu tombol Google disembunyikan dan app tetap jalan sebagai tamu.

## Kredit (#91, #105 #109)

1. Maskot Bedawang Nala, aset orisinal CAKSARA di `apps/web/public/assets/bedawang-*.png`.
1. Font Noto Sans Balinese, self-host woff2, OFL, buat glyph U+1B00 sampai U+1B7F.
1. Audio pelafalan, 10 klip terkurasi dari "Balinese Text-to-Speech Dataset", Mendeley Data, DOI 10.17632/6syjwz24v5.2, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/, lihat `apps/web/public/audio/NOTICE-AUDIO.md` buat provenance plus langkah Storage.
1. Efek suara UI, 8 klip Kenney Interface Sounds, CC0 1.0, https://kenney.nl/assets/interface-sounds, lihat `apps/web/public/sfx/NOTICE-SFX.md`.
1. Avatar IP oleh s1dashu, MIT, via ipaslogo.com, lihat `apps/web/public/NOTICE-IP-AVATARS.md`.

## Tag rilis (#91)

Demo Digifest, tag annotated `v1.0-submission` di commit `88518df91c772d938af85f7c233f71d549447d1f`, objek tag `cc5fd164c27113c6e90196c1b3137625e6831173`, lihat #91.
<!-- END digifest-authdocs -->
