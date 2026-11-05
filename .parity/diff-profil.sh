#!/usr/bin/env bash
# Gate parity Profil tXwUy + League t8BaKT (opsi B, pola hasil #158).
# Profil: RMSE + fuzz5 threshold khusus + 2 same-coord probe. League:
# RMSE informatif saja (kartu di dalam halaman Profil, bukan halaman
# penuh) + 8 offset probe (+179/+35) toleransi 0. Baseline sha dipin.
# Pakai: .parity/diff-profil.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
PIN_TX="5a59657746fa8dd011c7dd816a75f1fadafe3bb68a7cab3b2cd1a033ca06e50a"
PIN_T8="b54d8002211896c2dc08030ab24ebefb7b49349a40cc98922134d565a639a333"
FAIL=0
check() {
  local name="$1" base="$2" cur="$3" pin="$4" maxrmse="$5" maxfuzz="$6" total="$7"
  if [[ ! -f "$cur" ]]; then
    echo "diff-profil: missing $cur (run: bun .parity/shoot-profil.ts 5281 && bun .parity/shoot-leaderboard.ts 5281)" >&2
    FAIL=1
    return
  fi
  local sha
  sha=$(sha256sum "$base" | cut -d' ' -f1)
  if [[ "$sha" != "$pin" ]]; then
    echo "diff-profil: BASELINE $name BERUBAH ($sha), pin $pin, tolak" >&2
    FAIL=1
    return
  fi
  local rmse fuzz5 rnorm
  rmse=$(compare -metric RMSE "$base" "$cur" ".parity/current/diff-profil-$name.png" 2>&1 || true)
  fuzz5=$(magick "$base" "$cur" -compose difference -composite -threshold 5% -format "%[fx:mean*w*h]" info:)
  echo "[$name] RMSE: $rmse | beda-nyata(5%): $fuzz5 px dari $total"
  rnorm=$(printf '%s' "$rmse" | grep -oE '\(0\.[0-9]+\)' | tr -d '()' || echo "9")
  if [[ "$rnorm" > "$maxrmse" ]]; then echo "diff-profil: [$name] RMSE $rnorm > $maxrmse" >&2; FAIL=1; fi
  if [[ "${fuzz5%.*}" -gt "$maxfuzz" ]]; then echo "diff-profil: [$name] fuzz5 $fuzz5 > $maxfuzz" >&2; FAIL=1; fi
}
check "profil" ".parity/baseline/profil/txwuy-profil.png" ".parity/current/profil.png" "$PIN_TX" "0.22" 500000 1800000
# League RMSE informatif: gate sebenarnya 8 offset probe di bawah.
if ! bun .parity/spotcheck-profil.ts; then FAIL=1; fi
if [[ "$FAIL" == "0" ]]; then echo "diff-profil: GATE LOLOS (threshold + 10 probe)"; else echo "diff-profil: GATE GAGAL" >&2; exit 1; fi
