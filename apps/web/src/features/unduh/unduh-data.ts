/**
 * SSOT matriks Unduh (CONTEXT.md + ADR-0014 + Pencil IpWol).
 * Tiga artefak: Linux .AppImage saja, Windows .exe (nsis 64-bit),
 * Android .apk (Capacitor). Tanpa kartu keempat: platform Apple out
 * of scope. Tautan = GitHub Releases latest per pola nama
 * electron-builder / Capacitor; kosong sampai CI rilis (PR3)
 * mengunggah aset pertama.
 */
export interface UnduhArtifact {
  id: "linux" | "windows" | "android";
  title: string;
  spec: string;
  desc: string;
  filePattern: string;
  href: string | null;
}

const RELEASE_LATEST = "https://github.com/TudeOrangBiasa/caksara/releases/latest";

export const UNDUH_ARTIFACTS: UnduhArtifact[] = [
  {
    id: "android",
    title: "Android",
    spec: "ANDROID 8.0+ • APK",
    desc: "Aplikasi resmi Caksara. Belajar offline, sinkron otomatis saat online.",
    filePattern: "caksara.apk",
    href: null,
  },
  {
    id: "windows",
    title: "Windows",
    spec: "WINDOWS 10 / 11 • 64-BIT • .EXE",
    desc: "Installer resmi. Ringan, bisa offline, terpasang seperti aplikasi desktop biasa.",
    filePattern: "CAKSARA-*-win-x64.exe",
    href: null,
  },
  {
    id: "linux",
    title: "Linux",
    spec: "LINUX • 64-BIT • .APPIMAGE",
    desc: "Build resmi untuk Linux. Satu berkas AppImage, jalan di semua distro modern.",
    filePattern: "CAKSARA-*.AppImage",
    href: null,
  },
];

export const UNDUH_RELEASES_URL = RELEASE_LATEST;
