# Smoke Capacitor Android (#100) — config-only, tanpa JDK/SDK

Tanggal: 2026-11-04 · Branch: `feat/final-capacitor-100` dari `develop` (HEAD 6842b0e)
Proof dir: `docs/proof/cap-android-100/` (REPORT ini saja — backend-only, tanpa screenshot UI)

## Perintah + hasil (real, di worktree ini)

```text
$ bun test apps/web/src/lib/auth-google.test.ts
14 pass, 0 fail, 29 expect() calls — Ran 14 tests across 1 file

$ bun run check-types
@caksara/ui check-types: Exited with code 0

$ bunx oxlint
0 error (peringatan shadcn/max-lines pre-existing + 2 unicorn di hash #89,
tidak ada error baru dari file #100)

$ bun run build
react-router build → apps/web/build/client + apps/web/build/server ✓
compiled successfully in 1.01s

$ bunx cap doctor
@capacitor/cli 8.6.0 · @capacitor/core 8.6.0 · @capacitor/android 8.6.0
@capacitor/ios: not installed (sesuai ADR-0014: tanpa iOS)

$ curl home → 200 + judul "CAKSARA | Aksara Bali"
$ curl /auth/callback?code=smoke → 200 + SSR "Menyiapkan akunmu..."
(dev server port 5174; 5173 dipakai worktree tetangga wt-n-electron)
```

## Batas jujur (kenapa `cap sync` tidak hijau di sini)

```text
$ bunx cap sync
[error] The web assets directory (./apps/web/build/client) must contain
an index.html file.
```

Dua fakta digabung menjelaskan ini — keduanya di luar kode PR:

1. `apps/web/build/client` memang tidak berisi `index.html`: React Router 8
   mengeluarkan SPA client (`assets/*.js` termasuk `auth.callback-*.js`)
   yang selalu di-serve lewat `build/server/index.js` (SSR/hidrasi),
   bukan file statis mandiri.
2. Tidak ada JDK/Android SDK di mesin ini (`which java` → kosong), jadi
   `android/` tidak bisa dihasilkan (`bunx cap add android` butuh
   toolchain) dan `android/` tetap gitignored sesuai kontrak tiket.

Artinya: validasi yang BISA dibuktikan di sini adalah config terbaca
(`cap doctor` hijau, pinned 8.6.0/8.1.2/8.0.5/8.0.2/8.0.1), web build
tidak rusak, route `/auth/callback` 200, dan parse deep-link diuji unit.
Yang BELUM terbukti dan menjadi gerbang manusia: `cap add android` +
`cap sync` + `assembleDebug` + uji OAuth dingin di emulator — lihat
"Gerbang manusia" di bawah.

## Konfigurasi yang di-commit (intisari)

- `capacitor.config.ts`: `appId app.caksara.web`, `appName Caksara`,
  `webDir apps/web/build/client`, plugin SplashScreen
  (`backgroundColor #faf1e2` = `--card-bg`, `launchShowDuration` 1500,
  `launchAutoHide`, tanpa spinner).
- `package.json`: `cap:sync` = `bunx cap sync`, `cap:android` =
  `bunx cap open android`; devDeps `@capacitor/core|cli 8.6.0`,
  deps `@capacitor/android 8.6.0`, `app 8.1.2`, `browser 8.0.5`,
  `splash-screen 8.0.2`, `preferences 8.0.1` (pinned, lockfile ikut).
- FE (`apps/web/src`): `auth-google.ts` — konstanta
  `NATIVE_AUTH_SCHEME/PATH/REDIRECT`, `isNativeAuthCallback`,
  `parseNativeAuthCallback` (PKCE `code` query + implicit
  `access_token`/`refresh_token` fragment), `exchangeNativeAuthCallback`
  (`exchangeCodeForSession` diutamakan, `setSession` cadangan),
  `startGoogleLogin` cabang native (`redirectTo` scheme,
  `skipBrowserRedirect`, `Browser.open`, fallback URL mentah);
  `use-native-auth-deep-link.ts` — listener `appUrlOpen` impor-dinamis
  (no-op di web); `routes/auth.callback.tsx` — route `/auth/callback`
  (settle → migrasi #89 → `/`, gagal → EmptyState); `_index.tsx` —
  panggil hook sekali.
- `docs/android-capacitor.md`: prasyarat JDK/SDK, alur build, snippet
  intent-filter `AndroidManifest.xml`, speech guard, batas server-bundle.
- `README.md`: redirect ketiga `app.caksara.web://auth/callback`.
- `.gitignore`: `android/`, `local.properties` tidak di-commit.

## Gerbang manusia (wajib sebelum merge)

1. Dashboard Supabase > Authentication > URL Configuration > Redirect URLs:
   tambah `app.caksara.web://auth/callback` (Tude, manual).
2. Mesin ber-JDK 17 + Android SDK API 34: `bun run build`,
   `bunx cap add android`, terapkan intent-filter
   (`docs/android-capacitor.md`), `bunx cap sync`, `assembleDebug`.
3. Emulator/device: splash → onboarding → Modul 1; Google OAuth dingin
   (`appUrlOpen` → sesi + toast "Tersimpan pakai Google"); tombol TTS
   sembunyi aman tanpa voice.
