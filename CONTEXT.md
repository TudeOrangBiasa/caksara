# CAKSARA

Web edutainment untuk belajar aksara & budaya Bali lewat latihan bertingkat — 4 modul berurutan, soal digenerate Gemini Flash dari Knowledge Base terpercaya, progres per akun (anon default).

## Language

**Wresastra**:
18 aksara dasar Bali (Unicode U+1B00–U+1B7F). Unit pembeda utama materi.
_Avoid_: aksara Bali (terlalu umum), hanacaraka

**Modul**:
Learning path berurutan (mod_01 Sapaan & Adat → mod_02 Gerbang Wresastra → mod_03 Jangan Salah Bicara → mod_04 Hari Raya & Tradisi) dengan prereq unlock. Lulus = selesaikan sesi kuis hingga tuntas.
_Avoid_: lesson, chapter, course

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
