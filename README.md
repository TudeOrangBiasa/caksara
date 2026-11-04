# CAKSARA — Web Edukasi Interaktif Aksara Bali

INVENTION 2026 · Web Design · "Building Smarter Communities Through Digital Learning"

Edutainment 4 Modul (Sapaan & Adat → Wresastra → Andap/Alus → Tradisi) dengan Sesi Kuis digenerate Gemini Flash dari Knowledge Base terpercaya (bukan ngarang), progres per Profil Anon (XP/Hati/Streak/Mastery).

## Stack

React + Vite + TypeScript · Tailwind + Material 3 · oxlint + oxfmt · Zod · Drizzle ORM · Supabase (Postgres + Auth Anonymous + Edge Function + Storage + RLS + Cron) · `gemini-3.1-flash-lite` temp 0.3 · Noto Sans Balinese (U+1B00–U+1B7F self-host) · Deployed Vercel (FE) + Supabase (DB/Edge).

## AI: kuis & Guru

Sesi Kuis digenerate Edge Function `supabase/functions/generate-quiz/index.ts`
(model `gemini-3.1-flash-lite`, temp 0.3, `responseSchema` JSON + Zod `quizSchema`).
Soal Gemini wajib mengutip KB Entry yang di-inject (`sourceRef` "KB#id · Basis
Pengetahuan"); soal tanpa kutipan valid ditolak ke fallback bank + header
`x-quiz-source: gemini|fallback` yang jujur.

### Guru Virtual = Gemini RAG Digifest (#94 #95)

Edge Function `supabase/functions/guru-rag/index.ts` (model
`gemini-3.1-flash-lite`, temp 0.3, `responseSchema` `{ answer, entryIds,
outside }` + Zod `ragResponseSchema`): seluruh 27 entri KB (id + judul + isi
ringkas) di-inject sebagai konteks terikat; `entryIds` asing dibuang
server-side; `outside:true` → FE render kalimat tolak exact #90; gagal/tanpa
key → 503 + fallback lokal (`getTeacherReply` / explanation statis), tak
pernah blank. Mode `explain` melayani tombol "Kenapa?" pada jawaban salah
kuis (2-3 kalimat + chip sumber). Secrets (`GEMINI_API_KEY`) hanya di
Supabase Edge dashboard — jangan pernah commit.

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

Maskot produk = **Bedawang Nala** (aset lokal `apps/web/public/assets/bedawang-*.png`, dipakai di favicon/splash/header).

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
