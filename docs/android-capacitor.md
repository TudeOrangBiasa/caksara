# Shell Android — Capacitor (#100, ADR-0014)

Wrap `apps/web` untuk **Android saja** (`appId app.caksara.web`). Platform
Apple out of scope: jangan commit `ios/`, jangan sentuh Xcode/App Store
sampai keputusan baru (#99).

## Prasyarat (mesin build Tude, bukan repo)

- JDK 17 + Android SDK (API 34) + `local.properties` menunjuk `sdk.dir`.
  `android/` dan `local.properties` gitignored — dihasilkan lokal via
  `bunx cap add android`, tidak pernah di-commit.
- Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
  sudah berisi `app.caksara.web://auth/callback` (allowlist manual oleh
  Tude; tanpa entri ini Supabase menolak callback native).

## Alur build

```bash
bun install
bun run build            # react-router → apps/web/build/client (+ server, diabaikan shell)
bunx cap sync            # salin webDir + sinkron plugin (butuh android/ lokal)
bunx cap open android    # buka Android Studio → Run / Generate APK
```

`capacitor.config.ts` (root): `webDir apps/web/build/client`, plugin
SplashScreen (latar `#faf1e2` = `--card-bg` parchment, auto-hide
1.5 dtk mengikuti splash React). OAuth dibuka di browser sistem via
`@capacitor/browser` agar sesi PKCE utuh; `android/` hanya menampung
intent-filter scheme (lihat bawah) — tidak ada kode otentikasi native.

> Catatan jujur: webDir edisi ini menunjuk `apps/web/build/client`.
> React Router 8 mengeluarkan `build/client` + `build/server`; shell hanya
> memakan aset statis client. Bila suatu hari route butuh loader/action
> server, shell tidak ikut — keputusan itu milik tiket terpisah.

## Intent-filter (diterapkan saat `cap add android`)

Di `android/app/src/main/AndroidManifest.xml` dalam `<activity>` utama:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="app.caksara.web" android:host="auth" android:path="/callback" />
</intent-filter>
```

FE yang menyambut (`apps/web/src`): route `/auth/callback`
(`routes/auth.callback.tsx`) menukar `code` PKCE / token implicit via
`exchangeNativeAuthCallback` (`lib/auth-google.ts`), hook
`useNativeAuthDeepLink` meneruskan event `appUrlOpen` saat app sudah
hidup, dan `startGoogleLogin` memakai `redirectTo` scheme +
`Browser.open` saat `window.Capacitor` ada. Detail alur + batas
diketahui: `docs/proof/cap-android-100/REPORT.md`.

## Web Speech di WebView

Guard `lib/speech.ts` tidak berubah: tombol TTS disembunyikan bila
`speechSynthesis` absen, `speakLatin` no-op tanpa throw. WebView
Android umumnya tanpa voice id-ID — pengguna tetap dapat audio kurasi
Mendeley di entri KB yang sudah terkurasi.
