# CAKSARA

Web edutainment untuk belajar aksara & budaya Bali lewat latihan bertingkat — 4 modul berurutan, soal digenerate Gemini Flash dari Knowledge Base terpercaya, progres per akun (anon default).

## Language

**Wresastra**:
18 aksara dasar Bali (Unicode U+1B00–U+1B7F). Unit pembeda utama materi.
_Avoid_: aksara Bali (terlalu umum), hanacaraka

**Modul**:
Learning path berurutan (mod_01 Sapaan & Adat → mod_02 Gerbang Wresastra → mod_03 Jangan Salah Bicara → mod_04 Hari Raya & Tradisi) dengan prereq unlock. Lulus = selesaikan sesi kuis hingga tuntas.
**Pohon Modul**:
Tree vertikal di Beranda yang menampilkan 4 Modul berurutan dengan status selesai/aktif/terkunci.
_Avoid_: lesson tree, pohon lesson

**Detail Modul**:
Layar pratinjau Modul aktif berisi judul/deskripsi/poin belajar/jumlah soal/estimasi waktu + tombol Mulai Belajar.
_Avoid_: module detail (EN), detail lesson

**Sesi Kuis**:
Rangkaian 3–8 soal per modul yang dibuat dari KB untuk satu sesi belajar.
_Avoid_: quiz generik tanpa konteks KB

**Hati**:
Nyawa pemain (5). Berkurang tiap jawaban salah; habis = game over (Coba Lagi) dan refill harian.
_Avoid_: nyawa, lives, health

**XP**:
Poin pengalaman dari jawaban benar untuk mengukur kemajuan belajar.
_Avoid_: poin, score generik

**Streak**:
Jumlah hari aktif berurutan. Bertambah tiap hari bermain dan reset jika sehari terlewat.
_Avoid_: streak generik tanpa reset

**KB Entry**:
Unit kebenaran berisi materi dan sumber rujukan yang jadi dasar soal & jawaban Guru Virtual.
_Avoid_: data, content, dataset generik

**Guru Virtual**:
Fitur tanya-jawab terbatas domain KB yang menjawab dengan merujuk sumber.
_Avoid_: chatbot generik, assistant bebas

**Mastery**:
Tingkat penguasaan per aksara (belum | dipahami | ahli) berdasarkan riwayat jawaban.
_Avoid_: progress aksara generik
**Kartu Prestasi**:
Gambar 1080×1350 untuk bagikan capaian (XP, Streak, Mastery 18 Wresastra) via share/download.
_Avoid_: share card generik tanpa konteks prestasi, poster

**Pengaturan**:
Layar preferensi untuk dark mode, ukuran font Wresastra (20/24/32px), suara efek, dan reset progres.
_Avoid_: settings generik tanpa konteks Wresastra, preferences

**Profil Anon**:
Akun tanpa login wajib yang menyimpan progres di perangkat; dapat di-upgrade ke akun permanen.
_Avoid_: guest, user tanpa login

## Design Taste (ADR 0010)

**Taste**: Bali-inspired warm minimal — terracotta candi (`--primary`) + parchment sand (`--secondary`) + gold ukiran (`--accent`), neutral warm hue 38-45 (bukan cold gray), radius M3 medium 0.75rem, motion 150ms ease-out.

**Tokens SSOT**: `packages/ui/src/styles/globals.css` (`:root` + `.dark` + `@theme inline`) — larang `tailwind.config.ts` (Tailwind v4 `@tailwindcss/vite` ignore). `apps/web/src/index.css` re-export. Konsumsi via `bg-primary`, `text-success` dst — larang hex literal di komponen.

**Semantic**:

- Hati = `--destructive` (merah `oklch 27deg`)
- XP = `--success` (hijau `oklch 145deg`)
- Streak = `--warning` (amber `65deg`)
- Mastery: `belum` → `--mastery-belum` (`--muted`), `dipahami` → emas, `ahli` → terracotta (derived `answers.aksaraId` per ADR 0009)

**Typography**: `--font-sans: Inter Variable`, `--font-balinese: Noto Sans Balinese` (self-host woff2, `font-display: swap`, `unicode-range: U+1B00-1B7F`, `[lang="ban"]` + `.font-balinese`). Dark mode primary lightened untuk kontras ≥4.5:1.
_Avoid_: cold gray shadcn default, hex hardcode, TTS baca aksara (ADR 0005 fallback Latin only)

## Layar (Pencil → Web, ADR 0016)

Web = SPA satu route `/`: navigasi via tab (7 tab = header Pencil) + view overlay; pengecualian `/kb/:id`, `/auth/callback`.

| Pencil (id + nama)                                  | Web (tab/view → komponen)             | Status |
| --------------------------------------------------- | ------------------------------------- | ------ |
| T4HbK Beranda — CAKSARA 2                           | tab beranda → LandingHome / Dashboard | sudah  |
| Ky2up Belajar — CAKSARA                             | tab belajar → ModuleTree              | sudah  |
| Gd8Af Modul Detail — CAKSARA                        | view detail → ModuleDetail            | sudah  |
| pAPnC KB — CAKSARA                                  | tab kb → KbList / KbDetail            | sudah  |
| tXwUy Profil — CAKSARA                              | tab profil → ProfilPage               | sudah  |
| u78JLW Kuis (dengar)                                | view quiz → QuizShell                 | sudah  |
| RJBIf Kuis Soal 2                                   | view quiz → QuizShell                 | sudah  |
| g6deu Kuis Pasangan                                 | view quiz → quiz-cocokkan             | sudah  |
| OfPb9 Kuis Susun                                    | view quiz → quiz-susun                | sudah  |
| A8B2n Lanjut Kuis                                   | ResumeDialog                          | sudah  |
| Z8nXI Hasil Kuis                                    | view result → QuizResult lulus        | sudah  |
| HK0rs Hasil Gagal                                   | view result → QuizResult gagal        | sudah  |
| t8BaKT Leaderboard Desktop                          | tab peringkat → LeaderboardCard       | sudah  |
| IpWol Unduh — CAKSARA                               | tab unduh → UnduhPage                 | sudah  |
| FyN8o/jU8co/vjnVJ/VyFA4/lGwoj Kanvas 01 (5 langkah) | OnboardingGate (5 step)               | sudah* |
| — (tanpa frame Pencil)                              | tab guru → TeacherChat                | sudah  |

*drift 2 string onboarding (Level, Komitmen) → ADR 0016 keputusan 4.

**Beranda**:
Layar awal (landing desktop + dasbor mobile) berisi hero, pendekatan, kuis/guru/kamus unggulan, testimoni, FAQ, CTA.
_Avoid_: home generik, landing tanpa konteks CAKSARA

**Hasil Kuis**:
Layar akhir sesi lulus (≥70%) berisi skor, XP, pill level, fakta budaya + CTA ulangi/kembali.
_Avoid_: result generik, skor tanpa konteks modul

**Hasil Gagal**:
Layar akhir sesi belum lulus berisi skor, pesan semangat, topik salah + CTA kembali/coba lagi.
_Avoid_: fail generik

**Lanjut Kuis**:
Dialog penawaran melanjutkan sesi dari soal tersimpan atau mulai ulang.
_Avoid_: resume generik

**Kuis Pasangan**:
Tipe soal mencocokkan sapaan dengan artinya.
_Avoid_: matching generik

**Kuis Susun**:
Tipe soal menyusun suku kata/chip menjadi kata benar.
_Avoid_: susun generik

**Papan Peringkat**:
Halaman penuh liga mingguan (H2 + League Card + List R1–R8) dengan reset Senin.
_Avoid_: leaderboard generik tanpa liga mingguan

**Unduh**:
Layar 3 kartu installer + banner sinkron progres. Matriks artefak (ADR-0014):
Linux AppImage saja, Windows .EXE (nsis 64-bit), Android .APK (Capacitor).
Tanpa kartu iPhone (iOS out of scope, coming soon). Tiap kartu tombol
Unduh ke aset GitHub Releases latest. Banner progres ikut perangkat retained.
_Avoid_: download generik, kartu iPhone, .deb/.rpm di Linux

**Onboarding**:
Alur 5 langkah (Alasan, Level, Komitmen, Nama, Sukses) berisi preferensi awal + maskot Bedawang Nala.
_Avoid_: tutorial generik, walkthrough
