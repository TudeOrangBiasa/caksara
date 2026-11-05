# Parity tracer: Kuis aktif (Pencil u78JLW/RJBIf/g6deu)

Tiga frame kuis desktop: dengar+feedback (u78JLW), opsi langsung
(RJBIf), cocokkan (g6deu). Dua pasangan di-gate piksel
(RJBIf, g6deu); u78JLW referensi struktur panel feedback
(state jawaban beda soal, tak di-gate piksel, lihat no 7).

## Baseline

- File: `.parity/baseline/kuis/u78jlw-kuis.png`,
  `.parity/baseline/kuis/rjbif-kuis-soal2.png`,
  `.parity/baseline/kuis/g6deu-kuis-pasangan.png`
- Sumber: frame `u78JLW` ("Kuis - CAKSARA 2"), `RJBIf`
  ("Kuis Soal 2 - CAKSARA 2"), `g6deu` ("Kuis Pasangan - CAKSARA")
  dari `/home/todayz/Downloads/Caksara/Caksara.pen`
- Metode ekspor: `Export([...], 'png', out, {scale: 1})` via tool
  Pencil `execute` (render internal Pencil, 1 unit kanvas = 1 px)
- Resolusi: 1440 x 1024, sRGB, scale 1
- Viewport implementasi: 1440 x 1024, deviceScaleFactor 1,
  locale id-ID, tema light (paksa via localStorage `vite-ui-theme`)
- SHA256:
  - `090a630e96357156c00ff18b2141a36b5584cbe9593d1e02708e1d8c6ed59931`
    (u78jlw-kuis.png)
  - `1601bc0445a11ab4bd255cd008b17073f64abc346b9c4a42edbbf85acd30cacc`
    (rjbif-kuis-soal2.png)
  - `93a126d4079878efe21d93325cec2d7a3267d223ed959fbe283d1b7b4e73256f`
    (g6deu-kuis-pasangan.png)
- Baseline TIDAK BOLEH diedit agar diff lolos (anti-shortcut).
  Verifikasi sha sebelum klaim angka: `sha256sum .parity/baseline/...`.

## Cara jalan

```bash
# 1. Dev server di port bebas (jangan sentuh milik orang)
# 2. Screenshot implementasi (Playwright, deterministik, animasi+toast mati)
bun .parity/shoot-kuis.ts 5196
# 3. Gate diff (threshold + spot-check posisi)
.parity/diff-kuis.sh
```

Sesi deterministik: modul pertama (`mod_01`), attempt 0 =
checkpoint, cocokkan, dengar. Shoot menjawab soal 1 benar,
memasang 3 pasang cocokkan, lalu memotret soal 3.

`.parity/diff-kuis.sh` lolos bila SEMUA terpenuhi:

1. RMSE (ImageMagick, fuzz 0) <= 0.07, tiap pasangan gated
2. Beda nyata (difference threshold 5%) <= 50.000 px (3,39%)
3. Spot-check posisi (`bun .parity/spotcheck-kuis.ts`): 11 probe
   batas geometri cocok persis (toleransi 0): seg1, segGapW,
   optATop, optBTop, optCTop, optDTop, rowGapAB, mLTop, mLMid,
   mLBot, mRTop

Angka final tracer ini: soal RMSE 0,0545 beda-nyata 26.725 px
(1,81%); cocokkan RMSE 0,0526 beda-nyata 25.010 px (1,70%);
11/11 probe cocok. Baseline awal (sebelum tracer): RMSE 0,0750;
beda-nyata 56.013 -> 26.725 (-52%).

## Known deviations (disengaja, tidak diperbaiki)

1. Segmen progres todo: `muted` SSOT vs `#E5E5E5` (ADR-0015
   `$muted-bg` -> `--muted`). Tinggi/struktur disamakan (16px,
   gap 8, radius pill).
2. Segmen terisi/current: `primary` vs `#B4622D` (ADR-0015 no 1).
   Current kini solid (bukan 60%) agar pola isi Pencil cocok.
3. Border tile: `border` SSOT vs `#E5E5E5` (ADR-0015 no 7,
   "tak kasatmata"). Ketebalan disamakan (2/2/4/2 via border +
   tile-duo y+2, radius 12).
4. Teks ink: `foreground` vs `#242424` (no 5); meta `#777`
   Pencil vs `muted-foreground` (no 6).
5. KONTEN meta: Pencil "PILIH SATU JAWABAN" vs app "SOAL 1 / 3".
   Label progres sesi adalah perilaku app (bukan stale Pencil);
   gaya disamakan (13px, 800, tracking 0.8, uppercase).
6. Level pill: Pencil disabled vs app tampil ("Level 1", badge
   sesi adaptif #33). Gaya disamakan ke pill Pencil
   (11px, padding 8/2, `primary/10`).
7. u78JLW tak di-gate piksel: state feedback benar soal DENGAR
   ("Om Swastiastu ...", maskot 128, tombol DENGARKAN, panel
   hijau + LANJUTKAN). Sesi app seed 0 menaruh dengar di soal 3
   tanpa feedback; struktur feedback (maskot 48, judul 20,
   pil XP, CTA 47, border 2, radius 16) disamakan dari ukur
   frame ini. Beda konten (teks "Bagus!" vs "Bener banget!",
   maskot waving vs Bedawang, tombol DENGARKAN vs Putar+label
   atribusi CC) disengaja: telemetry bank soal, IP maskot
   sendiri, kewajiban atribusi audio.
8. Model stroke 1px: Pencil stroke menimpa ke dalam, CSS border
   ke luar. Tepi atas/bawah tile disamakan via margin 15px +
   tinggi 60px; tepi kiri/kanan beda <= 1px (terukur, di luar
   probe). Sama kelasnya dengan nudge tracer #156.
9. Font: "Inter Variable" (app) vs Inter (Pencil). Glyph bisa
   beda <= 1 px. Tidak bisa disamakan tanpa ganti font app.
10. Baris status cocokkan ("0 dari 3 pasangan cocok"): Pencil
    tanpa; app `sr-only` di desktop (tetap diumumkan screen
    reader, tak menggeser grid).
11. Tile kanan cocokkan: Pencil opacity penuh vs app redup
    pra-pilih; app opacity penuh di desktop agar grid cocok,
    stateulisasi lewat disabled + aria tetap jalan.

## Yang disamakan tracer ini (struktural, token-safe)

- Shell: max-w 576, padding atas 20, top bar h-8, segmen h-4
  gap-2, hati 16/20px
- Meta: mt-5 h-4, teks 13/800/0.8px; pertanyaan 22px leading 27
- Opsi: mt-15px, tile 60px, radius 12, teks 14 leading 20,
  lingkaran 32
- Ask row (dengar/visual): maskot 128, gap 16, bubble tanpa
  shadow, tombol Putar 40/13px radius 12
- Feedback: mt-6, maskot 48, judul 20 bold, ikon 24, pil XP
  tanpa shadow, CTA 47px, radius 16 border 2
- Cocokkan: mt-15px, tile 60px radius 12, gap 12, status sr-only
- Susun: mt-16, tile radius 12 (drop zone Pencil tak ada di
  frame; struktur app dipertahankan)
- Mobile (<lg) tidak berubah: semua delta di balik prefix lg:,
  kecuali segmen current solid (pola isi, dilaporkan di PR)
