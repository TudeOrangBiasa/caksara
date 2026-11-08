# Shell Android — Capacitor (#100, ADR-0014)

Wrap `apps/web` untuk **Android saja** (`appId app.caksara.web`). Platform
Apple out of scope: jangan commit `ios/`, jangan sentuh Xcode/App Store
sampai keputusan baru (#99).

- JDK **21+** + Android SDK (API 34) + `local.properties` menunjuk `sdk.dir`.
  Alasan: AGP 8.13 + `capacitor-android` 8.6 menetapkan
  `sourceCompatibility = JavaVersion.VERSION_21` — JDK 17 gagal dengan
  `invalid source release: 21`. `org.gradle.java.home` wajib ke JDK 21 di
  `android/gradle.properties` (daemon bisa mengabaikan `JAVA_HOME` shell).
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

## APK rilis (v1.0.0)

`android/` gitignored — signing rilis reproducible via env, bukan file
commit. Keystore sekali buat, simpan di `~/.local/share/caksara/` (chmod 600):

```bash
export JAVA_HOME=~/.local/share/jdk-21   # AGP 8.13 butuh JDK 21+
keytool -genkeypair -keystore ~/.local/share/caksara/caksara-release.jks \
  -alias caksara -keyalg RSA -keysize 2048 -validity 9125
export CAKSARA_KEYSTORE=~/.local/share/caksara/caksara-release.jks
export CAKSARA_STOREPASS=… CAKSARA_KEYALIAS=caksara CAKSARA_KEYPASS=…
./gradlew assembleRelease --no-daemon   # → app/build/outputs/apk/release/app-release.apk
cp app/build/outputs/apk/release/app-release.apk ~/caksara-rilis-v1.0.0/caksara.apk
```

`android/app/build.gradle` membaca keempat env di atas (fallback keystore
`/tmp` hanya untuk dev lokal). Nama rilis final: `caksara.apk` (sesuai
kolom `file` di `unduh-data.ts`).

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
