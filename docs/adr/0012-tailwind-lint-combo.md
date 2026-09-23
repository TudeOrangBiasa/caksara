# ADR 0012 — Tailwind Lint Combo (@shadcn/lint + skrip lokal)

Konteks: `scripts/lint-tailwind.js` (cek duplikat class) tidak paham design
system — tidak tahu token tema, tidak tahu komponen boleh di-restyle apa.
`@shadcn/lint` (agent-first, oxlint `jsPlugins`) membaca komponen, varian,
dan tema lalu menjelaskan perbaikan pakai yang sudah ada. Keduanya dipakai
bersama: plugin untuk aturan desain, skrip untuk duplikat mekanis.

Keputusan (dikunci):

1. **Plugin terdaftar, tanpa aturan baru di luar daftar ini.** `.oxlintrc.json`
   `jsPlugins: ["@shadcn/lint"]`, `settings.shadcn.ui: "@caksara/ui/components"`.
2. **Aturan aktif (semua `warn`, bukan `error`):**
   - `shadcn/no-arbitrary-values` — nilai harus dari skala/token tema.
   - `shadcn/no-inline-styles` — larang `style={{...}}` di luar yang dibenarkan.
   - `shadcn/no-raw-colors` — warna harus token (`bg-primary`), bukan palet mentah.
   - `shadcn/no-unknown-classes` — `off` (banyak utilitas kustom; nyalakan bila tema stabil).
   - `shadcn/no-restyle` + `shadcn/require-static-classes` — `off` (belum ada kontrak komponen; lihat §4).
3. **Perintah combo:** `bun run lint:tailwind` menjalankan skrip lokal DULU lalu
   `bunx oxlint` (yang memuat aturan shadcn). Keduanya harus hijau sebelum commit.
4. **`no-restyle` terkunci `off` sampai kontrak ditulis.** Menyalakannya tanpa
   kontrak = ratusan error palsu (komponen `Button`/`Card` di-restyle di mana-mana
   secara sah). Bila mau nyalakan: tulis `contracts` per komponen di `.oxlintrc.json`
   - override `off` untuk `packages/ui/src/components/**`, ukur baseline, baru promosikan.
5. **Pengecualian intentional:** komentar `// oxlint-disable-next-line shadcn/<rule> -- alasan`
   di samping kode. `grep "oxlint-disable.*shadcn/"` menemukan semuanya.

Konsekuensi: `bun run lint:tailwind` + `bun run check` mencakup aturan desain;
PR UI yang melanggar dapat komentar perbaikan otomatis dari linter. Baseline
±300 warn (dominan arbitrary-values warisan) — turunkan bertahap, jangan big-bang.
