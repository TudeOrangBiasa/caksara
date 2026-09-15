# Spec: Minimal Premium — Depth + Hierarki (2026-09-08)

## Masalah

Seluruh aplikasi terasa "terlalu polos": kartu flat, ruang kosong tanpa struktur,
hierarki judul lemah. Arah yang disetujui: minimal premium (tetap minimal, naik
kelas via depth + hierarki). Bukan playful, bukan gradien norak, tanpa warna baru.

## Non-tujuan

- Tidak ada warna/gradien baru (taste-lock + reviewer tetap berlaku).
- Tidak ada perubahan alur/fitur, hanya presentasi.
- Tekstur hanya di kartu hero oranye (momen brand), dilarang di tempat lain.

## Desain

### 1. Token depth (globals.css + tokens.ts)

- `:root` / `.dark`: `--shadow-sm`, `--shadow-md`, `--shadow-lg` hue coklat warm
  (light: `oklch(0.35 0.05 38 / …)` 8/12/18%; dark: `oklch(0 0 0 / …)` 30/40/55%),
  plus `--highlight`: `inset 0 1px 0 oklch(1 0 0 / 55%)` (light) /
  `inset 0 1px 0 oklch(1 0 0 / 8%)` (dark).
- Mapping `@theme inline`: `--shadow-*` agar jadi utility `shadow-sm/md/lg`.
  Sebelumnya audit pemakaian `shadow-*` existing (Tailwind default ikut ke-override).
- Aturan pakai: kartu standar → `shadow-sm`; kartu hero + nav mengambang → `md/lg`;
  tombol tetap flat + `active:scale`. Nilai shadow bukan `oklch(...)` murni sehingga
  TIDAK masuk `tokenSchema` (regex oklch) — pakai `depthTokenSchema` terpisah
  (`z.string` + describe) + mirror CSS. `tokenSchema` 19 field tidak berubah.
- Verifikasi: 0 error check; tidak ada shift layout (shadow tidak ubah box).

### 2. Tipografi & ritme (bulk pass komponen)

- Judul halaman: `text-[28px] md:text-[32px] font-extrabold tracking-tight`.
- Tiap seksi: eyebrow 11px uppercase (`text-[11px] font-semibold uppercase
tracking-widest text-muted-foreground`) + divider `border-t border-border/60`.
- Ritme: seksi `space-y-6`, padding hero `p-6`, kartu standar tetap `p-4/5`.
- File tersentuh: dashboard, belajar (tree), guru, KB list/detail, profil,
  pengaturan, hasil kuis, landing. Tidak ada perubahan logika.

### 3. Tekstur hero (satu file util)

- Pola songket SVG data-uri opacity 4% sebagai overlay `::before` khusus
  `.hero-texture` (dipakai kartu hero oranye saja). Kontras teks tidak turun
  (teks di atas primary tidak berubah).
- Bila reviewer menolak: hapus class tanpa sisa (satu titik).

### 4. Counter animasi (hook baru)

- `useCountUp(target)` + komponen `AnimatedNumber`: XP/streak/hati di dashboard
  - profil + hasil kuis. `prefers-reduced-motion` → angka final langsung.
    Durasi 600ms ease-out. Tidak menyentuh store.

## Verifikasi

- `bun run check` 0 error, `bun run build` ✓, server 200.
- Screenshot DOM per halaman (375 + 1280, dark + light): tidak ada teks hilang,
  tidak ada layout shift, shadow tampil (cek visual oleh user — model buta gambar).
- Rollback per bagian independen (token / bulk / tekstur / counter).

## Risiko

- Shadow di dark mode bisa terlihat kotor → opacity di-tune via screenshot user.
- Tekstur bisa ditolak reviewer → titik hapus tunggal disiapkan.
