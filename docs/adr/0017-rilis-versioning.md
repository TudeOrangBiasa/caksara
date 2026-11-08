# ADR 0017 — Rilis Versioning vX.Y.Z + Pin Tombol Unduh

Konteks: repo punya satu tag `v1.0-submission` (arsip lomba, nol rilis GitHub per `gh release list` 2026-11-08), versi paket tercerai (desktop `0.1.0`, ui/env/config `0.0.0`, web tanpa versi), dan ketiga tombol Unduh menunjuk ke `releases/latest` yang hari ini kosong. Tanpa aturan, tiap rilis menebak angka dan tombol berisiko melanggar Rule 1 CTA jujur (AGENTS.md).

Keputusan:

1. **Skema `vX.Y.Z` semver murni.** PATCH untuk perbaikan tanpa ubah perilaku unduh, MINOR untuk fitur baru (modul baru, tipe soal baru, shell baru), MAJOR untuk perubahan pemutus (format profil tersimpan, skema DB, protocol OAuth). Tanpa sufiks kecuali pre-release yang disengaja.
2. **Rilis perdana `v1.0.0`.** Tag `v1.0-submission` tetap sebagai arsip lomba di luar skema ini: tidak dipakai ulang, tidak digerakkan, tidak dihapus.
3. **Sumber versi tunggal.** `apps/desktop/package.json` menentukan nama artefak Electron (`CAKSARA-*-win-x64.exe`, `CAKSARA-*.AppImage` ikut versi electron-builder). `versionName`/`versionCode` APK disinkron manual saat `bunx cap sync` karena `android/` gitignored. Web tidak punya versi sendiri: yang diunduh hanya shell.
4. **Aturan pin tombol (Rule 1 CTA jujur).** Minimal: tiap kartu Unduh menunjuk ke `releases/tag/vX.Y.Z`, bukan `latest` (konstanta `RELEASE_LATEST` di `unduh-data.ts` diganti per rilis). Penuh (menyusul setelah pola nama file dikunci): tiap kartu link langsung ke asetnya. Kosong: selama nol rilis, tombol nonaktif plus tulisan "segera hadir".
5. **Prosedur potong rilis.** Bekukan `develop` ke branch `release/vX.Y.Z`, bangun dari sana (`bun run package:local` + APK via Android Studio), verifikasi, tag, unggah 3 aset (nama berversi), update konstanta pin tombol.

Konsekuensi: tiap rilis = 1 tag + 1 branch + 3 aset + 1 baris konstanta. Tag submission tidak ikut aturan naik-turun versi produk.
