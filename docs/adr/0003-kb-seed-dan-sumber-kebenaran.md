# KB sebagai Sumber Kebenaran & Seeding Awal

Konteks: soal & jawaban Guru Virtual harus bisa ditelusuri ke data resmi agar tidak dinilai mengarang oleh juri; Gemini harus di-grounding.

Keputusan: `kb_entries` adalah sumber kebenaran. Seed awal dari `data/wresastra.json` (18 aksara), `data/lessons.json` (32 soal fallback), `data/faq-data.json` (18 FAQ), `data/scope-pembelajaran.json` — tiap baris diberi `category` (aksara/kosakata/budaya), `level` 1–3, dan `source` (Parasali/SIBALUKARING/Unicode/KamusBali). Soal generate: query KB by category+level → masukkan sebagai `kbContext` di prompt Gemini (temp 0.3, responseSchema = quizSchema Zod) → validasi Zod → retry 2–3× → fallback statis.

Konsekuensi: adaptif naik/turun level bukan dengan menyuruh Gemini "bikin gampang", tapi dengan mengganti `level` KB yang diambil.
