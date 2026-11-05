# Parity tracer: Hasil Lulus/Gagal + Resume (Pencil Z8nXI/HK0rs/A8B2n)

Tiga layar: Hasil Kuis lulus modul (3/3), Hasil Kuis gagal Latihan
Campuran (4/6), dialog Lanjutkan Kuis. Pola tracer #156: baseline PNG
frame Pencil, gate threshold + probe geometri, known-deviations
tercatat, anti-shortcut.

## Baseline

- File: `.parity/baseline/hasil/Z8nXI.png` (lulus),
  `.parity/baseline/hasil/HK0rs.png` (gagal),
  `.parity/baseline/hasil/A8B2n.png` (resume)
- Sumber: frame `Z8nXI` ("Hasil Kuis"), `HK0rs` ("Hasil Gagal"),
  `A8B2n` ("Lanjut Kuis") dari
  `/home/todayz/Downloads/Caksara/Caksara.pen`
- Metode ekspor: `Export([...], 'png', out, {scale: 1})` via tool
  Pencil `execute` (render internal Pencil, 1 unit kanvas = 1 px)
- Resolusi: 1440 x 1024, sRGB, scale 1
- Viewport implementasi: 1440 x 1024, deviceScaleFactor 1, locale
  id-ID, tema light (paksa via localStorage `vite-ui-theme`)
- SHA256:
  - Z8nXI: `4706ec43aeb7803aee7a0ac5f6a4f76c0f8e66348482c2762920885595cfbb3b`
  - HK0rs: `6d54f003e221cf55fcae9fcf15d743624b571919f7ed08f95d95e14d0ed66932`
  - A8B2n: `2659ca06e197758aab00d15953eae9e8b40f9298184ff642aff77e8e8e21d5d0`
- Baseline TIDAK BOLEH diedit agar diff lolos (anti-shortcut).
  Verifikasi sha sebelum klaim angka.

## Cara jalan

```bash
# 1. Dev server di port bebas (jangan sentuh milik orang)
# 2. Screenshot implementasi (Playwright, deterministik)
bun .parity/shoot-hasil.ts 5197
# 3. Gate diff (threshold per layar + probe posisi)
.parity/diff-hasil.sh
```

Skenario deterministik: lulus = sesi modul mod_01 jawab semua benar
(3/3, XP 30, tidbit indeks 0 via `Math.random = () => 0`); gagal =
Latihan Campuran (seed selesai mod_01) pola benar-salah agar 4/6;
resume = seed localStorage `caksara.quiz-resume.v1` currentIndex 1.
Toast sonner dan confetti disembunyikan saat freeze (elemen
transien, bukan konten layar).

`.parity/diff-hasil.sh` lolos bila SEMUA terpenuhi:

1. RMSE per layar: lulus <= 0,10, gagal <= 0,10, resume <= 0,07
2. Beda nyata (difference threshold 5%): lulus <= 60.000 px, gagal
   <= 70.000 px, resume <= 50.000 px (3,39%)
3. Spot-check (`bun .parity/spotcheck-hasil.ts`): 9 probe batas
   geometri cocok (koordinat boleh beda base vs cur bila offset
   tercatat; bentuknya harus sama persis, toleransi 0)

Threshold per layar adalah keputusan Main: pill V11a (opsi B) dan
maskot AI generatif adalah deviasi struktural yang disengaja dan
tak bisa disamakan tanpa mengorbankan fungsi/aset SSOT.

## Angka final tracer ini

| Layar          | RMSE   | Ambang | Beda-nyata        | Ambang | Probe | Status |
| -------------- | ------ | ------ | ----------------- | ------ | ----- | ------ |
| Lulus (Z8nXI)  | 0,0992 | 0,10   | 57.016 px (3,87%) | 60.000 | 5/5   | LOLOS  |
| Gagal (HK0rs)  | 0,0943 | 0,10   | 64.852 px (4,40%) | 70.000 | 3/3   | LOLOS  |
| Resume (A8B2n) | 0,0626 | 0,07   | 22.974 px (1,56%) | 50.000 | 1/1   | LOLOS  |

Baseline awal (sebelum tracer): lulus 0,158/109.225, gagal
0,150/93.413, resume 0,097/44.161.

Lulus dan gagal memakai ambang longgar karena dua deviasi
struktural yang disengaja (keputusan Main, opsi B): pill V11a
dipertahankan (+29px offset tombol lulus) dan maskot gagal Pencil
adalah foto AI generatif (bukan Bedawang SSOT, +33rb px). Tanpa
keduanya, lulus proyeksi 0,06/23rb dan gagal 0,07/32rb.

## Known deviations (disengaja, tidak diperbaiki)

1. Pill Level V11a: app tampil di bawah hero desktop (teks 11px),
   Pencil menonaktifkannya (enabled=false). Keputusan Main opsi B:
   fungsi adaptif lebih penting dari piksel. Dampak: tombol lulus
   +29px (probe lulus-btnTop memakai offset tercatat).
2. Maskot gagal: Pencil foto AI `generated-1.webp` 188x211,
   app Bedawang sedih (standing, grayscale 35%) lingkaran 188.
   Maskot SSOT tidak diganti aset generatif. Dampak: 33rb px
   (diukur via crop), tak bisa disamakan.
3. Sub tanggal resume: app "Terakhir sampai soal ke-2 dari 3
   (6 Nov)", Pencil tanpa sub. Info fungsional dipertahankan.
   Dampak: progres/CTA +4px (probe resume-ctaTop offset tercatat),
   progres 1/3 vs Pencil 2/3 (Pencil inkonsisten: CTA "SOAL KE-2"
   tapi 2 segmen terisi; app benar).
4. Desc gagal: app generik ("Ulangi bagian yang sulit..."),
   Pencil spesifik ("Ulangi bagian sapaan pembuka..."). App tak
   punya topik-salah di QuizResult; 1 baris vs 2 baris Pencil.
   Dampak: tombol gagal -10px.
5. Kicker: app `accent-foreground` vs Pencil `#FF9600`/`#FF4B4B`
   (FAIL kontras, tak diadopsi, semangat ADR-0015).
6. Title: app `cta`/`destructive` vs Pencil `#2E7D00`/`$red`
   (token SSOT, hue sekeluarga, no 2/10).
7. XP pill: app `accent`/`accent-foreground` vs `#FFD900`/`#6B4A00`
   (no 9: Pencil FAIL sebagai teks).
8. Ring: app `bg-cta` vs `#2F7D00` (no 2); skor `text-cta` vs
   `#2F7D00`; gagal `destructive` vs `$red` (no 10).
9. Border kartu/tombol: `border` SSOT vs `#E5E5E5` (no 7, 1px
   model stroke Pencil menimpa keluar, CSS di dalam).
10. Teks Bali lulus disamakan ke Pencil ("matur suksma"); font
    "Inter Variable" vs Inter (glyph <= 1px).
11. Maskot lulus: byte-identik (`bedawang-happy/waving` md5 sama
    dengan `mascot-happy.png` Pencil); sisa beda dari resampling
    Chromium vs Pencil (8rb px, terukur via crop).
12. GameOver (Hati habis): tak ada frame Pencil; komponen tidak
    diubah, tidak masuk gate.

## Yang disamakan tracer ini (struktural, token-safe)

- Hero 2 kolom di desktop (maskot 200/188 + teks, gap 20) via
  wrapper `contents` (mobile 1 kolom utuh)
- Kicker/title/sub rata kiri + leading/tracking Pencil (13/1.0/1.5,
  28/1.15/-0.5, 15/1.4); title `lg:text-cta`/`lg:text-destructive`
- Stats di dalam hero (pt-16, gap 16), skor 26px, XP "+ 30 XP"
- Info card: gap 10, Bali 16px, fact 13px tanpa divider di lg,
  teks Bali = Pencil
- Tombol: outline 50px 15px bold muted, CTA 51px; resume vertikal
  CTA-atas + secondary radius-16 uppercase
- Top-align desktop ke Result Col Pencil (lulus 277, gagal 306)
  karena pill/desc mengubah tinggi kolom; center tak stabil
- Resume: ikon 128, progres 400, tombol vertikal 400
- Confetti `data-slot` + freeze sembunyikan toast/confetti
  (transien); tidbit deterministik indeks 0
- Mobile (<lg) tidak berubah kecuali spasi "+ 30 XP" dan teks Bali
  (konten statis, dilaporkan di PR)
