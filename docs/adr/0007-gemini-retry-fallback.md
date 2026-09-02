# Gemini Retry + Fallback Statis

Konteks: output Gemini bisa tidak lolos Zod, timeout, atau rate-limit; user tidak boleh macet.

Keputusan: validasi `quizSchema` Zod di Edge Function; jika gagal/timeout → retry 2–3× (temp 0.3 tetap). Masih gagal → fallback ke bank statis `lessons.json` (32 soal, 8/modul) dengan toast "offline mode". Selalu ada soal, selalu Zod-valid.

