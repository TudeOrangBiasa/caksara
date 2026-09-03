# ADR 0010 — Design Tokens & Taste (Bali-inspired M3)

Konteks: `to-spec` tertahan karena UI taste belum terkunci. `packages/ui/src/styles/globals.css` masih shadcn default neutral (`oklch` abu), `apps/web/src/styles/aksara.css` hanya `@font-face` tanpa `unicode-range`, belum ada token semantic untuk Hati/XP/Streak/Mastery, dan belum ada mapping Material 3 → Tailwind v4 `@theme inline`. Tanpa ini ticket #5-#8 akan diverge. Referensi taste: `.agents/skills/design-taste-frontend/SKILL.md` (anti-slop, dials 8/6/4, skill) dan `docs/design/duolingo.md` (lime `#a5ed6e` playful) + format standar `DESIGN.md` (google-labs-code/design.md) — grill lock pilih sakral terracotta via `oklch-skill` palette-generation (delta 0.4, L 0.95→0.15, chroma clamp) + accessibility-contrast ≥4.5:1, Duolingo hanya untuk bulk/cache ala Duolingo (ADR 0006), bukan visual.

Keputusan:

**1. Sumber token tunggal:** `packages/ui/src/styles/globals.css` (`:root` + `.dark` + `@theme inline`) adalah SSOT. `apps/web/src/index.css` tetap re-export `@caksara/ui/globals.css`. Tidak ada `tailwind.config.ts` (Tailwind v4 `@tailwindcss/vite` ignore file itu).

**2. Palet Bali-inspired (oklch, AA):**

- `--primary`: `oklch(0.55 0.13 38)` terracotta candi — untuk CTA utama & Modul aktif. `--primary-foreground`: `oklch(0.985 0 0)`.
- `--secondary`: `oklch(0.92 0.03 85)` sand/parchment — card surface sekunder.
- `--accent`: `oklch(0.72 0.14 75)` emas ukiran Bali — highlight, Mastery `ahli`.
- `--muted` / `--border` tetap warm-neutral `oklch(0.97 0.01 85)` / `oklch(0.92 0.01 85)` (light), `oklch` dark `0.27/0.37` dengan hue 38-45 agar tidak cold gray.
- `--destructive`: `oklch(0.58 0.22 27)` merah Hati (konsisten existing) — untuk Hati habis & error.
- `--success` (baru): `oklch(0.62 0.15 145)` hijau XP.
- `--warning` (baru): `oklch(0.75 0.14 65)` amber Streak.
- `--mastery-*` (baru): `--mastery-belum: var(--muted)`, `--mastery-dipahami: oklch(0.72 0.14 75)`, `--mastery-ahli: oklch(0.55 0.13 38)` — mapping ke Mastery `belum|dipahami|ahli` (ADR 0009 derived).

**3. Radius & motion:** `--radius: 0.75rem` (M3 medium), scale `sm/md/lg/xl` via `calc()`. Motion `150ms ease-out` default, `prefers-reduced-motion` reduce.

**4. Tipografi:**

- `--font-sans: "Inter Variable", sans-serif; --font-balinese: "Noto Sans Balinese", sans-serif;` di `@theme inline`.
- `apps/web/src/styles/aksara.css` konsolidasi: `@font-face` dengan `src: url("/fonts/NotoSansBalinese-Regular.woff2") format("woff2")`, `font-display: swap`, `unicode-range: U+1B00-1B7F`, `font-weight: 400`. Selector `[lang="ban"]` + `.font-balinese` utility. Konsolidasikan import via `globals.css` atau `index.css` layer agar tidak FOIT.

**5. Tailwind mapping:** `@theme inline` expose `--color-primary`, `--color-success`, `--color-warning`, `--color-mastery-*`, `--font-balinese`, `--radius-*`. Komponen UI hanya boleh pakai `bg-primary`, `text-success`, `font-balinese` — larang hex literal di komponen.

**6. Dark mode:** `.dark` mirror dengan hue sama (38-45 warm), `--primary` lightened `oklch(0.70 0.12 38)` agar kontras ≥4.5:1 di `oklch(0.145 0 0)` bg. Verifikasi manual di prototype 375/768/1280 + toggle.

**7. Zod boundary:** `packages/ui/src/lib/tokens.ts` export `tokenSchema` + `tokens` (`light`/`dark`) — SSOT, jika `apps/web` butuh re-export via `export * from "@caksara/ui/lib/tokens"` — jangan duplikat nilai, dipakai di build-time check, bukan runtime per-render.

Konsekuensi: semua ticket UI (#5 Auth/Tree, #6 Quiz, #7/#8) block pada ADR ini; prototype `prototype/ui-taste` validasi taste sebelum spec #1 di-lock; `bun run check` + `bun run build` tetap 2084 modules.
