/**
 * Token governance: nilai di sini adalah mirror normatif dari
 * `packages/ui/src/styles/globals.css` (`:root` = light, `.dark` = dark).
 * Aturan: token baru → catat di ADR dulu, jangan hardcode hex/oklch di komponen.
 * Pakai `bg-primary`, `text-muted-foreground`, dsb. — bukan nilai literal.
 */
import { z } from "zod";

const oklch = z.string().regex(/^oklch\(.+\)$/u, "expected oklch(...)");

export const tokenSchema = z.object({
  /** CTA utama, modul aktif, tombol pill. Jangan: teks kecil di atasnya tanpa foreground. */
  primary: oklch.describe("CTA & active states; pair with primaryForeground"),
  /** Teks di atas primary. Jangan: dipakai di luar permukaan primary. */
  primaryForeground: oklch.describe("Text on primary surfaces only"),
  /** Permukaan sekunder netral. Jangan: untuk CTA. */
  secondary: oklch.describe("Secondary surfaces, not CTAs"),
  /** Teks di atas secondary. */
  secondaryForeground: oklch.describe("Text on secondary surfaces"),
  /** Latar redup (track progress, chip). Jangan: teks penting di atasnya. */
  muted: oklch.describe("Muted tracks & chips"),
  /** Teks sekunder/deskripsi. Jangan: untuk judul atau aksi. */
  mutedForeground: oklch.describe("Secondary text only, never headings"),
  /** Aksen emas: highlight & XP. Jangan: jadi warna CTA kedua. */
  accent: oklch.describe("Gold highlight & XP; single accent lock"),
  /** Teks di atas accent. */
  accentForeground: oklch.describe("Text on accent surfaces"),
  /** Hati habis, reset, error. Jangan: untuk sukses/info. */
  destructive: oklch.describe("Errors & destructive actions"),
  /** Berhasil, selesai, XP positif. */
  success: oklch.describe("Success states"),
  /** Peringatan streak. */
  warning: oklch.describe("Warnings"),
  /** Tile mastery yang belum dipelajari. */
  masteryBelum: oklch.describe("Unlearned mastery tile"),
  /** Tile mastery tahap dipahami. */
  masteryDipahami: oklch.describe("In-progress mastery tile"),
  /** Tile mastery tahap ahli. */
  masteryAhli: oklch.describe("Mastered tile"),
  /** Garis pembatas. Jangan: bayangan hitam pekat. */
  border: oklch.describe("Hairline dividers"),
  /** Latar input. */
  input: oklch.describe("Input backgrounds"),
  /** Fokus ring aksesibilitas. */
  ring: oklch.describe("Focus rings"),
  /** Radius dasar 1rem; kartu pakai 3xl. Jangan: radius acak per komponen. */
  radius: z.string().describe("Base radius; cards use 3xl"),
});

export type Tokens = z.infer<typeof tokenSchema>;

export const tokens = {
  light: {
    primary: "oklch(0.58 0.17 40)",
    primaryForeground: "oklch(0.985 0 0)",
    secondary: "oklch(0.955 0 0)",
    secondaryForeground: "oklch(0.35 0.05 38)",
    muted: "oklch(0.955 0 0)",
    mutedForeground: "oklch(0.5 0.02 45)",
    accent: "oklch(0.72 0.14 75)",
    accentForeground: "oklch(0.2 0.05 38)",
    destructive: "oklch(0.58 0.22 27)",
    success: "oklch(0.62 0.15 145)",
    warning: "oklch(0.75 0.14 65)",
    masteryBelum: "oklch(0.955 0 0)",
    masteryDipahami: "oklch(0.72 0.14 75)",
    masteryAhli: "oklch(0.55 0.13 38)",
    border: "oklch(0.91 0 0)",
    input: "oklch(0.91 0 0)",
    ring: "oklch(0.58 0.17 40)",
    radius: "1rem",
  },
  dark: {
    primary: "oklch(0.65 0.19 40)",
    primaryForeground: "oklch(0.99 0 0)",
    secondary: "oklch(0.24 0.012 260)",
    secondaryForeground: "oklch(0.985 0 0)",
    muted: "oklch(0.24 0.012 260)",
    mutedForeground: "oklch(0.68 0.02 260)",
    accent: "oklch(0.76 0.15 75)",
    accentForeground: "oklch(0.99 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    success: "oklch(0.72 0.16 145)",
    warning: "oklch(0.78 0.13 65)",
    masteryBelum: "oklch(0.24 0.012 260)",
    masteryDipahami: "oklch(0.76 0.15 75)",
    masteryAhli: "oklch(0.65 0.19 40)",
    border: "oklch(1 0 0 / 9%)",
    input: "oklch(1 0 0 / 14%)",
    ring: "oklch(0.65 0.19 40)",
    radius: "1rem",
  },
} satisfies Record<string, Tokens>;
