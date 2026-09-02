# Rate Limit + Bulk Generate + KB Cache (ala Duolingo)

Konteks: Gemini Flash berbayar; generate per soal boros & rawan spam.

Keputusan: **Bulk prompt = 1 request Gemini menghasilkan 3–8 soal sekaligus** (sesuai `quizSchema.questions 3..8`) dengan `kbContext` level-filtered sebagai context. Hitung `quiz_calls` per `profileId` di Edge Function sebelum panggil Gemini (10/menit, 50/jam) → 429 jika lewat. Mainkan cache: `kbContext` per `moduleId+level` di-cache di Edge Function (TTL pendek) agar modul yang sama tidak query KB berulang; Duolingo-style — sesi kuis = 1 bulk call, bukan N call.

