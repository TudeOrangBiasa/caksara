# E2E Final — full flow + audit (debt #71)

Tanggal: 2026-09-30 · Branch: `chore/e2e-final` dari `origin/develop` (HEAD 3176334)
Dev server: `http://localhost:5173` · agent-browser sesi `e2e-final` · viewport 390px + 1280px
Proof dir: `docs/proof/e2e-final/` (26 PNG)

Alur yang dieksekusi (semua pass):
onboarding (4 langkah → nama "E2E" → Siap Mulai → dashboard) → Belajar/pohon
→ detail modul → materi (paging) → kuis (jawab BENAR Q1 → feedback hijau +
feedback link KB; jawab SALAH Q2 → feedback merah + label "Penjelasan dari
Basis Pengetahuan") → Q3 cocokkan (pair kiri+kanan bisa dipilih, selesai →
"Lihat hasil") → hasil ("Belum lulus", 2/3, 67%, COBA LAGI + Kembali) →
Kembali → pohon (modul 1 Selesai, modul 2 Aktif terbuka) → Profil (Mastery
18 Wresastra, streak, lencana, XP) → Kartu Prestasi (Bagikan + Unduh PNG) →
Pengaturan (Tampilan terang↔gelap, Ukuran Aksara 24→32, Suara on→off→on) →
KB list → filter Kosakata → KB detail (Om Swastiastu) → Guru (chip KB →
jawaban + SUMBER RUJUKAN + deep-link KB; fallback "xyzqwe naga terbang" →
"Maaf, itu masih di luar materi…") → desktop 1280.

## Tabel audit

| Halaman            | Checklist Design                                          | Verdict                                                                                                                                                      | Fix (kecil, langsung)                                               | Verify                                                |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------- |
| Onboarding         | mobile-onboarding                                         | **lolos** — progres + Lewati + radio terpilih jelas + nama opsional                                                                                          | —                                                                   | shot 01, 01b, 02                                      |
| Dashboard pohon    | mobile-dashboard                                          | **lolos** — ringkasan XP/hati/streak, CTA Lanjutkan, modul terkunci beralasan                                                                                | —                                                                   | shot 03 (+1280 03b)                                   |
| Modul detail       | web-app-single-item-detail                                | **lolos** — judul, kembali, CTA mulai                                                                                                                        | —                                                                   | shot 05                                               |
| Materi             | mobile-onboarding-checklist                               | **lolos** — paging Lanjut, halaman akhir → "Kerjakan 8 soal"                                                                                                 | —                                                                   | shot 06, 07                                           |
| Kuis + feedback    | mobile-chat (interaksi cepat) + flows-showing-input-error | **lolos** — feedback benar/salah instan, `role=status aria-live`, tombol Lanjut/Lihat Hasil full-width, keyboard 1-4/Enter                                   | — (KB grid fix di bawah menutup celah sticky bottom-nav global)     | shot 08, 09                                           |
| Hasil              | web-app-report-view                                       | **perlu-fix kecil** — skor + level adaptif + CTA ganda jelas; Level 1 tidak naik setelah 2/3 benar (ekspektasi adaptif ±1, minor)                            | tidak diubah (butuh keputusan produk, catat sisa)                   | shot 10                                               |
| Profil Mastery     | mobile-profile                                            | **lolos** — identitas, streak, XP progress, grid 18 aksara, Bagikan + Pengaturan                                                                             | —                                                                   | shot 11                                               |
| Kartu prestasi     | website-press-media (share asset)                         | **perlu-fix kecil** — layout + CTA Bagikan/Unduh jelas; **box "TAHUKAH KAMU?" meluap 3 baris untuk tidbit panjang** (contoh Basa Alus terpotong "kedudukan") | `achievement-card.ts` drawTidbit: gabung luapan → baris 2 + elipsis | `bun test achievement-card` 13 pass; shot 12 (before) |
| Pengaturan         | mobile-settings + web-app-settings                        | **lolos** — 6 seksi, radio tema, radio ukuran aksara, switch suara + tombol Coba, versi                                                                      | —                                                                   | shot 13, 13b–13e                                      |
| KB list/filter     | flows-filtering-items + mobile-search                     | **perlu-fix kecil** — search + chip kategori/level + empty-state; **grid mobile tanpa clearance: kartu terakhir ("nya"/"ya") tertutup bottom-nav**           | `kb-list.tsx`: grid mobile `pb-28` (desktop tetap `lg:pb-12`)       | oxlint 0 error; shot 14 (before)                      |
| KB detail          | web-app-single-item-detail                                | **lolos** — kembali ganda, sumber eksternal                                                                                                                  | —                                                                   | shot 15                                               |
| Guru KB + fallback | web-app-chat + mobile-chat                                | **lolos** — jawaban KB + SUMBER RUJUKAN + deep-link; fallback sopan tanpa halusinasi                                                                         | —                                                                   | shot 16, 16b, 16c                                     |

## Audit code cepat

- Token SSOT: tidak ada hex baru — `grep #[0-9a-f]{3,8}` hanya kena fallback
  `cssVar("--card-*", "#…")` di `achievement-card.ts` (canvas, by-design, sudah ada).
- Zod batas: `kb.ts`, `question.ts`, `teacher.ts`, `answer.ts`, `session.ts`,
  `game-state.ts`, `profile.ts` ada + test; input guru/kb-query lewat skema + filter.
- ARIA: kuis `role=status aria-live`, progressbar hati; radio/switch/settings
  memakai kontrol native; tidak ada pelanggaran baru.

## Responsif 390 + 1280

- 390: semua halaman termuat tanpa overflow horizontal; dua temuan mobile
  diperbaiki langsung (KB `pb-28`, tidbit elipsis).
- 1280: dashboard + KB grid rapi (KB sidebar sticky, grid 4–5 kolom); shot
  `03b-dashboard-1280.png`, `17-dashboard-1280.png`.

## Sisa (timebox 30 mnt tercapai, tidak dikerjakan)

1. After-shot KB grid + kartu prestasi render ulang (butuh re-run browser ±5 mnt).
2. Level adaptif hasil 2/3 → tetap Level 1 (keputusan produk #33, bukan bug E2E).
3. Warning oxlint `shadcn(no-arbitrary-values)` pre-existing di `kb-list.tsx`
   (`text-[11px]`, `max-w-[…]`) — di luar scope kecil, 0 error tetap terpenuhi.
