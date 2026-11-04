#!/usr/bin/env bash
# Formal gate runner: verify.sh + secrets + caller-supplied invariant pins.
# Usage: verify-formal.sh --require 'pattern' [--require 'pattern'...]
#        [--forbid 'pattern' [--in 'glob-dir']...] [--name pr-slug]
# Pins use rg -F (fixed strings, no regex). Exit 0 prints VERIFIED, else NOT VERIFIED.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

requires=()
forbids=()
name="formal"
scan_roots=(apps packages supabase scripts)

usage() {
  echo "usage: verify-formal.sh --require 'fixed-string' [--forbid 'fixed-string'] [--name slug]" >&2
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --require) [ $# -ge 2 ] || usage; requires+=("$2"); shift 2 ;;
    --forbid) [ $# -ge 2 ] || usage; forbids+=("$2"); shift 2 ;;
    --name) [ $# -ge 2 ] || usage; name="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "unknown arg: $1" >&2; usage ;;
  esac
done
[ "${#requires[@]}" -gt 0 ] || { echo "need at least one --require pin" >&2; usage; }

step() { printf '\n==> %s\n' "$1"; }
fail() { printf '\nformal-verify: NOT VERIFIED (%s)\n' "$1"; exit 1; }

step "verify.sh"; bash scripts/verify.sh
step "check:secrets"; bun run check:secrets

step "invariant pins (${#requires[@]} require, ${#forbids[@]} forbid)"
for pin in "${requires[@]}"; do
  if rg -F -q -- "$pin" "${scan_roots[@]}"; then
    printf '  require ok: %s\n' "$pin"
  else
    fail "pin missing: $pin"
  fi
done
for pin in "${forbids[@]}"; do
  if rg -F -q -- "$pin" "${scan_roots[@]}"; then
    printf '  forbid hit: %s\n' "$pin"
    rg -F --line-number -- "$pin" "${scan_roots[@]}" | head -5
    fail "forbidden string present: $pin"
  else
    printf '  forbid ok (absent): %s\n' "$pin"
  fi
done

dir=".verify/${name}/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$dir"
{
  echo "verdict: VERIFIED"
  echo "requires:"
  printf '  - %s\n' "${requires[@]}"
  echo "forbids:"
  printf '  - %s\n' "${forbids[@]}"
} > "$dir/formal.json"
printf 'evidence: %s/\n' "$dir"
printf '\nformal-verify: VERIFIED\n'
