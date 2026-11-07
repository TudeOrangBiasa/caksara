import type { LucideIcon } from "lucide-react";
import { AppWindow, Smartphone, Terminal } from "lucide-react";

/**
 * SSOT matriks Unduh (CONTEXT.md + ADR-0014 + Pencil IpWol).
 * Tiga artefak: Linux .AppImage saja, Windows .exe (nsis 64-bit),
 * Android .apk (Capacitor). Tanpa iPhone: iOS out of scope (ADR-0014).
 * Ikon lucide per kartu (Pencil: android/windows/terminal).
 * Tombol mengarah ke GitHub Releases latest; artefak dibangun lokal
 * via `bun run package:local` (gate website matang dulu) lalu
 * diunggah manual ke tag v*.
 */
export interface UnduhArtifact {
  id: "linux" | "windows" | "android";
  title: string;
  spec: string;
  desc: string;
  filePattern: string;
  icon: LucideIcon;
}

const RELEASE_LATEST = "https://github.com/TudeOrangBiasa/caksara/releases/latest";

export const UNDUH_ARTIFACTS: UnduhArtifact[] = [
  {
    id: "android",
    title: "Android",
    spec: "ANDROID 8.0+ • APK",
    desc: "Aplikasi resmi Caksara. Belajar offline, sinkron otomatis saat online.",
    filePattern: "caksara.apk",
    icon: Smartphone,
  },
  {
    id: "windows",
    title: "Windows",
    spec: "WINDOWS 10 / 11 • 64-BIT • .EXE",
    desc: "Installer resmi. Ringan, bisa offline, terpasang seperti aplikasi desktop biasa.",
    filePattern: "CAKSARA-*-win-x64.exe",
    icon: AppWindow,
  },
  {
    id: "linux",
    title: "Linux",
    spec: "LINUX • 64-BIT • .APPIMAGE",
    desc: "Build resmi untuk Linux. Satu berkas AppImage, jalan di semua distro modern.",
    filePattern: "CAKSARA-*.AppImage",
    icon: Terminal,
  },
];

export const UNDUH_RELEASES_URL = RELEASE_LATEST;
