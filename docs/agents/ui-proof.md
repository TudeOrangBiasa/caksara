# UI Proof — bukti visual PR (FE wajib)

Setiap PR yang menyentuh tampilan wajib melampirkan bukti visual yang diambil
dengan [agent-browser](https://agent-browser.dev/) — CLI browser automation
untuk AI agent (snapshot accessibility tree + screenshot + recording).
Aturan lampiran mengikuti pola `pr-screenshots`
(github/awesome-copilot): before/after langsung di body PR, tanpa `<details>`.

## Install (sekali per mesin)

```bash
npm i -g agent-browser && agent-browser install
# atau sekali jalan tanpa install global:
# command -v agent-browser || npm i -g agent-browser && agent-browser install
```

`agent-browser install` mengunduh Chrome versi cocok. Tanpa ini semua perintah
di bawah gagal — `scripts/proof-ui.ts` berhenti dengan pesan install bila CLI
tidak ditemukan. Butuh rekaman video? Pastikan `ffmpeg` ada (`which ffmpeg`).

## Alur bukti (tiap PR UI)

1. Jalankan permukaan yang diubah: `bun run dev` (web di 5173).
2. Ambil bukti otomatis:

   ```bash
   bun run proof:ui -- http://localhost:5173 docs/proof/<nama-pr-atau-tiket>
   ```

   Hasil: `onboarding-mobile-390.png`, `onboarding-desktop-1280.png`,
   `onboarding-dark-1280.png`, `dashboard-desktop-1280.png`, `flow.webm`.

3. Untuk permukaan lain (modul terkunci, validasi nama, empty state), gerakkan
   manual lalu ambil:

   ```bash
   agent-browser open http://localhost:5173
   agent-browser snapshot            # cari ref, misal @e3
   agent-browser set viewport 390 844
   agent-browser screenshot docs/proof/<tiket>/modul-terkunci-390.png
   agent-browser record start docs/proof/<tiket>/toast.webm
   agent-browser click @e3
   agent-browser record stop
   ```

## Perintah inti

| Buka + snapshot | `open <url>`, `snapshot` |
| Viewport | `set viewport 390 844` / `set viewport 1280 800` |
| Tema (app class-based, root.tsx) | klik toggle `Ganti ke mode...` dari snapshot, bukan `set media` |
| Foto | `screenshot <path>` |
| Rekam | `record start <path.webm>` … `record stop` (butuh ffmpeg) |
| Tutup | `close --all` |

Detail selalu versi-terkini dari CLI (tidak disalin ke sini supaya tidak basi):

```bash
agent-browser skills get core         # pola + troubleshooting
agent-browser skills get core --full  # referensi perintah lengkap
```

## Aturan lampiran (pr-screenshots)

- Before/after langsung di body PR (`## Screenshots`), jangan dalam `<details>`.
- Satu-dua kalimat per gambar: apa yang harus diperhatikan reviewer.
- Pasangan before/after wajib viewport + crop sama.
- Gambar native 1x; batasi tampil dengan `<img src="..." width="600">` bila besar.

## Upload gambar ke PR GitHub

`scripts/lint-pr-body.js` hanya hard-fail pada URL relatif/placeholder —
reachability hanya warn (offline-safe). Praktik repo yang lolos (#186):
`https://raw.githubusercontent.com/<owner>/<repo>/<branch>/docs/proof/<nama>/<file>.png`.
Pola `blob/...?raw=true` juga render untuk member login; `raw.githubusercontent`
404 hanya bila path/branch salah atau repo privat tanpa akses.
Contoh lolos pr-lint: #186, #189.
