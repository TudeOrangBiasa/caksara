#!/usr/bin/env bash
# Gate parity Kuis #157 (pola tracer #156: threshold + spot-check posisi).
# Lolos bila: RMSE <= 0.07 dan beda-nyata (threshold 5%) <= 50000 px
# untuk tiap pasangan gated, dan 11 probe geometri cocok persis.
# Baseline sha dipin (3 file, termasuk u78 referensi feedback).
# Pakai: .parity/diff-kuis.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
PIN_U78="090a630e96357156c00ff18b2141a36b5584cbe9593d1e02708e1d8c6ed59931"
PIN_RJB="1601bc0445a11ab4bd255cd008b17073f64abc346b9c4a42edbbf85acd30cacc"
PIN_G6D="93a126d4079878efe21d93325cec2d7a3267d223ed959fbe283d1b7b4e73256f"
check_pin() {
  local file="$1" pin="$2"
  local sha
  sha=$(sha256sum "$file" | cut -d' ' -f1)
  if [[ "$sha" != "$pin" ]]; then
    echo "diff-kuis: BASELINE BERUBAH $file ($sha), pin $pin, tolak" >&2
    exit 2
  fi
}
check_pin ".parity/baseline/kuis/u78jlw-kuis.png" "$PIN_U78"
check_pin ".parity/baseline/kuis/rjbif-kuis-soal2.png" "$PIN_RJB"
check_pin ".parity/baseline/kuis/g6deu-kuis-pasangan.png" "$PIN_G6D"
echo "baseline: .parity/baseline/kuis/ (3 sha pin OK)"
FAIL=0
gate_pair() {
  local base="$1" cur="$2" out="$3"
  if [[ ! -f "$cur" ]]; then
    echo "diff-kuis: missing $cur (run: bun .parity/shoot-kuis.ts <port>)" >&2
    FAIL=1
    return
  fi
  echo "--- $cur vs $base"
  local rmse fuzz5 rnorm
  rmse=$(compare -metric RMSE "$base" "$cur" "$out" 2>&1 || true)
  echo "RMSE: $rmse"
  fuzz5=$(magick "$base" "$cur" -compose difference -composite -threshold 5% -format "%[fx:mean*w*h]" info:)
  echo "beda-nyata(5%): $fuzz5 px dari 1474560"
  rnorm=$(printf '%s' "$rmse" | grep -oE '\(0\.[0-9]+\)' | tr -d '()' || echo "9")
  if [[ "$rnorm" > "0.07" ]]; then echo "diff-kuis: RMSE $rnorm > 0.07" >&2; FAIL=1; fi
  if [[ "${fuzz5%.*}" -gt 50000 ]]; then echo "diff-kuis: fuzz5 $fuzz5 > 50000" >&2; FAIL=1; fi
}
gate_pair ".parity/baseline/kuis/rjbif-kuis-soal2.png" ".parity/current/kuis-soal1.png" ".parity/current/diff-kuis-soal.png"
gate_pair ".parity/baseline/kuis/g6deu-kuis-pasangan.png" ".parity/current/kuis-soal2.png" ".parity/current/diff-kuis-match.png"
if ! bun .parity/spotcheck-kuis.ts; then FAIL=1; fi
if [[ "$FAIL" == "0" ]]; then echo "diff-kuis: GATE LOLOS (threshold + 11 probe)"; else echo "diff-kuis: GATE GAGAL" >&2; exit 1; fi
