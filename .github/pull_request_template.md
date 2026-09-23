> Isi semua bagian. PR tanpa Test plan yang diisi = belum siap review (cek: pr-lint).

## What

> 1-3 kalimat: perubahan apa.

## Why

> Tiket: Closes #NN / Refs #NN. Kenapa perubahan ini perlu.

## Test plan

> Perintah yang dijalankan + hasilnya. Minimal satu baris perintah.

- [ ] `bun test <file>.test.ts` → hasil
- [ ] `bunx oxlint <file>` → 0 error
- [ ] `bun run build` → exit 0

## Screenshots

> Wajib bila menyentuh UI. Ambil dengan agent-browser (`bun run proof:ui -- <url> docs/proof/<nama-pr>`,
> lihat docs/agents/ui-proof.md). Tempel pola before/after langsung di sini, tanpa `<details>`.
> Tulis `backend-only` bila PR tidak menyentuh tampilan.

**Before** — deskripsi singkat masalah:

![before](url-gambar-before)

**After** — deskripsi singkat perbaikan:

![after](url-gambar-after)

## Risk & rollback

> Apa yang bisa rusak + cara balik.
