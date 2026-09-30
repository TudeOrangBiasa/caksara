## Untuk Panitia

Prasyarat: [Bun](https://bun.sh) ≥ 1.1 (sudah termasuk runtime + package manager).

```bash
unzip panitia-caksara.zip && cd panitia-caksara
bun install
bun run dev:web   # → http://localhost:5173, mode lokal penuh
```

Tanpa env apapun aplikasi jalan penuh secara lokal: `getSupabase()` di
`apps/web/src/lib/supabase.ts` mengembalikan `null` bila
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` belum diset, dan seluruh
fitur (modul, kuis fallback lokal, progres/XP/Hati/Streak, KB cache)
memakai `localStorage`. Console hanya menampilkan warning
`"[supabase] ... mode lokal."` — itu normal, bukan error.

Zip ini 100% bersih dari secret: TIDAK berisi `.env` / `.env.keys` /
`apps/web/.env` dalam bentuk apapun (plaintext maupun `encrypted:`).
Verifikasi: `bun run check:secrets` hijau; `grep -rE 'sb_secret|postgres://|AIza|encrypted:eyJ' .`
0 hit.

### Mode online (opsional, butuh Supabase sendiri)

```bash
cp apps/web/.env.example apps/web/.env   # isi 2 VITE_* milik sendiri
bun run dev:web
```

Ambil nilai dari Supabase Dashboard (proyek milik sendiri) >
Project Settings > API. Jangan minta kredensial owner — owner memakai
repo + `.env` lokal sendiri dan tidak membagikannya.

### Untuk owner/developer (bukan panitia)

Root `.env` (DATABASE_URL, GEMINI_API_KEY, dst — gitignored, tak pernah
masuk zip) didekripsi via dotenvx hanya di mesin owner:
`./scripts/start.sh` (= `dotenvx run -- bun run dev:web`).

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
cp apps/web/.env.example apps/web/.env  # isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
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

FE hanya butuh 2 env publik (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — anon key
aman di bundle karena RLS mengunci per `auth.uid()`). Jangan taruh `GEMINI_API_KEY` di
Vercel/FE — ia hanya hidup di Edge Function (`supabase functions deploy generate-quiz`
++ `supabase secrets set GEMINI_API_KEY=...`).

```bash
cp apps/web/.env.example apps/web/.env  # isi 2 VITE_* dari Supabase Dashboard > Project Settings > API
bunx vercel env add VITE_SUPABASE_URL preview production   # ulangi per env; production = deploy --prod
bunx vercel env add VITE_SUPABASE_ANON_KEY preview production
bunx vercel env ls            # verifikasi; redeploy agar env berlaku
```

E2E checklist juri (manual ≤15 mnt): Onboarding → Sesi Kuis (dengar_pilih badge Latin +
atribusi) → Profil; 18 Wresastra tanpa tofu di 390/1280 + zoom 200%; `bun run check:secrets`
hijau (no GEMINI di bundle); RLS A≠B via `supabase/rls/0001_rls.sql`; Edge 429 sebelum
Gemini (lihat `x-quiz-source`); `bun run build` + Vercel preview hijau.
