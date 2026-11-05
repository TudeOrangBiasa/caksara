# Shell desktop CAKSARA — Electron + Supabase Google OAuth (#101)

Rujukan: ADR-0014, #99 (Q2=Electron, Tauri out of scope), #89
(`apps/web/src/lib/auth-google.ts` — `signInWithOAuth({ provider: 'google' })`).

## Arsitektur

- `apps/desktop/src/main.ts` — proses utama: `BrowserWindow` + loopback
  OAuth + protokol kustom. Dev memuat `http://localhost:5173/`,
  prod `loadFile(apps/web/build/client/index.html)`.
- `apps/desktop/src/preload.ts` — jembatan IPC aman via
  `contextBridge` (`window.caksaraDesktop`, tanpa node di renderer).
- `apps/desktop/electron-builder.json` — config packaging
  (AppImage/deb; skema `caksara://`).
- `apps/desktop/caksara.desktop` — entri Linux
  (`MimeType=x-scheme-handler/caksara`).
- `scripts/desktop-smoke.js` — smoke tanpa packaging: cek sumber,
  config, dan dist bila ada.

Keamanan: `webPreferences { preload, contextIsolation: true,
nodeIntegration: false, sandbox: true }`. Link eksternal dibuka di
browser sistem (`shell.openExternal`), bukan di shell.

## Build web untuk desktop (SPA)

Shell memuat **file lokal**, jadi web dibangun sekali dalam mode SPA —
bukan mode SSR deploy Vercel. Hasilnya
`apps/web/build/client/index.html` + `assets/`:

```bash
bun run desktop:web
```

Skrip itu membangun dengan `CAKSARA_SPA=1`, yang mengaktifkan
`ssr: false` di `react-router.config.ts`. Verifikasi:

```bash
ls apps/web/build/client/index.html
```

Tanpa `index.html` ini, `desktop:smoke` lolos dengan catatan
"dist belum ada" dan shell prod menampilkan halaman kosong — bangun
dulu sebelum packaging. Mode SSR default (`bun run build`) tidak
berubah; deploy Vercel tetap SSR.

## OAuth Google di desktop

FE memakai ulang alur #89: `signInWithOAuth({ provider: 'google',
options: { redirectTo } })`. Di desktop, `redirectTo` diisi dari IPC
`caksara:auth-redirect` (loopback) dan hasilnya kembali lewat
`caksara:auth-callback` — kode/fragmen ditukar sesi oleh Supabase JS
di renderer, tidak oleh shell.

- Opsi A (utama): loopback `http://127.0.0.1:<port acak>/auth/callback`.
  Port acak per jalan; pola `http://127.0.0.1:*` didaftarkan di
  Supabase Redirect URLs. Server hanya hidup sampai satu callback.
- Opsi B (fallback): protokol `caksara://auth/callback` via
  `app.setAsDefaultProtocolClient('caksara')`. Di Linux didukung entri
  `.desktop` + MimeType; electron-builder menulis `MimeType` yang sama
  ke paket.

## Allowlist (dashboard, oleh manusia)

Di Supabase Dashboard > Authentication > URL Configuration >
Redirect URLs, tambahkan:

- `http://127.0.0.1:*` (loopback desktop)
- `caksara://auth/callback` (fallback protokol)

Aktifkan provider Google bila belum. Tidak ada URL rahasia di repo.

## Perintah

```bash
bun run dev:web          # terminal 1: server Vite web
bun run desktop:dev      # terminal 2: shell dev (electron .)
bun run desktop:web      # build SPA web untuk shell prod
bun run desktop:build    # tsc shell (dist/ gitignored)
bun run desktop:smoke    # validasi sumber + config tanpa packaging
```

## Batas jujur + gerbang manusia

`desktop:smoke` memvalidasi sumber dan config, **bukan** launch GUI,
bukan screenshot Playwright `_electron`, bukan packaging. Sebelum
merge, manusia menjalankan di mesin ber-GUI (Fedora):

1. `bun run desktop:dev` menampilkan CAKSARA, devtools tanpa error.
2. `bun run desktop:web && CAKSARA_DESKTOP_PROD=1 bun run desktop:dev`
   memuat `index.html` lokal.
3. Alur Google end-to-end setelah allowlist dashboard terisi.
4. Packaging (`electron-builder --linux`) di luar PR ini.

Web Speech: shell tidak mengubah guard ucap FE — renderer Electron
(Chromium) memakai guard `window.location.origin` yang sama; bila API
tidak ada, tombol sembunyi seperti di web.
