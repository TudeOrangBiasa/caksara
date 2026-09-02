# Coding Standards — CAKSARA

Konsisten dengan ADR-0001: React+Vite+TS · Tailwind+M3 · oxlint · Zod · Drizzle · Supabase.

## 1. Umum

- TypeScript strict, no `any` tanpa alasan di komentar.
- Satu sumber kebenaran untuk skema: `src/lib/zod/*` — validasi di FE & Edge (Zod di semua batas).
- Jangan expose `GEMINI_API_KEY` di frontend; hanya di Edge Function.

## 2. Lint & Format

- `oxlint` (bukan ESLint) + `oxfmt`. Jalankan `bun run check` sebelum commit.
- Config: `.oxlintrc.json`, `.oxfmtrc.json`. Jangan tambah ESLint/Prettier.

## 3. Struktur (Dev Guide §3)

- `supabase/migrations/` + `supabase/schema.ts` (Drizzle), `supabase/functions/generate-quiz/`
- `apps/web/src/app/` (routes), `components/`, `features/quiz|progress|kb|teacher/`, `lib/supabase.ts`, `lib/zod/`, `lib/store.ts`, `styles/aksara.css`

## 4. DB & Drizzle

- Kolom `modules.order` selalu quoted (`"order"`), import `boolean` wajib.
- RLS: `profile_id = auth.uid()` untuk data privat; test RLS tiap migrasi.
- `drizzle-kit push/generate` — jangan edit SQL manual.

## 5. Supabase

- Anon Auth default; cek `profiles.name` untuk baru/lama (bukan ada session).
- Storage audio di `supabase Storage /audio/*`, atribusi CC BY 4.0 Mendeley di KB/Settings.

## 6. Gemini

- `temperature 0.3` jangan dinaikkan; `responseSchema = quizSchema`.
- Bulk 1 req = 3–8 soal; level adaptif via `level` KB, bukan prompt "bikin gampang".

## 7. UI & A11y

- Material 3, Tailwind, Noto Sans Balinese self-host `[lang='ban']` + `font-display:swap`.
- Dark mode, font aksara 20/24/32px, kontras + keyboard + ARIA.

## 8. Testing

- Hanya external behavior (Vitest untuk Zod, Playwright untuk alur kuis). Mock Supabase/Gemini di seam, bukan detail internal.

## 9. Git

- Commit tracer-bullet per tiket, blockers-first. `bts.jsonc` jangan dihapus.
