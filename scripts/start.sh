#!/usr/bin/env sh
# Owner/developer only: jalankan dev dengan root .env (dotenvx decrypt ke memori).
# Panitia TIDAK pakai ini — panitia jalan mode lokal via: bun run dev:web
set -eu
cd "$(dirname "$0")/.."
exec bunx @dotenvx/dotenvx run -- bun run dev:web "$@"
