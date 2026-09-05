---
version: alpha.1
name: Caksara — Aksara Bali
description: Web edutainment sakral-terracotta for Profil Anon learning Wresastra via Sesi Kuis
colors:
  primary: "oklch(0.58 0.17 40)"
  primary-foreground: "oklch(0.985 0 0)"
  primary-dark: "oklch(0.65 0.19 40)"
  primary-dark-foreground: "oklch(0.99 0 0)"
  secondary: "oklch(0.955 0 0)"
  secondary-foreground: "oklch(0.35 0.05 38)"
  muted: "oklch(0.955 0 0)"
  muted-foreground: "oklch(0.5 0.02 45)"
  accent: "oklch(0.72 0.14 75)"
  accent-foreground: "oklch(0.2 0.05 38)"
  destructive: "oklch(0.58 0.22 27)"
  success: "oklch(0.62 0.15 145)"
  warning: "oklch(0.75 0.14 65)"
  mastery-belum: "oklch(0.955 0 0)"
  mastery-dipahami: "oklch(0.72 0.14 75)"
  mastery-ahli: "oklch(0.55 0.13 38)"
  border: "oklch(0.91 0 0)"
  input: "oklch(0.91 0 0)"
  ring: "oklch(0.58 0.17 40)"
  background: "oklch(0.977 0 0)"
  foreground: "oklch(0.145 0 0)"
  radius: "1rem"
typography:
  display:
    fontFamily: "Inter Variable"
    fontSize: 36px
    fontWeight: "600"
    lineHeight: 1.1
    letterSpacing: -0.02em
  heading:
    fontFamily: "Inter Variable"
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 1.3
  body:
    fontFamily: "Inter Variable"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 1.6
  balinese:
    fontFamily: "Noto Sans Balinese"
    fontSize: 24px
    fontWeight: "400"
    lineHeight: 1.4
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-padding: 24px
  card-gap: 16px
rounded:
  sm: 6px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
  card-modul:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-gap}"
  wresastra-grid:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
---

# Caksara DESIGN.md

## Overview

Caksara is sakral-terracotta edutainment for **Profil Anon** to learn **Wresastra** via **Sesi Kuis** from **KB Entry**, guided by **Guru Virtual**. Audience is pelajar Bali and juri INVENTION — needs trust, clarity, and daily habit (**Hati**, **XP**, **Streak**, **Mastery**). Vibe is warm candi, not playful Duolingo lime. Refer `docs/design/duolingo.md` only for bulk/cache pattern (ADR 0006), not visual.

Design read: "Reading this as: web edutainment for pelajar Bali, with a sakral-terracotta language, leaning toward shadcn/ui + Tailwind v4 @theme inline + Noto Sans Balinese." Dials `VARIANCE 7 / MOTION 5 / DENSITY 4`.

## Colors

Palette is burnt-orange + neutral + gold. Single accent lock.

- **Primary (terracotta light `oklch(0.58 0.17 40)`, dark `oklch(0.65 0.19 40)`):** CTA, Modul aktif, pill aktif. Pair with `primary-foreground`.
- **Secondary/Muted (neutral light `oklch(0.955 0 0)`, dark obsidian `oklch(0.24 0.012 260)`):** card surface, track progress, chip.
- **Accent (emas `oklch(0.72 0.14 75)`):** highlight, Mastery dipahami, XP.
- **Semantic:** Destructive Hati `0.58 0.22 27`, Success `0.62 0.15 145`, Warning Streak `0.75 0.14 65`. Dark mode: obsidian background, graphite cards, white text.
- **Mastery:** Belum neutral, Dipahami emas, Ahli terracotta (`0.55 0.13 38` light).

Tokens are normative (`packages/ui/src/lib/tokens.ts` mirrors `globals.css` 36/36); prose describes use. No hex hardcode in components — use `bg-primary` etc.

## Typography

- **Display/Heading:** Inter Variable 600, tight tracking, for Modul titles.
- **Body:** Inter Variable 400 16px 1.6 for KB Entry and Sesi Kuis prompts, max 65ch.
- **Balinese:** Noto Sans Balinese 400 24px self-host woff2 `/fonts/NotoSansBalinese-Regular.woff2`, `font-display: swap`, `unicode-range: U+1B00-1B7F`, selectors `[lang="ban"]` + `.font-balinese`. Never use Inter for Wresastra glyphs.

## Layout

Fluid grid mobile, max 1200px desktop. 8px base spacing scale (4px half-step). Cards use containment with 24px internal padding. Breakpoints 640/768/1024/1280. Lesson Tree vertical tree, Sesi Kuis single column, KB Entry two-column on desktop.

## Elevation & Depth

Tonal layers, not heavy shadows. Background off-white, cards pure white. Shadow tinted to background hue, never pure black. For DENSITY >7, no generic cards.

## Shapes

Shape lock: base `--radius 1rem`, cards `rounded-3xl`, inputs `rounded-2xl`, `full` for Hati/XP pills, search, and CTA. One scale, consistent.

## Components

Use shadcn/ui components via `npx shadcn@latest add` — Button, Card, Badge, Progress, etc. Never hand-roll. Variants: `default` primary, `secondary`, `destructive` for Hati, `success`/`warning` via semantic tokens. All interactive states: loading skeleton, empty (Hati 0, Streak 0), error inline, tactile `active:translate-y-px`.

## Do's and Don'ts

- Do: one accent, lock it, audit every component.
- Do: `bg-primary` etc, `gap-*` not `space-y-*`, `size-*` not `w-* h-*`.
- Don't: mix Fluent/Carbon, don't use hex in components, don't default to warm beige #f5f1ea.
- Don't: use Duolingo lime `#a5ed6e` visual — keep terracotta.

## Changelog

- **alpha.1** — V0 tokens SSOT: `tokens.ts` mirrors `globals.css` 36/36 (burnt-orange `0.58/0.65`, obsidian dark, radius `1rem`); frontmatter hex replaced with oklch; per-token docs + governance header.
- **alpha** — Initial palette (warm limestone scale, radius `0.75rem`).
