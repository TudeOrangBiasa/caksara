# Verifier

Solo gate for this repo. Replaces GitHub Actions.

## Command

```bash
bun run verify
```

Prints `verify: all gates passed` and exits 0 when every step passes. Any red step stops the run with a nonzero exit.

## Steps (urutan = `scripts/verify.sh`)

1. `bun install --frozen-lockfile`
2. `node scripts/check-diff.js` — fail-fast: max 800 baris / 25 file kode
   reviewable vs origin/main + working tree (exclude `docs/proof/**`, `.verify/**`,
   `bun.lock`, `*.tsbuildinfo`; override `MAX_DIFF_LINES`/`MAX_DIFF_FILES`;
   lewat eksplisit `--allow-huge="alasan"`)
3. `bunx oxlint`
4. `bunx oxfmt --check`
5. `bun run check-types` (semua workspace incl. web)
6. `bun run check:loc` (max 1000 LOC/file)
7. `bun run check:secrets` (tanpa hardcoded env/Supabase URL)
8. `bun run lint:tailwind` (duplikat class; oxlint dipanggil sekali di langkah 3)
9. `bun run build`
10. `bun run verify:caksara` — Playwright guest run 3 viewport (bukti di `.verify/`, gitignored).

PR body dicek via sumber tunggal `scripts/lint-pr-body.js`, dua titik panggil:
lokal `bun run lint:pr-body -- <file-body|nomor-PR>` sebelum `gh pr create`,
dan otomatis via workflow `pr-lint.yml` (wrapper tipis, mode `--ci`).
Hard-fail: placeholder, section hilang, URL relatif. Unreachable hanya warn (offline-safe).

## Who runs it

- **pre-push hook** on every push. New worktrees: `scripts/ensure-worktree-hooks --worktree <path>`, then `--check`.
- **the agent**, again, right before `gh pr create`. Paste the real output in the PR body.
- App-driving proof beyond the gate: `skills/verify-caksara/`.

Never `git push --no-verify`. Merges trust this gate; no GitHub status check is required.
