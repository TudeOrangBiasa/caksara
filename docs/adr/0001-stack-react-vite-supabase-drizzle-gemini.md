# Stack React+Vite+Supabase+Drizzle+Gemini Flash

Konteks: butuh web edutainment cepat, type-safe, satu paket backend untuk hackathon INVENTION 2026. Alternatif seperti Next.js, Prisma, ESLint dipertimbangkan.

Keputusan: kunci React + Vite + TypeScript · Tailwind + Material 3 · oxlint · Zod · Drizzle ORM · Supabase (Postgres + Auth Anonymous + Edge Function + Storage + RLS) · Gemini Flash temp 0.3 · Noto Sans Balinese self-host. Struktur direktori ikut Developer Guide §3, skema DB §4, validasi Zod §5.

Konsekuensi: API key Gemini hanya di Edge Function, font aksara wajib di-bundle (U+1B00–U+1B7F), oxlint bukan ESLint, Drizzle bukan Prisma.
