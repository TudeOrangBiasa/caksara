---
version: alpha
name: Caksara — Aksara Bali
description: Web edutainment sakral-terracotta for Profil Anon learning Wresastra via Sesi Kuis
colors:
  primary: "#af5234"
  primary-50: "#fbeae5"
  primary-100: "#f0cfc5"
  primary-200: "#e0a897"
  primary-300: "#ce826b"
  primary-500: "#af5234"
  primary-700: "#873b24"
  primary-800: "#602614"
  primary-900: "#39160a"
  primary-950: "#160703"
  secondary: "#eee4cf"
  secondary-50: "#f8f5ee"
  accent: "#d79628"
  accent-50: "#fbecd9"
  destructive: "#df2225"
  success: "#409d48"
  warning: "#ea9941"
  neutral: "#f8f5ee"
  neutral-950: "#0f0a08"
  background: "#ffffff"
  foreground: "#0a0a0a"
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

Palette is warm terracotta + parchment + gold, computed via **oklch-skill** palette generation (delta 0.4, L 0.95→0.15, chroma clamped per step to stay in sRGB gamut, same C% per hue). Single accent lock.

- **Primary (#a5? terracotta oklch 0.55 0.13 38):** CTA, Modul aktif, Mastery ahli. Light 50–300 for hover, dark 700–950 for text on dark.
- **Secondary (sand oklch 0.92 0.03 85):** card surface, parchment calm.
- **Accent (emas oklch 0.72 0.14 75):** highlight, Mastery dipahami.
- **Neutral (limestone oklch 0.97 0.01 85):** page base, softer than pure white.
- **Semantic:** Destructive Hati `0.58 0.22 27`, Success XP `0.62 0.15 145`, Warning Streak `0.75 0.14 65`. All checked via oklch accessibility-contrast (L gap >0.6, APCA Lc 60+).

Tokens are normative; prose describes use. No hex hardcode in components — use `bg-primary` etc.

## Typography

- **Display/Heading:** Inter Variable 600, tight tracking, for Modul titles.
- **Body:** Inter Variable 400 16px 1.6 for KB Entry and Sesi Kuis prompts, max 65ch.
- **Balinese:** Noto Sans Balinese 400 24px self-host woff2 `/fonts/NotoSansBalinese-Regular.woff2`, `font-display: swap`, `unicode-range: U+1B00-1B7F`, selectors `[lang="ban"]` + `.font-balinese`. Never use Inter for Wresastra glyphs.

## Layout

Fluid grid mobile, max 1200px desktop. 8px base spacing scale (4px half-step). Cards use containment with 24px internal padding. Breakpoints 640/768/1024/1280. Lesson Tree vertical tree, Sesi Kuis single column, KB Entry two-column on desktop.

## Elevation & Depth

Tonal layers, not heavy shadows. Background off-white, cards pure white. Shadow tinted to background hue, never pure black. For DENSITY >7, no generic cards.

## Shapes

Shape lock: **soft 12–16px** for cards (`rounded lg/xl`), **8px** for inputs, `full` for Hati/XP pills. One scale, consistent. Prototype uses `rounded-xl` for Modul cards, `rounded-lg` for Wresastra grid.

## Components

Use shadcn/ui components via `npx shadcn@latest add` — Button, Card, Badge, Progress, etc. Never hand-roll. Variants: `default` primary, `secondary`, `destructive` for Hati, `success`/`warning` via semantic tokens. All interactive states: loading skeleton, empty (Hati 0, Streak 0), error inline, tactile `active:translate-y-px`.

## Do's and Don'ts

- Do: one accent, lock it, audit every component.
- Do: `bg-primary` etc, `gap-*` not `space-y-*`, `size-*` not `w-* h-*`.
- Don't: mix Fluent/Carbon, don't use hex in components, don't default to warm beige #f5f1ea.
- Don't: use Duolingo lime `#a5ed6e` visual — keep terracotta.
