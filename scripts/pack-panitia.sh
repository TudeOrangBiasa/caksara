#!/usr/bin/env sh
# Pack zip panitia: git archive + exclude meta-docs/dev-only + apps/web/.env (VITE_* publik).
# Root .env / .env.keys (DATABASE_URL, GEMINI_API_KEY, PRIVATE_KEY, ...) TAK PERNAH ikut.
# apps/web/.env (gitignored) DISENGAJA ikut: hanya 2 var VITE_* publik by design
# (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY, opsional VITE_SERVER_URL)
# agar panitia jalan out-of-box (online ke project owner) tanpa isi env.
# VITE_* ikut terkirim di JS bundle ke setiap pengunjung; aman karena RLS per auth.uid().
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
# Sabuk ganda: root .env tak pernah ikut walau git archive sudah mengecualikan ignored.
rm -f "$STAGE/.env" "$STAGE/.env.keys"

# apps/web/.env gitignored → copy EKSPLISIT (git archive tak menyertakan ignored files).
# Disengaja: VITE_* publik by design. Validasi ketat di bawah sebelum zip.
if [ -f "$ROOT/apps/web/.env" ]; then
  mkdir -p "$STAGE/apps/web"
  cp "$ROOT/apps/web/.env" "$STAGE/apps/web/.env"
  # Validasi 1: hanya var yang diizinkan (nama var saja yang dilaporkan).
  ALLOWED='^VITE_SUPABASE_URL=|^VITE_SUPABASE_PUBLISHABLE_KEY=|^VITE_SERVER_URL='
  BADKEYS="$(grep -vE '^[[:space:]]*(#|$)' "$STAGE/apps/web/.env" | grep -vE "$ALLOWED" || true)"
  if [ -n "$BADKEYS" ]; then
    echo "ABORT: apps/web/.env berisi var tak diizinkan (hanya VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SERVER_URL):" >&2
    printf '%s\n' "$BADKEYS" | cut -d= -f1 >&2
    exit 1
  fi
  # Validasi 2: pola secret tak boleh ada di file itu (nama pola saja, tanpa nilai).
  if grep -qE 'sb_secret|postgres://|AIza|GEMINI|SERVICE_ROLE|PRIVATE_KEY|DATABASE_URL' "$STAGE/apps/web/.env"; then
    echo "ABORT: pola secret terdeteksi di apps/web/.env:" >&2
    grep -oE 'sb_secret|postgres://|AIza|GEMINI|SERVICE_ROLE|PRIVATE_KEY|DATABASE_URL' "$STAGE/apps/web/.env" | sort -u >&2
    exit 1
  fi
else
  echo "ABORT: $ROOT/apps/web/.env tak ada — zip butuh backend panitia (mode out-of-box)." >&2
  echo "Cara buat: cp apps/web/.env.example apps/web/.env lalu isi 2 var VITE_* publik." >&2
  exit 1
fi

# Verifikasi ref project: VITE_SUPABASE_URL host harus ref panitia.
# Default ABORT bila beda/kosong; override eksplisit via PANITIA_REF=<ref-lain> untuk testing.
# Laporkan ref-nya saja, bukan nilai URL.
EXPECTED_REF="${PANITIA_REF:-ntjslqbqyfjridotjaac}"
ENVREF="$(sed -nE 's/^[[:space:]]*VITE_SUPABASE_URL=[^/]*\/\/([A-Za-z0-9-]+).*/\1/p' "$STAGE/apps/web/.env" | head -1)"
if [ -n "${PANITIA_REF:-}" ]; then
  if [ "$ENVREF" != "$EXPECTED_REF" ]; then
    echo "WARN: VITE_SUPABASE_URL ref (${ENVREF:-kosong}) beda dari PANITIA_REF ($EXPECTED_REF)" >&2
  fi
elif [ -z "$ENVREF" ] || [ "$ENVREF" != "$EXPECTED_REF" ]; then
  echo "ABORT: VITE_SUPABASE_URL ref (${ENVREF:-kosong}) beda dari ekspektasi ($EXPECTED_REF)" >&2
  echo "Cara override (testing): PANITIA_REF=<ref-lain> $0 $REF $OUT" >&2
  exit 1
fi

# Sabuk pengaman global: tak ada NILAI secret dalam bentuk apapun di staging.
# Pola = pola NILAI (sb_secret_…, conn-string postgres berisi kredensial,
# Google AI key, blob terenkripsi dotenvx). Referensi NAMA var di kode
# (process.env.DATABASE_URL, Deno.env.get("GEMINI_API_KEY"), placeholder
# [YOUR-PASSWORD] di .env.example) BUKAN secret — wajar ada di source.
# (Kecualikan script ini + *.md: keduanya memang menyebut NAMA POLA sebagai dokumentasi.)
# (Kecualikan staging apps/web/.env: isinya VITE_* publik yang disengaja + sudah
# divalidasi ketat di atas. Pola sb_publishable_ SENGAJA tak digrep — publik by design.)
HITS="$(grep -rIlE --exclude='pack-panitia.sh' --exclude='*.md' 'sb_secret|postgres://postgres:|AIza[0-9A-Za-z_-]{20,}|encrypted:eyJ' "$STAGE" 2>/dev/null | grep -v 'apps/web/\.env$' || true)"
if [ -n "$HITS" ]; then
  echo "ABORT: pola secret terdeteksi di staging:" >&2
  echo "$HITS" >&2
  exit 1
fi

rm -f "$OUT"
(cd "$STAGE" && zip -qr "$OUT" .)
echo "OK: $OUT (ref $REF)"
unzip -l "$OUT" | head -40
