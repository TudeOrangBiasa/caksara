#!/usr/bin/env sh
# Panitia: ./scripts/start.sh  (atau: bun install && bun run start)
# dotenvx mendekripsi root .env ke memori; Vite baca apps/web/.env dari file.
set -eu
cd "$(dirname "$0")/.."
exec bunx @dotenvx/dotenvx run -- bun run dev:web
