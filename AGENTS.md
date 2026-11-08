# AGENTS.md — CAKSARA

Project: CAKSARA — Web Edukasi Aksara Bali (INVENTION 2026)

## Source of Truth

- **Spec & Plan:** GitHub Issues epic `#82` (Digifest) / `#92` (final) + anak-anaknya (`ready-for-agent`). `#1` CLOSED/superseded — arsip sejarah, bukan backlog. Jangan pakai local `.scratch/` files.
- **Glosarium:** `CONTEXT.md` — Wresastra, Modul, Sesi Kuis, Hati, XP, Streak, KB Entry, Guru Virtual, Mastery, Profil Anon
- **Keputusan:** `docs/adr/0001-0017` — stack, anon auth, KB, audio Mendeley, bulk+cache, dst. + `0010` taste, `0011` ilustrasi, `0012` tailwind-lint, `0013` duo-renewal, `0014` native-shell, `0015` audit-token-pencil, `0016` pixel-perfect-pencil (19 frame aktual), `0017` rilis-versioning (skema vX.Y.Z, rilis perdana v1.0.0, pin tombol Unduh). ADR adalah sumber kebenaran teknis.
- **Standar:** `docs/CODING_STANDARDS.md` — oxlint, Zod di semua batas, Drizzle, RLS + `docs/agents/writing-unslop.md` (human voice), `docs/agents/typescript-patterns.md` (branded types, discriminated unions), `docs/agents/technical-writing.md` (Diátaxis), `docs/agents/prove-it-works.md` (verify real thing)

## Stack (ADR-0001)

React + Vite + TypeScript · Tailwind + Material 3 · oxlint + oxfmt · Zod · Drizzle ORM · Supabase (Postgres + Auth Anonymous + Edge + Storage + RLS + Cron) · Gemini Flash temp 0.3 · Noto Sans Balinese self-host · Deploy Vercel (FE) + Supabase (DB/Edge)

## Workflow

1. Ambil ticket dari GitHub Issues dengan label `ready-for-agent` di epic aktif (`#82`/`#92`), kerjakan blockers-first sesuai `Blocked by` di body tiket
2. Tiap ticket = branch baru `feat/<nama>` (fix: `fix/<nama>`, chores: `chore/<nama>`) dari `main` yang sync ke `origin/main`. Tidak ada branch `develop`. Push langsung ke `main` dilarang — semua via PR + `bun run verify` hijau (local verifier, lihat docs/agents/verifier.md) (detail: `docs/CODING_STANDARDS.md` §11)
3. **Worktree bertingkat.** Wajib worktree terpisah per tiket untuk kode runtime atau multi-file (fitur, fix, shell, DB): isolasi verify, build, dan dev server. Opsional untuk docs-only satu file (typo, komentar, ADR tanpa kode): edit langsung di checkout utama. Pola nama `wt-<nomor-tiket>-<nama-singkat>` (contoh `wt-154-proof-gambar`): cleanup hanya hapus worktree berpola ini milik tiket sendiri, jangan sentuh worktree tetangga. Worktree baru wajib pasang hook (`scripts/ensure-worktree-hooks --worktree <path>`).
4. Tiap ticket dikerjakan di fresh context, drive `/tdd` internally, tutup dengan `/code-review` (Standards + Spec)
5. Jangan push spec/plan sebagai file — Issues adalah tracker
6. **Auto merge, tanpa human gate.** Agen merge PR sendiri via `gh pr merge` setelah `bun run verify` hijau di head PR dan `bun run lint:pr-body` hijau. Dilarang berhenti dengan "menunggu approve" atau "tidak bisa merge": `main` tanpa required reviews dan `develop` tidak ada (cek API 2026-11-08; verifikasi ulang bila ragu: `gh api repos/{owner}/{repo}/branches/main/protection --jq .required_pull_request_reviews`). Sebelum merge, cek `gh pr view --json mergeable,mergeStateStatus`: hanya merge bila MERGEABLE. Hapus worktree hanya setelah `gh pr view` konfirmasi status MERGED, bukan setelah perintah merge dikirim. Tiket selesai = merge + worktree terhapus + isu tertutup, dalam satu rangkaian. Human gate hanya untuk konflik yang tidak bisa resolve otomatis dan keputusan yang mengubah ADR.

```bash
bun install                    # install
bun run dev                    # dev (apps/web di 5173)
bun run check                  # oxlint + oxfmt --write (wajib hijau sebelum commit)
bun run build                  # build Vite
bun run db:push                # drizzle-kit push ke Supabase (butuh DATABASE_URL)
bun run db:generate            # generate migrations
```

## Secrets

Jangan commit `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY` plaintext. API key Gemini hanya di Edge Function. Pakai `.env` lokal (gitignored) dan Vercel env.

## Skills

Repo-owned di `skills/` (`verify-caksara`, `create-formal-verification`) — bukan backup. Upstream ter-track di `.agents/skills/` (8 dir, termasuk `taste-skill` + `code-review` lokal yang tak ada di lock) + `.claude/skills/` (symlink ke `.agents` + `checklist-design` nyata). `skills-lock.json` hanya mengunci 7 skill upstream — `taste-skill`/`code-review` di luar lock, `checklist-design` mismatch (ada di lock + `.claude`, tak ada di `.agents`). `skills-lock.json` & `bts.jsonc` jangan dihapus (`bts.jsonc` = histori scaffold better-t-stack, bukan arsitektur: `database:none`/`auth:none` di sana sudah tidak berlaku).

## Agen rules (craft-correct retrospect Nov 2026)

Tiap aturan punya enforcer. Aturan tanpa enforcer = repeat, naikkan levelnya di change yang sama.

| #   | Aturan                                                                         | Enforcer                                                                    |
| --- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 1   | CTA jujur: label tombol = aksinya (dilarang label login dengan aksi buka KB)   | `apps/web/src/features/landing/ui-polish.test.ts` hero CTA                  |
| 2   | Demo + jawaban Guru Virtual wajib blok SUMBER RUJUKAN + link Basis Pengetahuan | review + `apps/web/src/features/teacher/guru-remote.test.ts` fallback lokal |
| 3   | Screenshot PR visual wajib URL absolut (path relatif tak render di GitHub)     | `pr-lint` + review body sebelum merge manual                                |
| 4   | Ganti warna tombol cek light + dark (secondary bisa gagal di krem)             | proof-ui 390/1280 + baca kedua screenshot sebelum merge                     |

## Verification gate (solo, local verifier)

Gate merge = `bun run verify` lokal ([docs/agents/verifier.md](docs/agents/verifier.md), mode in [docs/agents/repo-mode.md](docs/agents/repo-mode.md)). CI `pr-lint` + cron `supabase-keepalive` tetap jalan di GitHub. The pre-push hook runs it on every push; run it again before `gh pr create` and paste the real output in the PR body. Never `git push --no-verify`. New worktrees: `scripts/ensure-worktree-hooks --worktree <path>`. Merge once the verifier passed at the PR head; do not wait on GitHub checks. App-driving proof: `skills/verify-caksara/`.
