#!/usr/bin/env bash
# Gate parity Hasil Z8nXI/HK0rs/A8B2n (pola #156): threshold + probe geometri.
# Lolos bila per layar: RMSE <= 0.07, beda-nyata (threshold 5%) <= 50000 px,
# dan 9 probe geometri cocok. Baseline sha dipin.
# Pakai: .parity/diff-hasil.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
PIN_Z8="4706ec43aeb7803aee7a0ac5f6a4f76c0f8e66348482c2762920885595cfbb3b"
PIN_HK="6d54f003e221cf55fcae9fcf15d743624b571919f7ed08f95d95e14d0ed66932"
PIN_A8="2659ca06e197758aab00d15953eae9e8b40f9298184ff642aff77e8e8e21d5d0"
FAIL=0
check() {
  local name="$1" base="$2" cur="$3" pin="$4"
  if [[ ! -f "$cur" ]]; then
    echo "diff-hasil: missing $cur (run: bun .parity/shoot-hasil.ts 5197)" >&2
    FAIL=1
    return
  fi
  local sha
  sha=$(sha256sum "$base" | cut -d' ' -f1)
  if [[ "$sha" != "$pin" ]]; then
    echo "diff-hasil: BASELINE $name BERUBAH ($sha), pin $pin, tolak" >&2
    FAIL=1
    return
  fi
  local rmse fuzz5 rnorm
  rmse=$(compare -metric RMSE "$base" "$cur" ".parity/current/diff-hasil-$name.png" 2>&1 || true)
  fuzz5=$(magick "$base" "$cur" -compose difference -composite -threshold 5% -format "%[fx:mean*w*h]" info:)
  echo "[$name] RMSE: $rmse | beda-nyata(5%): $fuzz5 px dari 1474560"
  rnorm=$(printf '%s' "$rmse" | grep -oE '\(0\.[0-9]+\)' | tr -d '()' || echo "9")
  if [[ "$rnorm" > "0.07" ]]; then echo "diff-hasil: [$name] RMSE $rnorm > 0.07" >&2; FAIL=1; fi
  if [[ "${fuzz5%.*}" -gt 50000 ]]; then echo "diff-hasil: [$name] fuzz5 $fuzz5 > 50000" >&2; FAIL=1; fi
}
check "lulus" ".parity/baseline/hasil/Z8nXI.png" ".parity/current/hasil-lulus.png" "$PIN_Z8"
check "gagal" ".parity/baseline/hasil/HK0rs.png" ".parity/current/hasil-gagal.png" "$PIN_HK"
check "resume" ".parity/baseline/hasil/A8B2n.png" ".parity/current/hasil-resume.png" "$PIN_A8"
if ! bun .parity/spotcheck-hasil.ts; then FAIL=1; fi
if [[ "$FAIL" == "0" ]]; then echo "diff-hasil: GATE LOLOS (threshold + 9 probe)"; else echo "diff-hasil: GATE GAGAL" >&2; exit 1; fi
