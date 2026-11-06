# Audio pelafalan Bali — kurasi Mendeley (#105)

## Sumber

"Balinese Text-to-Speech Dataset as Digital Cultural Heritage",
Mendeley Data, DOI **10.17632/6syjwz24v5.2** (versi 2, 2024-12-30),
1187 rekaman native speaker.
https://data.mendeley.com/datasets/6syjwz24v5/2

Kontributor (dataset): I Gusti Agung Gede Arya Kadyanan, Ngurah Agus
Sanjaya ER, Anak Agung Istri Eka Karyawati, I Gede Ngurah Arya Wira
Putra, I Made Suma Gunawan, Ni Made Julia Budiantari, dkk.

## Lisensi: CC BY 4.0

Pakai ulang dengan atribusi wajib + tautan lisensi + tandai perubahan:
https://creativecommons.org/licenses/by/4.0/

Atribusi tampil di: badge "Suara asli Bali · CC BY 4.0" (detail KB),
catatan sumber (detail KB + Tentang), README repo.

## Kurasi → klip lokal (10 berkas, ±147 KB)

Konversi: WAV 48 kHz stereo → mp3 mono 22050 Hz 64 kbps
(`ffmpeg -ac 1 -ar 22050 -b:a 64k`).
sha256 = hash berkas sumber Mendeley (16 hex awal).

| Klip lokal           | Berkas sumber              | Bytes sumber | sha256 sumber       |
| -------------------- | -------------------------- | ------------ | ------------------- |
| `ba.mp3`             | `Alfabet_B.wav`            | 215820       | `71c1eaa0efd1eb34…` |
| `ca.mp3`             | `Alfabet_C.wav`            | 206416       | `4408a25514a6fd9e…` |
| `da.mp3`             | `Alfabet_D.wav`            | 168120       | `d460a28e80fd20f2…` |
| `ga.mp3`             | `Alfabet_G.wav`            | 219132       | `0e623b55ed2e001b…` |
| `ka.mp3`             | `Alfabet_K.wav`            | 162476       | `445b022dab744fc2…` |
| `matur-suksma.mp3`   | `Frasa_Matur suksma.wav`   | 446076       | `93dd312548cc58c2…` |
| `pengampura.mp3`     | `Asi_Pengampura.wav`       | 576044       | `d1117c6b2c8ab2d0…` |
| `sampun-ngajeng.mp3` | `Frasa_Sampun ngajeng.wav` | 360300       | `801c6043248311a6…` |
| `wastan-titiang.mp3` | `Frasa_Wastan titiang.wav` | 480968       | `4877c5ac92b38f9a…` |
| `pacanangan.mp3`     | `Asi_Pacanangan.wav`       | 499244       | `d8eb99a56dd9028b…` |

Pemetaan ke entri KB: `kb-data.ts` (`WRESASTRA_AUDIO` + `audioUrl`
di kb_matur_suksma, kb_ampura, kb_madaar_ngajeng, kb_titiang,
kb_canang_sari) — 10 entri.

Catatan jujur: `Alfabet_*` merekam abjad Latin (diucapkan "be", "ce",
…), bukan suku kata wresastra ("ba", "ca", …) — dipakai sebagai panduan
bunyi huruf awal. Frasa `sampun ngajeng` / `wastan titiang` /
`pacanangan` / `pengampura` memuat kata KB dalam konteks kalimat, bukan
kata tunggal.

## Langkah Storage untuk Tude (Supabase sedang berhenti)

1. `supabase start`, buat bucket publik `audio`.
2. Unggah 10 mp3 ini ke `/audio/*.mp3` (nama sama).
3. `alter table kb_entries add column audio_url text;` + isi per baris
   dengan URL publik Storage; parser `kb-remote.ts` sudah membaca
   kolom `audio_url` bila ada.
4. Entri lokal tetap menunjuk `/audio/*.mp3` sebagai fallback offline.
