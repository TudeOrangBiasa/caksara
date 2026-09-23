# Coding Standards — CAKSARA

Konsisten dengan ADR-0001: React+Vite+TS · Tailwind+M3 · oxlint · Zod · Drizzle · Supabase.

## 1. Umum

- TypeScript strict, no `any` tanpa alasan di komentar.
- Satu sumber kebenaran untuk skema: `src/lib/zod/*` — validasi di FE & Edge (Zod di semua batas).
- Jangan expose `GEMINI_API_KEY` di frontend; hanya di Edge Function.
- **Max LOC < 1000** — satu file jangan lebih dari 1000 baris (termasuk komentar & blank). Lewat → split by feature/seam, bukan tambah file `utils.ts` raksasa. CI `check` akan fail jika ada file >1000 LOC.
- **No hardcoded fallback for env/API keys** — `process.env.X` wajib, `if (!process.env.X) throw` kalau missing. Jangan `process.env.VITE_SUPABASE_URL || "https://..."` atau `|| "api_key"` (axios/rpc fallback). `bun run check:secrets` akan fail kalau ada `|| "https://` atau hardcoded `*.supabase.co` tanpa env. Trivy gak perlu — ini lint-time check, bukan vuln scan.

## 2. Lint & Format

- `oxlint` (bukan ESLint) + `oxfmt`. Jalankan `bun run check` sebelum commit.
- Config: `.oxlintrc.json`, `.oxfmtrc.json`. Jangan tambah ESLint/Prettier.
- **Tailwind lint** — `bun run lint:tailwind` wajib hijau (= skrip lokal cek duplikat + `oxlint` memuat 6 aturan `@shadcn/lint`, semua `warn`). Keputusan dikunci di ADR 0012 (baseline 356: arbitrary 234/raw 42/restyle 40/inline 27/unknown 13/static 0; review ulang 2026-10-23). Cek bad codes Tailwind: no duplicate, no arbitrary values tanpa alasan, no `!important` kecuali perlu. Pre-commit jalankan ini bareng `oxlint`.

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
- **Branch per tiket, push hanya via PR.** Setiap fitur/fix tiket = branch baru
  `feat/<nama-fitur>` (fix kecil: `fix/<nama>`, chores/ci: `chore/<nama>`) dari
  `develop` yang sudah sync ke `origin/main`. Push langsung ke `develop`/`main`
  dilarang — semua perubahan masuk lewat PR + review + CI hijau.
- **PR wajib pakai template** (`.github/pull_request_template.md`): What/Why,
  Test plan (perintah + hasil), Screenshots (bila UI), Risk & rollback.
  PR tanpa bagian Test plan diisi = belum siap review.
- **Bukti visual FE wajib via agent-browser** (https://agent-browser.dev/):
  `bun run proof:ui -- <url> docs/proof/<nama-pr>` untuk screenshots
  390px/1280px + light/dark + rekaman `flow.webm`. Pasang pola before/after
  pr-screenshots langsung di body, tanpa `<details>`. Panduan lengkap:
  `docs/agents/ui-proof.md`. Install: `npm i -g agent-browser && agent-browser install`.
- `main` protected (require 1 approving + strict status checks).
- **Linter PR body (CI):** workflow `pr-lint` fail bila body kosong, masih berisi
  placeholder `url-gambar-*`, tanpa perintah test (`bun|bunx|npm`), atau bagian
  Screenshots tanpa gambar dan tanpa kata `backend-only`.

## 12. Writing & TypeScript Guides

- **Unslop:** `docs/agents/writing-unslop.md` — hapus AI patterns, add human voice (puffery, name-dropping, AI vocab, em dash, colon, bold, etc. + adding soul). Berlaku untuk semua docs & PRs.
- **TypeScript Patterns:** `docs/agents/typescript-patterns.md` — branded types, discriminated unions, constructive modeling (NonEmpty, Pairs), simplest total type, unknown over any, schemas before guards, satisfies, boundary validation. Auto-checked: `unknown`/`as`/`!` via oxlint, sisanya code-review.
- **Technical Writing:** `docs/agents/technical-writing.md` — Diátaxis modes, Google developer style, STE one-thought-per-sentence, Global English, review checklist.
- **Prove It Works:** `docs/agents/prove-it-works.md` — verify real thing (build + run + full chain), script the check, trust artifacts not self-reports.
