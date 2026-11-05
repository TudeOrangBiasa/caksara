# Parity tracer: Modul Detail (Pencil Gd8Af)

Satu halaman: Detail Modul 1 + verifikasi tidak ada nav di view ini
(overlay by design; Pencil Gd8Af juga tanpa header).

## Baseline

- File: `.parity/baseline/modul-detail/gd8af-modul-detail.png`
- Sumber: frame `Gd8Af` ("Modul Detail - CAKSARA") dari
  `/home/todayz/Downloads/Caksara/Caksara.pen` (pen.dev 2.21)
- Metode ekspor: `Export(['Gd8Af'], 'png', out, {scale: 1})` via tool
  Pencil `execute` (render internal Pencil, bukan screenshot manual,
  bukan zip/ekstrak). Paling setia piksel: 1 unit kanvas = 1 px.
- Resolusi: 1440 x 1016, sRGB, scale 1
- Viewport implementasi: 1440 x 1016, deviceScaleFactor 1, locale id-ID,
  tema light (paksa via localStorage `vite-ui-theme`, karena default app
  adalah dark dan Pencil light-only)
- SHA256: `5f00ac0baa25d995d091e274434fff44eea65b9462dfc9954f16c849cb96ed52`
- Baseline TIDAK BOLEH diedit agar diff lolos (anti-shortcut). Verifikasi
  sha sebelum klaim angka: `sha256sum .parity/baseline/...`.

## Cara jalan

```bash
# 1. Dev server di port bebas (jangan sentuh milik orang)
# 2. Screenshot implementasi (Playwright, deterministik, animasi dimatikan)
bun .parity/shoot-modul-detail.ts 5195
# 3. Gate diff (threshold + spot-check posisi)
.parity/diff.sh
```

Nol piksel absolut tidak kompatibel dengan ADR-0015 (nilai token SSOT
disengaja berbeda dari Pencil demi kontras AA + dark mode) dan dengan
data produksi yang benar (`jumlahSoal: 3`, Pencil menulis 8). Keputusan
Main: threshold terukur + daftar deviasi tercatat.

`.parity/diff.sh` lolos bila SEMUA terpenuhi:

1. RMSE (ImageMagick, fuzz 0) <= 0.07
2. Beda nyata (difference threshold 5%) <= 50.000 px (3,42%)
3. Spot-check posisi (`bun .parity/spotcheck.ts`): 11 probe batas
   geometri cocok persis (toleransi 0): heroL, row1top, row1bot,
   rowL, rowR, cardB, ctaAbove, ctaFull, badge, pill1, sideB

Angka final tracer ini: RMSE 0,0581; beda-nyata 44.370 px (3,03%);
10/10 probe cocok. Baseline awal (sebelum tracer): RMSE 0,134;
compare-AE-fuzz5 47.706 -> 9.188 (-81%).

## Known deviations (disengaja, tidak diperbaiki)

1. Latar: app putih `#fff` vs Pencil `$bg #FFFCF6` (ADR-0015 no 12:
   degradasi ke putih disengaja). Penyumbang exact-diff terbesar,
   tak kasatmata, tertutup fuzz 5%.
2. Overlay hero: `primary` SSOT vs `#B4622D` (ADR-0015 no 1).
   Struktur disamakan (2-stop, area konten saja, bukan inset-0).
3. Border kartu/rows: `border` SSOT vs `#E5E5E5` (ADR-0015 no 7,
   "tak kasatmata"). Ketebalan disamakan (2/2/4/2 via border +
   shadow presisi, warna tetap token).
4. Teks ink: `foreground` vs `#242424` (no 5); label `#777` vs
   `muted-foreground` (no 6); backlink `#AFAFAF` vs muted (no 6).
5. Pills: `muted` vs `$muted-bg #F6F1E8` (no 12-terkait, `$muted-bg`
   -> `--muted`); dot `primary/10` vs `$primary-soft` (no 8).
6. CTA: `cta/ctaEdge` oklch vs `#2F7D00/#1F5C00` (no 2-3: existing
   dipilih via uji kontras; Pencil FAIL). Struktur sama (pill,
   y+4 no-blur, padding 16).
7. KONTEN 1 glyph: Pencil "8 Pertanyaan Kuis" vs app "3 Pertanyaan
   Kuis". Data produksi benar: `SESSION_COUNT = 3`
   (`quiz-data.ts:328`), `jumlahSoal: 3` semua modul; sesi modul
   nyata 3 soal (8 hanya latihan campuran `buildMixedQuiz`).
   Pencil stale. Tidak diubah (keputusan Main).
8. Font: "Inter Variable" (app) vs Inter (Pencil). Glyph bisa beda
   <= 1 px (terukur: label, title, backlink). Tidak bisa disamakan
   tanpa ganti font app.
9. Resampling foto hero: Pencil export vs Chromium `object-cover`
   dari JPEG byte-identik. Terukur: region foto murni (80 baris
   atas) hampir identik; sisa noise sub-ambang.
10. Ikon Timer/list-checks: lucide-react vs ikon Pencil (library
    sama, path bisa beda revisi tipis).

## Yang disamakan tracer ini (struktural, token-safe)

- Side card: hapus `lg:sticky lg:top-24` (Pencil statis, posisi y 20)
- Hero overlay: full-cover 3-stop -> 2-stop area konten (`from-primary`
  tanpa `to-`, Tailwind v4 memudar ke primary/0)
- Hero teks: gap seragam 8 (hapus mb-1/mt-1.5 di desktop via lg:),
  tracking 1.2px kicker / 1.1px label
- Badge: hapus shadow-inner + backdrop-blur
- Ikon estimasi: Clock -> Timer (Pencil: lucide timer)
- Border Duo 2/2/4/2: learn card, side card, rows (kombinasi border +
  ring + shadow arbitrary dengan `var(--border)`, warna tetap SSOT)
- Gap pills 12 -> 20, hapus mb-2/mt-2 ekstra (desktop via lg:)
- Leading desktop (lg:) per teks dari ukur Pencil: label 14, badge 14,
  kicker 16, title 44, desc 17, row 17, chip 13, pill 16, CTA 23,
  backlink 16
- Nudge 1px empiris (desktop): side pt 23, card pb 23, side pb 20,
  CTA -mt-px, backlink -mt-px (model stroke Pencil menimpa padding,
  CSS border di luar padding)
- Mobile (<lg) tidak berubah: semua delta di balik prefix lg:,
  kecuali tracking/badge-efek (rapat 1px, dilaporkan di PR)

## Navbar di halaman ini

View detail = overlay (`HomeShell overlay=true`): TopNav TIDAK render
by design. Pencil Gd8Af juga tanpa header (frame langsung konten,
padding atas 20). Verifikasi: screenshot 1440x1016 tidak memuat nav,
tidak ada overflow horizontal. Konsisten, tidak ada pekerjaan nav.
