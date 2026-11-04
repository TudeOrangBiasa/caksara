# Verifier

Solo gate for this repo. Replaces GitHub Actions.

## Command

```bash
bun run verify
```

Prints `verify: all gates passed` and exits 0 when every step passes. Any red step stops the run with a nonzero exit.

## Steps

1. `bun install --frozen-lockfile`
2. `bunx oxlint`
3. `bunx oxfmt --check`
4. `bun run build`
5. `bun run verify:caksara` — Playwright guest run at mobile 390x844, tablet
   820x1180, desktop 1440x900 (locale id-ID): splash -> Lewati -> Modul 1
   materi -> kuis (`Soal 1 / N` + `aria-valuemax`) -> KB detail, asserting
   no horizontal overflow per viewport. Self-launches `dev:web` when port
   5173 is free; evidence in `.verify/caksara/<timestamp>/` (kept, gitignored).

Guest path needs no Supabase/Gemini env (quiz falls back to the local bank,
KB reads local entries), so step 5 is deterministic headless-green.

Hook: `.husky/pre-push` (husky sets `core.hooksPath`, so every worktree shares it after `bun install`). Check with `scripts/ensure-worktree-hooks --check`.

`supabase-keepalive.yml` and `pr-lint.yml` stay: keepalive is ops, not verification.

## Who runs it

- **pre-push hook** on every push. New worktrees: `scripts/ensure-worktree-hooks --worktree <path>`, then `--check`.
- **the agent**, again, right before `gh pr create`. Paste the real output in the PR body.
- App-driving proof beyond the gate: `skills/verify-caksara/`.

Never `git push --no-verify`. Merges trust this gate; no GitHub status check is required.
