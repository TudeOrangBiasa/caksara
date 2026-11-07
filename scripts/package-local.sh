#!/usr/bin/env bash
# Sandbox builder lokal CAKSARA — bukan CI.
# Aturan: desktop/APK hanya dibangun bila website sudah matang, dibuktikan
# `bun run verify:caksara` hijau di mesin ini tepat sebelum packaging.
# Keluaran: apps/desktop/release/* + caksara.apk lokal (gitignored),
# lalu cetak sha256 untuk verifikasi manual sebelum unggah ke Releases.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

step() { printf '\n==> %s\n' "$1"; }

step "gate website matang (verify:caksara)"
bun run verify:caksara

step "build web SPA untuk shell"
bun run desktop:web

step "build shell desktop (tsc)"
bun run desktop:build

step "paket AppImage + nsis .exe (electron-builder, tanpa publish)"
(
  cd apps/desktop
  bunx electron-builder --linux --win --publish never
)

step "sha256 artefak desktop"
sha256sum apps/desktop/release/CAKSARA-*.AppImage apps/desktop/release/CAKSARA-*.exe

cat <<'EOF'

APK Android: butuh JDK 17 + Android SDK (lihat docs/android-capacitor.md).
  bun run build && bunx cap sync && bunx cap open android
  lalu Generate APK di Android Studio → salin sebagai caksara.apk → sha256sum.
Unggah ketiga berkas ke GitHub Releases (tag v*) secara manual;
tombol Unduh menunjuk ke releases/latest.
EOF
