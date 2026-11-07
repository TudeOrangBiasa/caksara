#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
step() { printf '\n==> %s\n' "$1"; }
step "bun install (frozen lockfile)"; bun install --frozen-lockfile
step "check-diff"; node scripts/check-diff.js
step "oxlint"; bunx oxlint
step "oxfmt --check"; bunx oxfmt --check
step "check-types"; bun run check-types
step "check:loc"; bun run check:loc
step "check:secrets"; bun run check:secrets
step "lint:tailwind"; bun run lint:tailwind
step "build"; bun run build
step "verify:caksara (Playwright 3 viewport)"; bun run verify:caksara
printf '\nverify: all gates passed\n'
