#!/usr/bin/env sh
# OWNER-ONLY: jalankan dev dengan root .env (dotenvx decrypt ke memori).
# PANITIA JANGAN PAKAI script ini — panitia: unzip, bun install, bun run dev:web
# (.env VITE_* publik sudah di dalam zip; tanpa isi env lagi).
set -eu
cd "$(dirname "$0")/.."
exec bunx @dotenvx/dotenvx run -- bun run dev:web "$@"
