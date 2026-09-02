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
