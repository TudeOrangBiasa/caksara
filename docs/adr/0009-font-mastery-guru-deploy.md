# Font Self-Host, Mastery Derived, Guru Virtual Scope, Deploy

Konteks: butuh aksara tidak tofu, progres aksara kredibel, chatbot tidak ngarang, dan deploy cepat untuk demo juri.

Keputusan: bundle Noto Sans Balinese woff2 self-host via Vite (`/fonts/*`, `[lang='ban']` switch, `font-display:swap`), test prod di device tanpa font bawaan; ilustrasi modul placeholder dulu. Mastery = derived `answers.aksaraId` → `user_aksara_progress` (belum/dipahami/ahli) untuk grid 18 aksara. Guru Virtual hanya jawab dari KB + `faq-data.json` (temp rendah, tampilkan `sourceRef`); di luar scope jawab fallback sopan. Deploy FE di Vercel, DB/Edge/Storage/RLS di Supabase.

