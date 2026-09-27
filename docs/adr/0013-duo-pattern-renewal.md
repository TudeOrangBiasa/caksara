# ADR 0013 — Duo Pattern Renewal (pola Duo, rasa Caksara)

Konteks: file Figma Duo Community yang dipakai sebagai ground truth tidak
punya variables/styles — semua nilai dibaca mentah per-node via Figwright
`get_design_context` (DuoSysExtract). Node 11:4094 timeout saat dibaca,
dipakai node ekuivalen untuk nilai yang sama. Nilai mentah (FACT):

- CTA: fill `#58CC02`, edge/shadow `#58A700` y+4.23, radius pill ~17, teks
  putih UPPER Inter Bold 13.76 ls 0.85.
- Progress: track `#E5E5E5`, fill `#58CC02`, aksen `#FFC800`, highlight
  putih 20%, radius 8.37 h 16.74.
- Bubble: border `#E5E5E5` 2.08 inside, radius 12.5, teks `#3C3C3C`
  Inter Medium 14.38 leading ~25.
- Kartu opsi: putih, border `#E5E5E5` 2.1, radius 12.58, shadow `#E5E5E5` y+2.1.
- Footer feedback: top-border 2.12 `#E5E5E5`; pil hijau radius 6.24.
- Font Figma Inter = cocok dengan `--font-sans` kita.

Governance: `tokens.ts:4` mewajibkan token baru dicatat di ADR dulu sebelum
mirror ke `globals.css` (SSOT). ADR ini adalah catatan itu — edit
token/komponen dilarang sampai ADR ini di-approve.

Keputusan:

**1. KEEP (sakral, ADR 0010):** `--primary` terracotta `oklch(0.55 0.13 38)`
tetap — hijau Duo diadopsi sebagai _pola_, bukan warna primer. oklch di
mana-mana, Noto Sans Balinese `U+1B00-1B7F`, motion 150ms ease-out tetap.

**2. ADOPT (peta hex → var existing, tanpa hex di komponen):**

- CTA fill `#58CC02` → `var(--cta)` (bukan `var(--success)` langsung —
  success light gagal AA dengan teks putih, lihat §3); teks putih UPPER bold ls lebar.
- Progress track `#E5E5E5` → `var(--border)`, fill → `var(--success)`,
  aksen `#FFC800` → `var(--accent)`, highlight putih 20% → `var(--highlight)`.
- Bubble/border kartu `#E5E5E5` → `var(--border)`; teks `#3C3C3C` → var
  foreground existing.
- CTA pill radius 999; kartu kuis border-2 + hard shadow (ganti soft M3
  shadow hanya untuk tile kuis); bubble radius-xl border-2 kartun;
  zona feedback full-bleed `success`/`destructive`.

**3. Token baru yang didaftarkan** (konversi oklch dari hex Figma; mirror
wajib sama persis di `globals.css` + `tokens.ts` + `.describe()`):

| Token                                                  | Light                                                | Dark                                        | Pasangan foreground                                                                                                                                                                                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--cta` (fill CTA, success yang digelapkan khusus CTA) | `oklch(0.52 0.15 145)`                               | `oklch(0.68 0.14 145)` (= `--success` dark) | light: `--primary-foreground` near-white `oklch(0.985 0 0)` → **4.95:1 PASS**; dark: `--primary-foreground` near-black `oklch(0.145 0 0)` → **7.26:1 PASS**                                                                                                              |
| `--cta-edge`                                           | `oklch(0.45 0.14 145)`                               | `oklch(0.55 0.14 145)`                      | n/a (bayangan, tanpa teks); syarat: selalu lebih gelap dari `--cta` se-mode (0.45 < 0.52; 0.55 < 0.68). Hue dikunci 145 (bukan 135 bawaan `#58A700`) agar in-gamut sRGB pada L gelap — `oklch(0.45 0.16 135)` clip (komponen b negatif), `oklch(0.45 0.14 145)` in-gamut |
| `--shadow-duo`                                         | `0 4px 0 0 var(--cta-edge)` (hard edge y+4, no-blur) | sama (mengacu var, ikut adaptasi)           | n/a                                                                                                                                                                                                                                                                      |
| `--radius-pill`                                        | `999px`                                              | sama                                        | n/a (dimensi)                                                                                                                                                                                                                                                            |

**Kontras AA (metode: `oklch-skill` accessibility-contrast, WCAG 2 teks normal ≥4.5:1, konversi oklch→sRGB + rasio luminance):**

- Light `white-ish on --success` (`oklch(0.985 0 0)` di atas `oklch(0.62 0.15 145)`) = **3.28:1 FAIL**; putih murni = **3.43:1 FAIL**. CTA light memakai `--cta` yang digelapkan (L 0.62→0.52, C/H tetap 0.15/145, in-gamut): `white-ish on --cta` = **4.95:1 PASS**.
- Dark: teks di atas `--success` dark memakai `--primary-foreground` dark (near-black, bukan putih) = **7.26:1 PASS**; putih murni di atas success dark justru **2.73:1 FAIL**, jadi CTA dark tetap teks gelap.
- Perbaikan via L saja (C/H tetap) sesuai panduan skill; kandidat L 0.58 = 3.86 FAIL, L 0.55 = 4.36 FAIL, L 0.52 = 4.95 PASS — dipilih L 0.52.

**4. Komponen terdampak:** Button/CTA (edge-shadow + uppercase + pill),
Progress (track/fill/aksen), kartu kuis (`quiz-choice`, `quiz-cocokkan`,
`quiz-susun` tiles), Bubble (`bubble.tsx` + teacher), Feedback
(`quiz-feedback` full-bleed), Pohon Modul (CTA + progress yang sama).

**5. Bedawang mood-only lock + migrasi stored config:** hapus props mati
`shell`/`head`/`acc`/`blink` (interface deklarasi tapi destructure hanya
`mood`/`className`/`animate`/`interactive`/`onClick` — PropAudit FACT) +
wiring `BedawangConfig`/studio (studio jadi mood picker atau hapus; studio
live di `profile-section.tsx:175` jadi UI gantung dilarang). Set PNG tetap
4 `bedawang-*` (`happy`/`waving`/`standing` + `learning`/`walking`
cadangan). Aset JPG/PNG lama belum dihapus (debt #54). Prop salah nama
`accessory` di `approach-art.tsx:539` dihapus bersama props (penggunaan
jadi mood-only, bukan diganti `acc`).

Migrasi eksplisit (wajib agar hapus props ≠ parse break): skema lama `{ shell, head, accessory, mood }` → skema baru `{ mood }`. Implementasi: `bedawangConfigSchema` baru = `z.object({ mood: bedawangMoodSchema })` dengan preprocess/union yang menerima objek lama dan mentransformasi hanya `mood`-nya (`({ mood }) => ({ mood })`), unknown keys di-strip; mood tak valid → `.catch({ mood: "senang" })` (default fallback). Varian bedawang di `profileAvatarSchema` memakai skema baru ber-catch sehingga `userProfileSchema.parse` di `readStored` tidak melempar untuk profil tersimpan lama — avatar lama jatuh ke mood valid atau default `senang`, tidak pernah null-break seluruh profil.
Domain bahasa TIDAK berubah: Wresastra, Hati, XP, Streak, Mastery,
Guru Virtual, KB Entry tetap (CONTEXT.md). Papan Peringkat, Peti Hadiah,
Rangkaian Harian hanya kandidat — butuh grill terpisah, bukan scope ini.

Konsekuensi: setelah approve, mirror token ke SSOT lalu ubah komponen;
`bun run check` 0 error, `bun run build` exit 0, tanpa hex di komponen
(`grep`), proof agent-browser light/dark 390+1280 ke
`docs/proof/duo-renewal/`. Tanpa fitur baru.
