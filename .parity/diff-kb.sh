#!/usr/bin/env bash
# Gate parity KB + onboarding + beranda (#160, keputusan Main: opsi A).
# Threshold khusus per layar (lantai tak-tereduksi diakui, SSOT menang):
# - onboarding (5 frame 1440x1027): RMSE <= 0.12, fuzz5 <= 100000
# - kb-list (1440x1318, jahitan top+bot): RMSE <= 0.11, fuzz5 <= 235000
# - landing per seksi (crop tengah baseline ke ukuran shot elemen):
#   hero RMSE<=0.26 fuzz5<=160000; pendekatan RMSE<=0.14 fuzz5<=115000;
#   zigzag RMSE<=0.20 fuzz5<=205000; testimoni RMSE<=0.20 fuzz5<=205000;
#   faq RMSE<=0.16 fuzz5<=70000; cta-footer RMSE<=0.21 fuzz5<=120000
# Plus: 9 probe geometri spotcheck-kb.ts cocok persis, sha baseline dipin.
# Pakai: .parity/diff-kb.sh (setelah: bun .parity/shoot-kb.ts <port>)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
B=".parity/baseline/kb"
C=".parity/current/kb"
FAIL=0

declare -A PIN=(
  [kb-list]=c1b4be49b2d23d1ced8dbd8bff49d7a70b803fa88ccf39015e9659532bd36a64
  [landing-cta-footer]=aeecda6cf076fb87ab8ae7ba518962abfad103695ccd5349e099d98c990609d3
  [landing-faq]=9ce47b3e9a86c2059096386bbc21f9d3798d1fc93719f25aff1938e7f5a3304d
  [landing-full]=96b57e8eefa69b6935f5c20144ef954cd2221198a82678152c9355235e069d00
  [landing-hero]=e63a693a3d4c46ccf232368818d23943e3ef3c89a14fae8e2c71b5584cb882fd
  [landing-pendekatan]=4922d837906b36ec5391d07ae29bd4194b38ee566d186146ac025ef153c87b4b
  [landing-testimoni]=a18f68a902659ff1cecf0de7b3373abd98b6241cd8f93d09ae4286dda3dc2e1f
  [landing-zigzag]=42df134f8a655f4aca4da18b288e561245fb707a20b1128c54cbcf7f51687955
  [onboarding-alasan]=15b276ecfc86d37876ab0d933e97a333c816795cd01ce6c4da0e36d5257b3384
  [onboarding-komitmen]=12b1fdf94445d8c492a744c2df8908dab29e455cb07471c988f64a90411f95bc
  [onboarding-level]=98a8fc3d2c008bab51f44750ecfbd728ba9db5481a0c6f36862952a37cf80db8
  [onboarding-nama]=8484b8d9fd2460cd477f8528ff21d6456ea6ed8ad368178f3efff68a1bc5c7ef
  [onboarding-sukses]=d340653c868a42339192be95741274966be4644aab7aa83f1e3a6071dc749257
)
for k in "${!PIN[@]}"; do
  SHA=$(sha256sum "$B/$k.png" | cut -d' ' -f1)
  if [[ "$SHA" != "${PIN[$k]}" ]]; then
    echo "diff-kb: BASELINE $k BERUBAH ($SHA), tolak" >&2
    exit 2
  fi
done
echo "baseline: 13 sha pin OK"

check() { # name base cur maxrmse maxfuzz
  local name="$1" base="$2" cur="$3" maxrmse="$4" maxfuzz="$5"
  if [[ ! -f "$cur" ]]; then echo "diff-kb: missing $cur" >&2; FAIL=1; return; fi
  local RMSE FUZZ5 RNORM
  RMSE=$(compare -metric RMSE "$base" "$cur" null: 2>&1 || true)
  FUZZ5=$(magick "$base" "$cur" -compose difference -composite -threshold 5% -format "%[fx:mean*w*h]" info:)
  RNORM=$(printf '%s' "$RMSE" | grep -oE '\(0\.[0-9]+\)' | tr -d '()' || echo "9")
  echo "$name: RMSE=$RNORM fuzz5=${FUZZ5%.*}"
  if awk "BEGIN{exit !($RNORM > $maxrmse)}"; then echo "diff-kb: $name RMSE $RNORM > $maxrmse" >&2; FAIL=1; fi
  if [[ "${FUZZ5%.*}" -gt "$maxfuzz" ]]; then echo "diff-kb: $name fuzz5 $FUZZ5 > $maxfuzz" >&2; FAIL=1; fi
}

check "ob-alasan" "$B/onboarding-alasan.png" "$C/onboarding-step0.png" 0.12 100000
check "ob-level" "$B/onboarding-level.png" "$C/onboarding-step1.png" 0.12 100000
check "ob-komitmen" "$B/onboarding-komitmen.png" "$C/onboarding-step2.png" 0.12 100000
check "ob-nama" "$B/onboarding-nama.png" "$C/onboarding-step3.png" 0.12 100000
check "ob-sukses" "$B/onboarding-sukses.png" "$C/onboarding-ready.png" 0.12 100000

# KB list: jahit top (1027) + ekor bot (459) lalu crop 1318.
magick "$C/kb-list-bot.png" -crop 1440x459+0+503 +repage /tmp/kbl-tail.png
magick "$C/kb-list-top.png" /tmp/kbl-tail.png -append "$C/kb-list.png"
magick "$C/kb-list.png" -crop 1440x1318+0+0 +repage /tmp/kbl-cur-1318.png
check "kb-list" "$B/kb-list.png" /tmp/kbl-cur-1318.png 0.11 235000

# Landing: crop tengah baseline ke ukuran shot elemen masing-masing.
for s in hero pendekatan zigzag testimoni faq cta-footer; do
  case "$s" in
    hero) MR=0.26; MF=160000 ;;
    pendekatan) MR=0.14; MF=115000 ;;
    zigzag) MR=0.20; MF=205000 ;;
    testimoni) MR=0.20; MF=205000 ;;
    faq) MR=0.16; MF=70000 ;;
    cta-footer) MR=0.21; MF=120000 ;;
  esac
  CW=$(identify -format "%w" "$C/landing-$s.png")
  CH=$(identify -format "%h" "$C/landing-$s.png")
  X=$(( (1440 - CW) / 2 ))
  magick "$B/landing-$s.png" -crop "${CW}x${CH}+${X}+0" +repage "/tmp/land-$s-base.png"
  check "landing-$s" "/tmp/land-$s-base.png" "$C/landing-$s.png" "$MR" "$MF"
done

if ! bun .parity/spotcheck-kb.ts; then FAIL=1; fi
if [[ "$FAIL" == "0" ]]; then echo "diff-kb: GATE LOLOS (threshold khusus opsi A + 9 probe)"; else echo "diff-kb: GATE GAGAL" >&2; exit 1; fi
