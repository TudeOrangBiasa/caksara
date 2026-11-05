# Parity KB + onboarding + beranda (pAPnC / FyN8o-U6 / T4HbK)

Keputusan Main: opsi A. Threshold khusus per layar + known-deviation
tercatat (maskot SSOT + token AA menang, lantai tak-tereduksi diakui).
JANGAN duplikat aset/token mentah Pencil. Struktur tetap dikejar 1px.

## Baseline

13 PNG di `.parity/baseline/kb/` (Export Pencil scale 1, JANGAN diedit,
sha dipin `diff-kb.sh`):

| File                    | Frame  | Ukuran    | SHA256      |
| ----------------------- | ------ | --------- | ----------- |
| kb-list.png             | pAPnC  | 1440x1318 | c1b4be49... |
| onboarding-alasan.png   | FyN8o  | 1440x1027 | 15b276ec... |
| onboarding-level.png    | jU8co  | 1440x1027 | 98a8fc3d... |
| onboarding-komitmen.png | vjnVJ  | 1440x1027 | 12b1fdf9... |
| onboarding-nama.png     | VyFA4  | 1440x1027 | 8484b8d9... |
| onboarding-sukses.png   | lGwoj  | 1440x1027 | d340653c... |
| landing-full.png        | T4HbK  | 1440x5307 | 96b57e8e... |
| landing-hero.png        | BmTpd  | 1440x632  | e63a693a... |
| landing-pendekatan.png  | L3lSBS | 1440x445  | 4922d837... |
| landing-zigzag.png      | tluqW  | 1440x1628 | 42df134f... |
| landing-testimoni.png   | esIOz  | 1440x808  | a18f68a9... |
| landing-faq.png         | uTaGy  | 1440x628  | 9ce47b3e... |
| landing-cta-footer.png  | L3KHR  | 1440x1105 | aeecda6c... |

Viewport implementasi: 1440 lebar, deviceScaleFactor 1, locale id-ID,
tema light paksa (`vite-ui-theme`), `prefers-reduced-motion: reduce`
(animasi mati deterministik + zigzag render penuh tanpa transisi).

## Cara jalan

```bash
bun .parity/shoot-kb.ts 5195   # onboarding 5 + kb top/bot + 6 seksi landing
.parity/diff-kb.sh             # threshold khusus + 9 probe geometri
```

KB list: aplikasi memakai scroll internal `main.flex-1` (1421px),
sementara baseline satu frame 1318px. Shoot menjahit viewport atas
(1027) + ekor bawah (459) lalu crop 1318. Landing: shot per elemen
`data-parity` (lebar 1216, konten tengah max-w-7xl); baseline di-crop
tengah ke ukuran shot sebelum diff.

## Hasil akhir

| Layar              | RMSE   | fuzz5  | Ambang        |
| ------------------ | ------ | ------ | ------------- |
| ob-alasan          | 0.0872 | 95269  | 0.12 / 100000 |
| ob-level           | 0.0836 | 89198  | 0.12 / 100000 |
| ob-komitmen        | 0.0827 | 88254  | 0.12 / 100000 |
| ob-nama            | 0.1119 | 63327  | 0.12 / 100000 |
| ob-sukses          | 0.1068 | 64480  | 0.12 / 100000 |
| kb-list            | 0.1038 | 228939 | 0.11 / 235000 |
| landing-hero       | 0.2524 | 158269 | 0.26 / 160000 |
| landing-pendekatan | 0.1350 | 111307 | 0.14 / 115000 |
| landing-zigzag     | 0.1935 | 202219 | 0.20 / 205000 |
| landing-testimoni  | 0.1949 | 200517 | 0.20 / 205000 |
| landing-faq        | 0.1536 | 67192  | 0.16 / 70000  |
| landing-cta-footer | 0.2001 | 117845 | 0.21 / 120000 |

Probe: 9/9 cocok (ob-bar, ob-opt-top, ob-cta-top, kb-banner,
kb-card1, lp-title, lt-avatar, lh-h1, lz-row1).

## Yang disamakan (struktural, token-safe, desktop via lg:)

Onboarding: kolom 640, stack rapat (topbar 32, meta gap 8, opsi 64,
CTA 50 uppercase, spacer nama 260), opsi selected tanpa ring/shadow +
pil Dipilih hidden, teks Pencil (goal question, wisata lontar),
sukses tanpa kartu (maskot 240x284, pill 12, CTA 16 uppercase).
KB list: sidebar statis (hapus sticky), padding 28/32/48, gap 32/16,
banner tanpa pil count + radius 20, filter gap 12 + search tanpa ring,
chip 7/12, section gap 14 + head leading, kartu pad 14 gap 6,
badge 3/8, glyph min 36.
Landing: 2 CTA hero (Mulai + Sudah Punya Akun), phone Pencil
(A/B + PERIKSA, tegak 240, orbit 420, maskot 160), pendekatan
228x184 gap 8 tanpa edge, zigzag gap 40/128, testimoni (3 kartu
baris 1 data-driven + nav), FAQ gap 14 tanpa edge, CTA 976 +
footer pad/kolom/bottom, kontak lomba Pencil + legal.

## Known deviations (disengaja, tidak diperbaiki)

1. Maskot: repo Bedawang lingkaran (bedawang-*.png SSOT) vs Pencil
   sprite kotak images/generated-1/2.webp (transform non-affine,
   best-crop RMSE 0.53, lebih buruk dari aset repo 0.24). Terukur:
   region maskot onboarding ~14k px, sukses ~38k px fuzz.
2. Opsi selected: Pencil hijau mentah `#D7FFB8` fill + `#58CC02`
   stroke + iconbox `#58CC02` (di luar 13 token ADR-0015) vs repo
   `cta/10` + border cta + iconbox cta. Terukur: satu kartu
   ~44k px (46% fuzz step0). Uji `success/15` gagal mendekat.
3. CTA: `cta` oklch vs `#2F7D00` (ADR-0015 no 2: existing menang
   uji kontras). Struktur sama (pill, 50, uppercase).
4. Banner/primary: `primary` oklch vs `#B4622D` (no 1); muted vs
   `$muted` (no 6); border vs `#E5E5E5`/`#ECE7DB` (no 7).
5. Background section: app putih vs `$bg #FFFCF6` (no 12).
6. Font: Inter Variable (app) vs Inter (Pencil); glyph Bali sama
   (Noto Sans Balinese), render Chromium vs Pencil beda tipis.
7. Phone hero: konten disamakan (A/B + PERIKSA) tapi tinggi 340
   vs 480 Pencil (konten app lebih padat); orbit ring vs elips
   transparan; chip 56 vs 64.
8. Pendekatan: ikon lucide lingkaran vs kotak `$primary-soft`
   44px Pencil (struktur kartu, tilt, gap disamakan).
9. Zigzag: demo prosedural (Kuis/Chat/Kamus) vs demo Pencil
   (gap, copy, ukuran kartu disamakan; isi demo sepadan).
10. Testimoni: Pencil baris 2 `enabled=false` (tak dirender);
    app hanya 3 kartu baris 1. Avatar Userpics lokal (bukan URL
    Pencil). Bintang lucide vs glyph bintang.
11. KB-detail tanpa frame Pencil: known-deviation, bahasa visual
    sama (back ring, kartu border-2, CTA Duo), tanpa gate piksel.
12. Footer: `bg-secondary/30` vs `$footer-bg` (no 13); brand glyph
    `ᬳ` vs `ᬉ` Pencil (glif repo yang benar).
