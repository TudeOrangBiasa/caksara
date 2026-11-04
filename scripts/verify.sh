#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
step() { printf '\n==> %s\n' "$1"; }
step "bun install (frozen lockfile)"; bun install --frozen-lockfile
step "oxlint"; bunx oxlint
step "oxfmt --check"; bunx oxfmt --check
step "build"; bun run build
printf '\nverify: all gates passed\n'
