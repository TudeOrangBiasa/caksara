# ADR 0012 — Tailwind Lint Combo (@shadcn/lint + skrip lokal)

Konteks: `scripts/lint-tailwind.js` (cek duplikat class) tidak paham design
system — tidak tahu token tema, tidak tahu komponen boleh di-restyle apa.
`@shadcn/lint` (agent-first, oxlint `jsPlugins`) membaca komponen, varian,
dan tema lalu menjelaskan perbaikan pakai yang sudah ada. Keduanya dipakai
bersama: plugin untuk aturan desain, skrip untuk duplikat mekanis.

Keputusan (dikunci 2026-09-23, review ulang 2026-10-23):

1. **Plugin terdaftar.** `.oxlintrc.json` `jsPlugins: ["@shadcn/lint"]`,
   `settings.shadcn.ui: "@caksara/ui/components"`.
2. **Enam aturan aktif, semua `warn` (baseline 2026-09-23: 356):**
   - `shadcn/no-arbitrary-values` (234) — nilai harus dari skala/token tema.
   - `shadcn/no-raw-colors` (42) — warna harus token (`bg-primary`), bukan palet mentah.
   - `shadcn/no-restyle` (40) — `allow: ["layout"]`; sisanya pakai varian/size komponen.
   - `shadcn/no-inline-styles` (27) — larang `style={{...}}` di luar yang dibenarkan.
   - `shadcn/no-unknown-classes` (13) — mayoritas `cn-*` di `packages/ui` (prefix internal cuelume, bukan Tailwind); allow-list atau rename bila disentuh.
   - `shadcn/require-static-classes` (0) — jaga-jaga kelas dinamis tak terbaca.
3. **Perintah combo:** `bun run lint:tailwind` = skrip lokal (duplikat class) + `bunx oxlint`
   (aturan shadcn). Keduanya harus hijau (warn ditoleransi, error tidak) sebelum commit.
4. **Override komponen:** `packages/ui/src/components/**` off untuk
   restyle/arbitrary/require-static — komponen boleh menata dirinya sendiri.
5. **Pengecualian intentional:** komentar `// oxlint-disable-next-line shadcn/<rule> -- alasan`
   di samping kode. `grep "oxlint-disable.*shadcn/"` menemukan semuanya.
6. **Promosi ke error** hanya setelah baseline per aturan = 0. Jangan big-bang.
