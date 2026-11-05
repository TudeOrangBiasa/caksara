# NOTICE: Aset Pencil Caksara.pen (T1 #140)

Aset di bawah ini divendor dari `~/Downloads/Caksara/images/` (sumber:
kanvas Pencil `Caksara.pen`, generate internal Firefly/Express,
bukan stok berlisensi, bukan screenshot pihak ketiga) ke
`apps/web/public/assets/`. Semua file diakses via path lokal
`/assets/...`: nol ref skema file lokal dan nol ref host aset remote
di tree (gate: grep + verify-formal `--forbid`).

## Bukti kompresi (before → after, byte eksak via `stat`)

| File target             | Sumber                    | Before (byte) | After (byte) | Rasio | Perlakuan                                                                             |
| ----------------------- | ------------------------- | ------------: | -----------: | ----: | ------------------------------------------------------------------------------------- |
| `bedawang-moods-1.webp` | `generated-1.webp` 2048²  |     2.060.704 |       75.082 |  3,6% | resize display 796px (maks kanvas 796×893) + re-encode libwebp q80                    |
| `bedawang-moods-2.webp` | `generated-2.webp` 2048²  |     2.140.194 |       47.612 |  2,2% | resize display 554px (2× maks kanvas 277×315, retina) + re-encode libwebp q80         |
| `kids-tablets.webp`     | `generated-3.webp` 1024²  |       616.298 |       95.766 | 15,5% | dimensi dipertahankan (kanvas 390×389, nyaris 1:1) + re-encode libwebp q80            |
| `dict-boy.webp`         | `image.png` 1024²         |       747.942 |       29.150 |  3,9% | resize display 536px (kanvas 536×536) + PNG→WebP q85 (foto-style, alpha tak terpakai) |
| `hero-modul.jpg`        | `hero-modul.jpg` 1376×768 |       522.702 |      522.702 |  100% | byte-identik (sha256 `2402cdad…`), sudah JPEG display-size 824×280                    |

Total: 6.087.840 → 770.312 byte (12,7%).

## Sudah ada sebelumnya (tidak diduplikat, checksum cocok)

- `bedawang-happy.png` / `bedawang-waving.png` = `mascot-happy.png` /
  `mascot-waving.png` + `4cab781e551ea950.png` (sha256 `a407c31e…`,
  ketiga file sumber identik).
- `study_mascot_2d_1788968332573.jpg` = `hero-modul.jpg` (sha256
  `2402cdad…`); nama target baru `hero-modul.jpg` adalah alias kanonik
  Pencil; file lama dipertahankan (dipakai module-detail).
- `feature_teacher_2d_1788968442321.jpg` = `a6bd14d3cd53d78d.jpg`
  (sha256 `4718e85e…`).
- `bali_penjor_2d_1788968300643.jpg`, `avatar-harbor-seal-2.webp` +
  29 avatar MIT s1dashu, `Userpics/`, sudah tervendor + atribusi
  (`NOTICE-IP-AVATARS.md`).

## Ditolak

- `generated-4.webp` (api publik Firefly `.../generated/...`, watermark
  render `VectorStock.com/26485855`): lisensi tak terverifikasi,
  TIDAK divendor. Kebutuhan ikon api streak tetap via `lucide-react`
  `Flame` existing.
- `screenshot-*.png` (14 file, kompetitor): referensi whiteboard saja,
  tidak divendor.
