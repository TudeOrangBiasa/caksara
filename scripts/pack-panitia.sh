#!/usr/bin/env sh
# Pack zip panitia yang out-of-box: git archive + file gitignored + dotenvx encrypt.
# Pakai: ./scripts/pack-panitia.sh [ref-git] [output-zip]
# Default: HEAD -> /tmp/panitia-caksara.zip. Staging di /tmp/panitia-stage (di luar repo).
# Repo TIDAK dihapus/diubah oleh script ini (exclude = hapus dari staging saja).
set -eu

REF="${1:-HEAD}"
OUT="${2:-/tmp/panitia-caksara.zip}"
STAGE="${PANITIA_STAGE:-/tmp/panitia-stage}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

command -v git >/dev/null || { echo "butuh git" >&2; exit 1; }
command -v zip >/dev/null || { echo "butuh zip" >&2; exit 1; }
test -f "$ROOT/.env" || { echo "root .env tidak ada" >&2; exit 1; }
test -f "$ROOT/apps/web/.env" || { echo "apps/web/.env tidak ada" >&2; exit 1; }

rm -rf "$STAGE"
mkdir -p "$STAGE"
git -C "$ROOT" archive "$REF" | tar -x -C "$STAGE"

# Exclude dari ZIP (meta-docs & dev-only). Repo tetap utuh — ini hanya staging.
rm -rf \
  "$STAGE/AGENTS.md" "$STAGE/CLAUDE.md" "$STAGE/CONTEXT.md" "$STAGE/DESIGN.md" \
  "$STAGE/docs" "$STAGE/.agents" "$STAGE/.claude" "$STAGE/.omp" \
  "$STAGE/skills-lock.json" "$STAGE/bts.jsonc" "$STAGE/.github" "$STAGE/.husky" \
  "$STAGE/.lintstagedrc.json" "$STAGE/.oxlintrc.json" "$STAGE/.oxfmtrc.json" \
  "$STAGE/.env.local" "$STAGE/.env.keys" "$STAGE/.vercel" "$STAGE/supabase/.temp" \
  "$STAGE/assets" "$STAGE/node_modules" "$STAGE/dist" "$STAGE/.scratch" \
  "$STAGE/scripts/proof-ui.ts" "$STAGE/scripts/lint-tailwind.js" "$STAGE/scripts/check-loc.js"
rm -f "$STAGE"/*.log "$STAGE/apps/web/.env.local"

# File gitignored yang dibutuhkan runtime.
cp "$ROOT/.env" "$STAGE/.env"
mkdir -p "$STAGE/apps/web"
cp "$ROOT/apps/web/.env" "$STAGE/apps/web/.env"

# Enkripsi root .env DI STAGING. .env.keys ikut ke zip agar out-of-box.
# (Key dibuat di staging, bukan di repo root, agar tak sengaja ter-commit.)
(cd "$STAGE" && bunx @dotenvx/dotenvx encrypt -f .env)
test -f "$STAGE/.env.keys" || { echo "enkripsi gagal: .env.keys tak terbentuk" >&2; exit 1; }

rm -f "$OUT"
(cd "$STAGE" && zip -qr "$OUT" .)
echo "OK: $OUT (ref $REF)"
unzip -l "$OUT" | head -40
