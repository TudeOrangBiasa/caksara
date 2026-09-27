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
  /** Berhasil, selesai, XP positif. Jangan: fill CTA light (gagal AA putih) — pakai cta. */
  success: oklch.describe("Success states"),
  /** Fill CTA Duo: success yang digelapkan khusus CTA (AA 4.95:1 light, 7.26:1 dark). */
  cta: oklch.describe("Duo CTA fill; dark equals success"),
  /** Tepi/bayangan CTA Duo: selalu lebih gelap dari cta se-mode. Tanpa teks di atasnya. */
  ctaEdge: oklch.describe("Duo CTA edge shadow, darker than cta"),
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
  /** Hard edge-shadow Duo y+4 no-blur. */
  shadowDuo: z.string().describe("Duo hard edge shadow y+4"),
  /** Radius pill CTA Duo. */
  radiusPill: z.string().describe("Duo CTA pill radius"),
  /** Radius dasar 0.75rem M3 medium; kartu pakai 3xl. Jangan: radius acak per komponen. */
  radius: z.string().describe("Base radius; cards use 3xl"),
});

export type Tokens = z.infer<typeof tokenSchema>;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/u, "expected #rrggbb");

/**
 * Token ilustrasi & cetak (maskot Bedawang, konfeti, kartu PNG): HEX tetap,
 * sama di light/dark (ADR-0011). Jangan: untuk teks UI, CTA, atau state.
 */
export const illustrationTokenSchema = z.object({
  /** Cangkang maskot. */
  bedawangShell: hex.describe("Mascot shell"),
  /** Sorot cangkang maskot. */
  bedawangShellEdge: hex.describe("Mascot shell highlight"),
  /** Garis & bayangan cangkang. */
  bedawangShellDark: hex.describe("Mascot shell lines"),
  /** Kepala maskot. */
  bedawangHead: hex.describe("Mascot head"),
  /** Bayangan kepala. */
  bedawangHeadDark: hex.describe("Mascot head shade"),
  /** Kaki/sirip maskot. */
  bedawangLeg: hex.describe("Mascot limbs"),
  /** Perut & ombak. */
  bedawangBelly: hex.describe("Mascot belly"),
  /** Mata, mulut, garis wajah. */
  bedawangInk: hex.describe("Mascot line art"),
  /** Kilau mata. */
  bedawangHighlight: hex.describe("Mascot eye sparkle"),
  /** Pipi merona. */
  bedawangBlush: hex.describe("Mascot blush"),
  /** Air mata & aksen mood. */
  bedawangGem: hex.describe("Mascot tear accent"),
  /** Konfeti emas 1-6 (terang ke gelap). */
  confetti1: hex.describe("Confetti gold 1"),
  confetti2: hex.describe("Confetti gold 2"),
  confetti3: hex.describe("Confetti gold 3"),
  confetti4: hex.describe("Confetti gold 4"),
  confetti5: hex.describe("Confetti gold 5"),
  confetti6: hex.describe("Confetti gold 6"),
  /** Kertas kartu prestasi. */
  cardBg: hex.describe("Share card paper"),
  /** Kartu statistik & panel kartu. */
  cardBgDeep: hex.describe("Share card panel"),
  /** Teks kartu. */
  cardInk: hex.describe("Share card text"),
  /** Teks sekunder kartu. */
  cardMuted: hex.describe("Share card secondary text"),
  /** Garis kartu. */
  cardLine: hex.describe("Share card hairline"),
  /** Aksen terracotta kartu. */
  cardPrimary: hex.describe("Share card accent"),
  /** Varian gelap aksen kartu. */
  cardPrimaryDark: hex.describe("Share card accent dark"),
  /** Emas kartu (avatar, pemisah). */
  cardGold: hex.describe("Share card gold"),
  /** Teks di atas aksen kartu. */
  cardCream: hex.describe("Share card on-accent text"),
  /** Putih kartu. */
  cardWhite: hex.describe("Share card white"),
  /** Tile mastery belum/dipahami/ahli di kartu. */
  cardMasteryBelum: hex.describe("Share card unlearned tile"),
  cardMasteryDipahami: hex.describe("Share card learning tile"),
  cardMasteryAhli: hex.describe("Share card mastered tile"),
  /** Teks status mastery di kartu. */
  cardStatusBelum: hex.describe("Share card unlearned label"),
  cardStatusDipahami: hex.describe("Share card learning label"),
  cardStatusAhli: hex.describe("Share card mastered label"),
});

export type IllustrationTokens = z.infer<typeof illustrationTokenSchema>;

export const illustrationTokens = {
  bedawangShell: "#b85c32",
  bedawangShellEdge: "#d98a52",
  bedawangShellDark: "#8f4526",
  bedawangHead: "#e59a6b",
  bedawangHeadDark: "#b76a3d",
  bedawangLeg: "#d9824f",
  bedawangBelly: "#f6e7c9",
  bedawangInk: "#3a2417",
  bedawangHighlight: "#ffffff",
  bedawangBlush: "#e58a74",
  bedawangGem: "#8ecae6",
  confetti1: "#f59e0b",
  confetti2: "#fbbf24",
  confetti3: "#fcd34d",
  confetti4: "#fde68a",
  confetti5: "#d97706",
  confetti6: "#b45309",
  cardBg: "#faf1e2",
  cardBgDeep: "#f1dfc2",
  cardInk: "#3a2a1c",
  cardMuted: "#7a6350",
  cardLine: "#e3cdab",
  cardPrimary: "#b05a30",
  cardPrimaryDark: "#873f1e",
  cardGold: "#d9a441",
  cardCream: "#fff8ec",
  cardWhite: "#ffffff",
  cardMasteryBelum: "#d6c8b6",
  cardMasteryDipahami: "#e0b24f",
  cardMasteryAhli: "#b05a30",
  cardStatusBelum: "#7a6350",
  cardStatusDipahami: "#6b4b12",
  cardStatusAhli: "#fff8ec",
} satisfies IllustrationTokens;

export const tokens = {
  light: {
    primary: "oklch(0.55 0.13 38)",
    primaryForeground: "oklch(0.985 0 0)",
    secondary: "oklch(0.92 0.03 85)",
    secondaryForeground: "oklch(0.35 0.08 38)",
    muted: "oklch(0.97 0.01 85)",
    mutedForeground: "oklch(0.56 0.02 45)",
    accent: "oklch(0.72 0.14 75)",
    accentForeground: "oklch(0.2 0.05 38)",
    destructive: "oklch(0.58 0.22 27)",
    success: "oklch(0.62 0.15 145)",
    cta: "oklch(0.52 0.15 145)",
    ctaEdge: "oklch(0.45 0.14 145)",
    warning: "oklch(0.75 0.14 65)",
    masteryBelum: "oklch(0.97 0.01 85)",
    masteryDipahami: "oklch(0.72 0.14 75)",
    masteryAhli: "oklch(0.55 0.13 38)",
    border: "oklch(0.92 0.01 85)",
    input: "oklch(0.92 0.01 85)",
    ring: "oklch(0.55 0.13 38)",
    radius: "0.75rem",
    shadowDuo: "0 4px 0 0 var(--cta-edge)",
    radiusPill: "999px",
  },
  dark: {
    primary: "oklch(0.7 0.12 38)",
    primaryForeground: "oklch(0.145 0 0)",
    secondary: "oklch(0.27 0.02 45)",
    secondaryForeground: "oklch(0.985 0 0)",
    muted: "oklch(0.27 0.02 45)",
    mutedForeground: "oklch(0.708 0.02 45)",
    accent: "oklch(0.72 0.14 75)",
    accentForeground: "oklch(0.985 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    success: "oklch(0.68 0.14 145)",
    cta: "oklch(0.68 0.14 145)",
    ctaEdge: "oklch(0.55 0.14 145)",
    warning: "oklch(0.78 0.13 65)",
    masteryBelum: "oklch(0.27 0.02 45)",
    masteryDipahami: "oklch(0.72 0.14 75)",
    masteryAhli: "oklch(0.7 0.12 38)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.7 0.12 38)",
    radius: "0.75rem",
    shadowDuo: "0 4px 0 0 var(--cta-edge)",
    radiusPill: "999px",
  },
} satisfies Record<string, Tokens>;

/**
 * Token depth minimal premium (bukan oklch murni, multi-shadow + inset).
 * Terpisah dari `tokenSchema` 19 field. Mirror normatif dari
 * `packages/ui/src/styles/globals.css` (`:root` = light, `.dark` = dark).
 */
export const depthTokenSchema = z.object({
  /** Bayangan halus kartu standar. */
  shadowSm: z.string().describe("Subtle card shadow"),
  /** Bayangan sedang hero dan nav mengambang. */
  shadowMd: z.string().describe("Hero and floating nav shadow"),
  /** Bayangan besar hero dan nav mengambang. */
  shadowLg: z.string().describe("Large hero shadow"),
  /** Kilau atas hero dan nav mengambang. */
  highlight: z.string().describe("Top highlight for hero and nav"),
});

export type DepthTokens = z.infer<typeof depthTokenSchema>;

export const depthTokens = {
  light: {
    shadowSm: "0 1px 2px oklch(0.35 0.05 38 / 8%), 0 1px 3px oklch(0.35 0.05 38 / 6%)",
    shadowMd: "0 4px 12px oklch(0.35 0.05 38 / 12%), 0 2px 4px oklch(0.35 0.05 38 / 8%)",
    shadowLg: "0 12px 32px oklch(0.35 0.05 38 / 18%), 0 4px 8px oklch(0.35 0.05 38 / 10%)",
    highlight: "inset 0 1px 0 oklch(1 0 0 / 55%)",
  },
  dark: {
    shadowSm: "0 1px 2px oklch(0 0 0 / 30%), 0 1px 3px oklch(0 0 0 / 24%)",
    shadowMd: "0 4px 12px oklch(0 0 0 / 40%), 0 2px 4px oklch(0 0 0 / 30%)",
    shadowLg: "0 12px 32px oklch(0 0 0 / 55%), 0 4px 8px oklch(0 0 0 / 40%)",
    highlight: "inset 0 1px 0 oklch(1 0 0 / 8%)",
  },
} satisfies Record<string, DepthTokens>;
