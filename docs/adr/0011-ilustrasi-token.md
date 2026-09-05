# ADR 0011 — Token Ilustrasi & Cetak (Bedawang, Konfeti, Kartu PNG)

Konteks: review PR #35 melarang hex hardcode di komponen (`bedawang.tsx`, `confetti.tsx`, `achievement-card.ts`). Kontrak inti `tokenSchema` (19 field oklch, light/dark) tidak cocok untuk warna ilustrasi tetap: maskot SVG, partikel konfeti, dan render canvas kartu PNG memakai HEX mode-independent, dan canvas tidak bisa membaca Tailwind class (`var()` tidak jalan di `fillStyle`).

Keputusan:

**1. Grup token kedua, bukan campur ke inti:** `illustrationTokenSchema` di `packages/ui/src/lib/tokens.ts` (regex `#rrggbb`, nilai HEX tetap, tanpa varian light/dark) + mirror `var(--bedawang-*)`, `var(--confetti-*)`, `var(--card-*)` di `:root` `globals.css` + mapping `@theme inline` (`--color-bedawang-shell`, dst.). Skema inti 19 field oklch tidak berubah.

**2. Cara pakai per media:**

- SVG/DOM (`bedawang.tsx`, `confetti.tsx`): string `var(--...)` langsung di `fill`/`style` — Tailwind class tidak bisa menjangkau atribut SVG dinamis dan partikel JS.
- Canvas (`achievement-card.ts`): resolve sekali via `getComputedStyle(document.documentElement).getPropertyValue()` dengan fallback HEX (kartu PNG selalu desain terang; SSR pakai fallback).

**3. Larangan:** token ilustrasi/cetak dilarang untuk teks UI, CTA, atau state — itu wilayah 19 token inti. Token baru di grup ini wajib `.describe()` + mirror CSS, mengikuti aturan governance header `tokens.ts`.
