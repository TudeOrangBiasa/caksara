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
- **Tautological tests considered harmful** — jangan tulis test yang cuma mengulang implementasi (`expect(add(1,2)).toBe(1+2)` atau `expect(component).toHaveBeenCalledWith(props)` tanpa behavior). Test harus gagal jika behavior eksternal rusak, bukan jika refactor internal berubah. Uji outcome yang dilihat user/seam, bukan baris kode.

## 9. Comments

- **Keep comments short.** Hapus klaim dari komentar yang bisa diturunkan dari kode itu sendiri (`// increment i` di `i++` adalah noise). Komentar hanya untuk _why_ & trade-off yang tidak terlihat di kode, bukan _what_.

## 10. Skills & Code Review

- **React Best Practice (Vercel)** — pakai skill `vercel-labs/agent-skills` (terutama `web-design-guidelines` + `react-best-practices` di mana tersedia) sebagai rujukan di `AGENTS.md`/`docs/agents/`. Pattern: server/client boundary, Suspense, key, memo, a11y, Tailwind M3.
- **Matt Pocock Skills (Code Review)** — skill `code-review` (Standards + Spec two-axis) wajib jalan sebelum merge. Directory `docs/agents/` + `CONTEXT.md` adalah source of truth untuk review.
- **Pre-commit wajib run code review** — `.husky/pre-commit` akan menjalankan `bun run check` (oxlint+oxfmt) + `bun run check-types` + `code-review` check (via `gh` atau script) sebelum push. Gagal = commit ditolak.

## 11. Git

- Commit tracer-bullet per tiket, blockers-first. `bts.jsonc` jangan dihapus.
- Branch `feat/<feature-name>` (bukan numbered), PR wajib dengan body, `main` protected (require 1 approving + strict status checks).
