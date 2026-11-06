# AGENTS.md — CAKSARA

Project: CAKSARA — Web Edukasi Aksara Bali (INVENTION 2026)

## Source of Truth

- **Spec & Plan:** GitHub Issues `TudeOrangBiasa/caksara` — `#1` Spec + `#2-#9` Tickets (ready-for-agent). Jangan pakai local `.scratch/` files.
- **Glosarium:** `CONTEXT.md` — Wresastra, Modul, Sesi Kuis, Hati, XP, Streak, KB Entry, Guru Virtual, Mastery, Profil Anon
- **Keputusan:** `docs/adr/0001-0009` — stack, anon auth, KB, audio Mendeley, bulk+cache, dll. (ADR adalah sumber kebenaran teknis)
- **Standar:** `docs/CODING_STANDARDS.md` — oxlint, Zod di semua batas, Drizzle, RLS + `docs/agents/writing-unslop.md` (human voice), `docs/agents/typescript-patterns.md` (branded types, discriminated unions), `docs/agents/technical-writing.md` (Diátaxis), `docs/agents/prove-it-works.md` (verify real thing)

## Stack (ADR-0001)

React + Vite + TypeScript · Tailwind + Material 3 · oxlint + oxfmt · Zod · Drizzle ORM · Supabase (Postgres + Auth Anonymous + Edge + Storage + RLS + Cron) · Gemini Flash temp 0.3 · Noto Sans Balinese self-host · Deploy Vercel (FE) + Supabase (DB/Edge)

## Workflow

1. Ambil ticket dari GitHub Issues dengan label `ready-for-agent`, kerjakan blockers-first (`#2` DB → `#3` KB → `#4` Edge → `#5` Auth/Tree → `#6` Quiz → `#7`/`#8` parallel)
2. Tiap ticket = branch baru `feat/<nama>` (fix: `fix/<nama>`, chores: `chore/<nama>`) dari `develop` yang sync ke `origin/main`. Push langsung ke `develop`/`main` dilarang — semua via PR + review + `bun run verify` hijau (local verifier, lihat docs/agents/verifier.md) (detail: `docs/CODING_STANDARDS.md` §11)
3. Tiap ticket dikerjakan di fresh context, drive `/tdd` internally, tutup dengan `/code-review` (Standards + Spec)
4. Jangan push spec/plan sebagai file — Issues adalah tracker

```bash
bun install                    # install (1283 packages)
bun run dev                    # dev (apps/web di 5173)
bun run check                  # oxlint + oxfmt --write (wajib hijau sebelum commit)
bun run build                  # build Vite (2084 modules)
bun run db:push                # drizzle-kit push ke Supabase (butuh DATABASE_URL)
bun run db:generate            # generate migrations
```

## Secrets

Jangan commit `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY` plaintext. API key Gemini hanya di Edge Function. Pakai `.env` lokal (gitignored) dan Vercel env.

## Skills

Live skills di `.agents/skills/` & `.claude/skills/` (gitignored cache), backup di `skills/` jika ada. `skills-lock.json` & `bts.jsonc` jangan dihapus.

## Verification gate (solo, local verifier)

No GitHub Actions. The gate is `bun run verify` ([docs/agents/verifier.md](docs/agents/verifier.md), mode in [docs/agents/repo-mode.md](docs/agents/repo-mode.md)). The pre-push hook runs it on every push; run it again before `gh pr create` and paste the real output in the PR body. Never `git push --no-verify`. New worktrees: `scripts/ensure-worktree-hooks --worktree <path>`. Merge once the verifier passed at the PR head; do not wait on GitHub checks. App-driving proof: `skills/verify-caksara/`.
