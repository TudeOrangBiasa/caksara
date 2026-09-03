import { z } from "zod";

const oklch = z.string().regex(/^oklch\(.+\)$/u, "expected oklch(...)");

export const tokenSchema = z.object({
  primary: oklch,
  primaryForeground: oklch,
  secondary: oklch,
  secondaryForeground: oklch,
  muted: oklch,
  mutedForeground: oklch,
  accent: oklch,
  accentForeground: oklch,
  destructive: oklch,
  success: oklch,
  warning: oklch,
  masteryBelum: oklch,
  masteryDipahami: oklch,
  masteryAhli: oklch,
  border: oklch,
  input: oklch,
  ring: oklch,
  radius: z.string(),
});

export type Tokens = z.infer<typeof tokenSchema>;

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
    warning: "oklch(0.75 0.14 65)",
    masteryBelum: "oklch(0.97 0.01 85)",
    masteryDipahami: "oklch(0.72 0.14 75)",
    masteryAhli: "oklch(0.55 0.13 38)",
    border: "oklch(0.92 0.01 85)",
    input: "oklch(0.92 0.01 85)",
    ring: "oklch(0.55 0.13 38)",
    radius: "0.75rem",
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
    warning: "oklch(0.78 0.13 65)",
    masteryBelum: "oklch(0.27 0.02 45)",
    masteryDipahami: "oklch(0.72 0.14 75)",
    masteryAhli: "oklch(0.7 0.12 38)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.7 0.12 38)",
    radius: "0.75rem",
  },
} satisfies Record<string, Tokens>;
