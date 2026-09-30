## Untuk Panitia

Prasyarat: [Bun](https://bun.sh) ≥ 1.1 (sudah termasuk runtime + package manager).

```bash
unzip panitia-caksara.zip && cd panitia-caksara
bun install
bun run dev:web   # → http://localhost:5173, tanpa isi env lagi
```

`.env` berisi 2 var publik (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`) SUDAH ada di dalam zip (`apps/web/.env`),
jadi semua fitur jalan out-of-box — mode online otomatis ke proyek owner,
tak perlu Supabase sendiri. Tanpa koneksi, aplikasi tetap jalan lokal
(`localStorage`) dengan warning `"[supabase] ... mode lokal."` — itu normal.

Aman: publishable key bersifat PUBLIK by design (ikut terkirim di JS bundle
ke setiap pengunjung) dan dilindungi RLS per `auth.uid()`. Secret owner
(`DATABASE_URL`, `GEMINI_API_KEY`, `PRIVATE_KEY`) TIDAK ada di zip ini.

### Untuk owner/developer (bukan panitia)

Root `.env` (DATABASE_URL, GEMINI_API_KEY, dst — gitignored, tak pernah
masuk zip) didekripsi via dotenvx hanya di mesin owner:
`./scripts/start.sh` (= `dotenvx run -- bun run dev:web`).
PANITIA JANGAN pakai `scripts/start.sh` — itu owner-only.

> Catatan untuk panitia: bagian di bawah garis (Struktur, Quick Start,
> Glosarium, ADRs, Deploy) hanya berlaku untuk repo penuh, bukan isi zip —
> abaikan bila file yang dirujuk tidak ada di zip.

---

# CAKSARA — Web Edukasi Interaktif Aksara Bali

INVENTION 2026 · Web Design · "Building Smarter Communities Through Digital Learning"

Edutainment 4 Modul (Sapaan & Adat → Wresastra → Andap/Alus → Tradisi) dengan Sesi Kuis digenerate Gemini Flash dari Knowledge Base terpercaya (bukan ngarang), progres per Profil Anon (XP/Hati/Streak/Mastery).

## Stack

React + Vite + TypeScript · Tailwind + Material 3 · oxlint + oxfmt · Zod · Drizzle ORM · Supabase (Postgres + Auth Anonymous + Edge Function + Storage + RLS + Cron) · Gemini Flash temp 0.3 · Noto Sans Balinese (U+1B00–U+1B7F self-host) · Deployed Vercel (FE) + Supabase (DB/Edge).

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

## Quick Start

```bash
bun install
cp apps/web/.env.example apps/web/.env  # isi VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
bun run dev          # web di http://localhost:5173
bun run check        # oxlint + oxfmt
bun run db:push      # drizzle-kit push ke Supabase (butuh DATABASE_URL)
```

Lihat `caksara-docs/README.md` untuk viewer verifikasi aksara/soal.

## Glosarium

Lihat `../CONTEXT.md` — Wresastra, Modul, Sesi Kuis, Hati, XP, Streak, KB Entry, Guru Virtual, Mastery, Profil Anon.

## ADRs

`../docs/adr/0001..0009` — stack lock, anon auth, KB seed, audio Mendeley, bulk+cache, dll.

## Deploy

FE via Vercel (`vercel.json`), DB/Edge/Storage via Supabase. API key Gemini hanya di Edge Function.

### Vercel env (FE — panduan, bukan secrets)

FE hanya butuh 2 env publik (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — publishable key
aman di bundle karena RLS mengunci per `auth.uid()`). Jangan taruh `GEMINI_API_KEY` di
Vercel/FE — ia hanya hidup di Edge Function (`supabase functions deploy generate-quiz`
++ `supabase secrets set GEMINI_API_KEY=...`).

```bash
cp apps/web/.env.example apps/web/.env  # isi 2 VITE_* dari Supabase Dashboard > Project Settings > API
bunx vercel env add VITE_SUPABASE_URL preview production   # ulangi per env; production = deploy --prod
bunx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview production
bunx vercel env ls            # verifikasi; redeploy agar env berlaku
```

E2E checklist juri (manual ≤15 mnt): Onboarding → Sesi Kuis (dengar_pilih badge Latin +
atribusi) → Profil; 18 Wresastra tanpa tofu di 390/1280 + zoom 200%; `bun run check:secrets`
hijau (no GEMINI di bundle); RLS A≠B via `supabase/rls/0001_rls.sql`; Edge 429 sebelum
Gemini (lihat `x-quiz-source`); `bun run build` + Vercel preview hijau.
