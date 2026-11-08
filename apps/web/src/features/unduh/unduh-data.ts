import type { LucideIcon } from "lucide-react";
import { AppWindow, Smartphone, Terminal } from "lucide-react";

/**
 * SSOT matriks Unduh (CONTEXT.md + ADR-0014 + Pencil IpWol).
 * Tiga artefak: Linux .AppImage saja, Windows .exe (nsis 64-bit),
 * Android .apk (Capacitor). Tanpa iPhone: iOS out of scope (ADR-0014).
 * Ikon lucide per kartu (Pencil: android/windows/terminal).
 * Catatan 2026-11-08: ketiga tombol berlabel "Unduh" padahal hanya membuka
 * halaman daftar rilis, dan `gh release list` hari ini kosong (belum ada rilis).
 * Ini utang Rule 1 CTA jujur di AGENTS.md. Perbaikan jujur: label jadi
 * "Buka halaman rilis", atau nonaktifkan tombol plus tulis "segera hadir",
 * atau tautkan langsung ke aset per artefak setelah rilis v* diterbitkan.
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
