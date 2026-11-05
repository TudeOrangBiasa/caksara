# ADR 0015: Audit Token Pencil Caksara.pen (13 token, tanpa token baru)

Konteks: T1 (#140) mengaudit 25 variabel warna kanvas Pencil `Caksara.pen`
(get_app_state 2026-11-05; `GetVariables()`, dibaca per variabel via
`execute`, bukan dari screenshot) terhadap SSOT existing
`packages/ui/src/lib/tokens.ts` + `packages/ui/src/styles/globals.css`
(ADR 0010 + 0011 + 0013: terracotta primary, Duo cta/ctaEdge oklch-145,
ilustrasi HEX). Governance (`tokens.ts:4`): token baru WAJIB dicatat di ADR
dulu. Hasil audit: 13/13 token Pencil terpetakan ke token existing:
tidak ada token baru, tidak ada mirror CSS/ts.

Keputusan:

**1. Tabel mapping 13 token Pencil → existing (nilai Pencil = HEX kanvas;
nilai existing = oklch SSOT; pemakaian = hitung ref `$var` via `execute`):**

| #   | Pencil          | HEX       | Dipakai                            | Existing                                          | Nilai existing                                      | Status                                                                                                                                                                                                             |
| --- | --------------- | --------- | ---------------------------------- | ------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `$primary`      | `#B4622D` | 312× teks/ikon terracotta          | `--primary`                                       | light `oklch(0.55 0.13 38)`                         | KEEP: hue sekeluarga (±13°), nilai existing dipertahankan (AA light: teks primary di atas bg = 4.34:1)                                                                                                             |
| 2   | `$cta`          | `#1D8A3C` | 41× CTA Duo                        | `--cta`                                           | light `oklch(0.52 0.15 145)`                        | KEEP: oklch Pencil ≈ `oklch(0.557 0.149 148)`; existing dipilih via uji kontras ADR 0013 (4.95:1 vs putih, Pencil `#1D8A3C` = 4.42:1 FAIL)                                                                         |
| 3   | `$cta-dark`     | `#156B2E` | 1× (swatch Design System saja)     | `--cta-edge`                                      | light `oklch(0.45 0.14 145)`                        | KEEP: Pencil hanya swatch tak terpakai; existing edge diukur lebih gelap dari cta (syarat ADR 0013)                                                                                                                |
| 4   | `$card`         | `#FFFFFF` | 47× kartu putih                    | `--card`                                          | light `oklch(1 0 0)`                                | KEEP: identik                                                                                                                                                                                                      |
| 5   | `$ink`          | `#242424` | 658× teks utama                    | `--foreground`                                    | light `oklch(0.145 0 0)`                            | KEEP: existing lebih gelap (kontras 15.16:1 di atas bg vs 13.09:1 Pencil)                                                                                                                                          |
| 6   | `$muted`        | `#877D70` | 568× teks sekunder                 | `--muted-foreground`                              | light `oklch(0.56 0.02 45)`                         | KEEP: existing setara; Pencil 3.95:1 di atas bg (teks kecil di bawah AA, alasan tidak mengadopsi nilai Pencil)                                                                                                     |
| 7   | `$border`       | `#ECE7DB` | 274× hairline                      | `--border`                                        | light `oklch(0.92 0.01 85)`                         | KEEP: oklch Pencil ≈ `oklch(0.929 0.017 88)`, Δ tak kasatmata                                                                                                                                                      |
| 8   | `$primary-soft` | `#FBE9DC` | 111× pill/nav/chip terracotta-muda | `bg-primary/10` + `text-primary`                  | alpha existing                                      | KEEP: pola alpha dipakai ~15 file (leaderboard, module-tree, kb-list); Pencil `#FBE9DC` vs `primary/10` ΔE ≈ 0 di atas bg terang                                                                                   |
| 9   | `$amber`        | `#C99B33` | 43× ikon/level/streak              | `--accent` (ikon/level/XP) + `--warning` (streak) | `oklch(0.72 0.14 75)` / `oklch(0.75 0.14 65)`       | KEEP: Pencil amber sebagai TEKS 2.27:1 FAIL di atas amber-soft; existing memisah peran: `text-accent-foreground` 15.40:1 (ADR 0013 amend), streak `text-warning` + ikon non-warna                                  |
| 10  | `$red`          | `#C13B1B` | 25× hati/error                     | `--destructive`                                   | light `oklch(0.58 0.22 27)`                         | KEEP: hue sekeluarga (34° vs 27°); existing + `destructive/10` + ikon AlertCircle/HeartCrack (judgement ADR 0013 amend: 4.09:1 + sinyal non-warna)                                                                 |
| 11  | `$cream-card`   | `#F3EBDA` | 73× sel aksara KB/Modul            | `--secondary` / `--muted`                         | light `oklch(0.92 0.03 85)` / `oklch(0.97 0.01 85)` | KEEP: Pencil `oklch(0.942 0.024 86)` ≈ secondary; sel aksara existing `bg-muted/60` + `text-primary` glyph (belajar-extra.tsx). Alias `cream-card` DITOLAK: satu warna = satu nama (aturan single-accent ADR 0010) |
| 12  | `$bg`           | `#FFFCF6` | 17× latar root                     | `--background`                                    | light `oklch(1 0 0)`                                | KEEP: Pencil `oklch(0.992 0.009 85)` ≈ putih; degradasi ke putih murni disengaja (dark mode `.dark` bg `oklch(0.145 0 0)` tak punya padanan Pencil, Pencil light-only)                                             |
| 13  | `$footer-bg`    | `#FAF7F0` | 6× footer                          | `bg-secondary/30` (footer existing)               | alpha existing                                      | KEEP: footer landing-home.tsx memakai `bg-secondary/30`; Pencil `oklch(0.977 0.010 88)` ≈ secondary yang diencerkan. Alias `footer-bg` DITOLAK (alasan sama №11)                                                   |

**2. Variabel Pencil di luar 13 (12 sisanya):** `$green`/`$green-soft`
(10–12×) → `--success`; `$red-soft`/`$amber-soft` (6–42×) → pola
`destructive/10`/`accent/15` + foreground kontras (ADR 0013 amend);
`$muted-bg` (32×) → `--muted`; `$cream`/`$pink-card` (1–2×, swatch /
varian kartu usang, kanvas v2 sudah putih) → tidak diadopsi;
`$duo-*` (0×, tak terpakai) → tidak diadopsi;
`$font-body`/`$font-bali` → `--font-sans`/`--font-balinese` existing.

**3. Tanpa token baru:** kandidat alias issue (`amber`, `red`,
`cream-card`, `footer-bg`) semuanya DITOLAK: setiap peran sudah
terisi token existing yang (a) lolos/metode kontras tercatat, (b) punya
varian dark, (c) dipakai belasan file. Menambah alias duplikat melanggar
aturan satu-nama-per-warna (ADR 0010 §2, single accent lock) dan
memecah dark mode (Pencil light-only).

**4. Aset (vendor + kompresi, bukti byte):** `images/generated-4.webp`
DITOLAK: watermark `VectorStock.com/26485855` di render (bukti visual
via `read` image; lisensi tak terverifikasi, bukan IP sendiri). Lihat
`apps/web/public/NOTICE-IP-PENCIL.md` untuk tabel before/after +
atribusi per file.

Konsekuensi: `tokens.ts`, `globals.css`, `DESIGN.md` frontmatter TIDAK
berubah; `DESIGN.md` §Pencil ditambah sebagai dokumentasi mapping
(bukan token baru). T2+ memakai token existing; Pencil dianggap
grounded ke SSOT ini.
