#!/usr/bin/env bash
# Gate parity Modul Detail Gd8Af (opsi b: threshold + spot-check posisi).
# Lolos bila: RMSE <= 0.07, beda-nyata (threshold 5%) <= 50000 px,
# dan 11 probe geometri cocok persis. Baseline sha dipin.
# Pakai: .parity/diff.sh [current.png]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
BASE=".parity/baseline/modul-detail/gd8af-modul-detail.png"
CUR="${1:-.parity/current/modul-detail.png}"
OUT=".parity/current/diff.png"
PIN="5f00ac0baa25d995d091e274434fff44eea65b9462dfc9954f16c849cb96ed52"
if [[ ! -f "$CUR" ]]; then
  echo "diff: missing $CUR (run: bun .parity/shoot-modul-detail.ts <port>)" >&2
  exit 2
fi
SHA=$(sha256sum "$BASE" | cut -d' ' -f1)
if [[ "$SHA" != "$PIN" ]]; then
  echo "diff: BASELINE BERUBAH ($SHA), pin $PIN, tolak" >&2
  exit 2
fi
echo "baseline: $BASE (sha pin OK)"
echo "current : $CUR"
RMSE=$(compare -metric RMSE "$BASE" "$CUR" "$OUT" 2>&1 || true)
echo "RMSE: $RMSE"
FUZZ5=$(magick "$BASE" "$CUR" -compose difference -composite -threshold 5% -format "%[fx:mean*w*h]" info:)
echo "beda-nyata(5%): $FUZZ5 px dari 1463040"
FAIL=0
if ! bun .parity/spotcheck.ts "$CUR"; then FAIL=1; fi
# Ambang: RMSE normalized <= 0.07 (bagian dalam kurung), fuzz5 <= 50000.
RNORM=$(printf '%s' "$RMSE" | grep -oE '\(0\.[0-9]+\)' | tr -d '()' || echo "9")
if [[ "$RNORM" > "0.07" ]]; then echo "diff: RMSE $RNORM > 0.07" >&2; FAIL=1; fi
if [[ "${FUZZ5%.*}" -gt 50000 ]]; then echo "diff: fuzz5 $FUZZ5 > 50000" >&2; FAIL=1; fi
if [[ "$FAIL" == "0" ]]; then echo "diff: GATE LOLOS (threshold + 11 probe)"; else echo "diff: GATE GAGAL" >&2; exit 1; fi
