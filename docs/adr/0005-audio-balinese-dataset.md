# Audio Bali dari Dataset Mendeley + Fallback Latin

Konteks: file `/audio/aksara/*.mp3` belum ada dan Web Speech API tidak punya voice Bali (Dev Guide §7.5). Kandidat rekam manual 26 file vs TTS Latin fallback menggantung di Ronde 1.

Keputusan: pakai dataset **Mendeley Data 6syjwz24v5/2 "Balinese Text-to-Speech Dataset" (1187 rekaman, CC BY 4.0, native speaker, cover Alus Singgih/Mider/Andap + alfabet & frasa)** sebagai sumber audio autentik. Kurasi subset untuk 18 wresastra + 8 sapaan mod_01, normalisasi WAV 44.1kHz/24-bit → mp3, simpan di Supabase Storage `/audio/*`, rujuk via `audioUrl`. Jika entri belum terkurasi, fallback TTS Latin (bukan aksara) dengan badge "Audio Latin (sementara)" — jangan paksa TTS baca aksara.

Konsekuensi: butuh atribusi CC BY 4.0 di halaman KB/Settings, pipeline kurasi & konversi, dan validasi lisensi sebelum rilis juri.
