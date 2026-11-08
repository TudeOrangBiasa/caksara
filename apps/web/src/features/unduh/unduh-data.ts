import type { LucideIcon } from "lucide-react";
import { AppWindow, Smartphone, Terminal } from "lucide-react";

/**
 * SSOT matriks Unduh (CONTEXT.md + ADR-0014 + Pencil IpWol).
 * Tiga artefak: Linux .AppImage saja, Windows .exe (nsis 64-bit),
 * Android .apk (Capacitor). Tanpa iPhone: iOS out of scope (ADR-0014).
 * Ikon lucide per kartu (Pencil: android/windows/terminal).
 * Setiap tombol menaut LANGSUNG ke aset rilis (Rule 1 CTA jujur):
 * label "Unduh" = berkas terunduh, bukan halaman daftar.
 */
export interface UnduhArtifact {
  id: "linux" | "windows" | "android";
  title: string;
  spec: string;
  desc: string;
  filePattern: string;
  file: string;
  href: string;
  icon: LucideIcon;
}

export const UNDUH_RELEASE_TAG = "v1.0.0";

const RELEASE_DOWNLOAD = `https://github.com/TudeOrangBiasa/caksara/releases/download/${UNDUH_RELEASE_TAG}`;

export const UNDUH_ARTIFACTS: UnduhArtifact[] = [
  {
    id: "android",
    title: "Android",
    spec: "ANDROID 8.0+ • APK",
    desc: "Aplikasi resmi Caksara. Belajar offline, sinkron otomatis saat online.",
    filePattern: "caksara.apk",
    file: "caksara.apk",
    href: `${RELEASE_DOWNLOAD}/caksara.apk`,
    icon: Smartphone,
  },
  {
    id: "windows",
    title: "Windows",
    spec: "WINDOWS 10 / 11 • 64-BIT • .EXE",
    desc: "Aplikasi desktop resmi. Portable tanpa instal, bisa offline.",
    filePattern: "CAKSARA-*-win-x64.exe",
    file: "CAKSARA-1.0.0-win-x64.exe",
    href: `${RELEASE_DOWNLOAD}/CAKSARA-1.0.0-win-x64.exe`,
    icon: AppWindow,
  },
  {
    id: "linux",
    title: "Linux",
    spec: "LINUX • 64-BIT • .APPIMAGE",
    desc: "Build resmi untuk Linux. Satu berkas AppImage, jalan di semua distro modern.",
    filePattern: "CAKSARA-*.AppImage",
    file: "CAKSARA-1.0.0.AppImage",
    href: `${RELEASE_DOWNLOAD}/CAKSARA-1.0.0.AppImage`,
    icon: Terminal,
  },
];

export const UNDUH_RELEASES_URL = `https://github.com/TudeOrangBiasa/caksara/releases/tag/${UNDUH_RELEASE_TAG}`;
