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

Issue #83 extends this gate with a Playwright verifier: a guest plays the quiz at 3 viewports (mobile, tablet, desktop) with screenshots as evidence.

Hook: `.husky/pre-push` (husky sets `core.hooksPath`, so every worktree shares it after `bun install`). Check with `scripts/ensure-worktree-hooks --check`.

`supabase-keepalive.yml` and `pr-lint.yml` stay: keepalive is ops, not verification.

## Who runs it

- **pre-push hook** on every push. New worktrees: `scripts/ensure-worktree-hooks --worktree <path>`, then `--check`.
- **the agent**, again, right before `gh pr create`. Paste the real output in the PR body.
- App-driving proof beyond the gate: `skills/verify-caksara/`.

Never `git push --no-verify`. Merges trust this gate; no GitHub status check is required.
