#!/usr/bin/env sh
# Pack zip panitia yang 100% BERSIH dari secret: git archive + exclude meta-docs/dev-only.
# TIDAK menyertakan .env / .env.keys / apps/web/.env dalam bentuk apapun.
# Panitia jalan mode lokal penuh tanpa env (getSupabase→null + localStorage).
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

# Sabuk pengaman: tak ada nilai secret dalam bentuk apapun di staging.
# (Kecualikan script ini + *.md: keduanya memang menyebut NAMA POLA sebagai dokumentasi.)
HITS="$(grep -rIlE --exclude='pack-panitia.sh' --exclude='*.md' 'sb_secret|postgres://postgres:|AIza[0-9A-Za-z_-]{20,}|encrypted:eyJ' "$STAGE" 2>/dev/null || true)"
if [ -n "$HITS" ]; then
  echo "ABORT: pola secret terdeteksi di staging:" >&2
  echo "$HITS" >&2
  exit 1
fi

rm -f "$OUT"
(cd "$STAGE" && zip -qr "$OUT" .)
echo "OK: $OUT (ref $REF)"
unzip -l "$OUT" | head -40
