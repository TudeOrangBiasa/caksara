# Minimal Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Terapkan spec minimal-premium (depth + hierarki) tanpa warna baru dan tanpa ubah logika.

**Architecture:** Token depth mode-dependent di CSS + `depthTokenSchema` terpisah (nilai shadow bukan oklch murni, dilarang masuk `tokenSchema` 19 field); bulk pass presentasi per halaman; hook counter terisolasi.

**Tech Stack:** Tailwind v4 (`@theme inline`), oklch, React 19, oxlint+oxfmt, bun.

## Global Constraints

- Tanpa warna/gradien baru; tanpa ubah alur/fitur/logika.
- Tekstur hanya di kartu hero oranye (class `.hero-texture`, satu titik hapus).
- Bahasa Indonesia; tanpa em-dash di teks UI.
- Tiap task berakhir: `bun run check` 0 error + `bun run build` ✓ + dump-DOM assert + commit + push cabang yang sama.
- Temp file (seed/tmp-route) selalu dihapus sebelum commit.

---

### Task 0: Audit shadow existing

**Files:** - Baca: `apps/web/src`, `packages/ui/src` (grep).

**Interfaces:** - Produces: daftar pemakaian `shadow-*` existing untuk Task 1.

- [ ] **Step 1: Audit**

```bash
grep -rn "shadow-" apps/web/src packages/ui/src --include="*.tsx" --include="*.css" | head -20
```

- [ ] **Step 2: Catat** hasil di commit message Task 1 (override default Tailwind aman / daftar yang ikut berubah).

### Task 1: Token depth

**Files:**

- Modify: `packages/ui/src/styles/globals.css` (`:root` + `.dark` + `@theme inline`)
- Modify: `packages/ui/src/lib/tokens.ts` (tambah `depthTokenSchema` + `depthTokens`, JANGAN ubah `tokenSchema`)

**Interfaces:**

- Consumes: hasil audit Task 0.
- Produces: var `--shadow-sm/md/lg`, `--highlight`; utilitas `shadow-sm/md/lg`; `depthTokens` terekspor.

- [ ] **Step 1: Tambah var ke `:root` (setelah `--ring`)**

```css
--shadow-sm: 0 1px 2px oklch(0.35 0.05 38 / 8%), 0 1px 3px oklch(0.35 0.05 38 / 6%);
--shadow-md: 0 4px 12px oklch(0.35 0.05 38 / 12%), 0 2px 4px oklch(0.35 0.05 38 / 8%);
--shadow-lg: 0 12px 32px oklch(0.35 0.05 38 / 18%), 0 4px 8px oklch(0.35 0.05 38 / 10%);
--highlight: inset 0 1px 0 oklch(1 0 0 / 55%);
```

- [ ] **Step 2: Mirror ke `.dark` (setelah `--ring`)**

```css
--shadow-sm: 0 1px 2px oklch(0 0 0 / 30%), 0 1px 3px oklch(0 0 0 / 24%);
--shadow-md: 0 4px 12px oklch(0 0 0 / 40%), 0 2px 4px oklch(0 0 0 / 30%);
--shadow-lg: 0 12px 32px oklch(0 0 0 / 55%), 0 4px 8px oklch(0 0 0 / 40%);
--highlight: inset 0 1px 0 oklch(1 0 0 / 8%);
```

- [ ] **Step 3: Mapping `@theme inline`** (setelah `--color-background`): `--shadow-sm: var(--shadow-sm);` dst + highlight tidak perlu (dipakai via arbitrary `shadow-(--highlight)`? TIDAK — highlight dipakai sebagai `box-shadow` kedua via arbitrary: `shadow-[var(--highlight)]`? Box-shadow arbitrary menimpa shadow util. Solusi: gabung di komponen sebagai `[box-shadow:var(--highlight),var(--shadow-sm)]`? Tailwind v4 arbitrary `shadow-[...]` dengan koma → underscore. Sederhanakan: highlight hanya untuk hero/nav via class `.surface-raised { box-shadow: var(--highlight), var(--shadow-md); }` di `@layer components`. Tulis class itu.)

- [ ] **Step 4: `depthTokenSchema`** di tokens.ts: `z.object({ shadowSm: z.string(), ... })` + describe tiap field + `depthTokens = { light: {...}, dark: {...} }` (string sama persis dengan CSS).

- [ ] **Step 5: Verifikasi**

```bash
bun run check  # 0 error
bun --eval "import('./packages/ui/src/lib/tokens.ts').then(m => m.depthTokenSchema.parse(m.depthTokens.light))"
```

- [ ] **Step 6: Commit** `feat: token depth minimal premium` + push.

### Task 2: Tekstur hero

**Files:**

- Modify: `packages/ui/src/styles/globals.css` (class `.hero-texture`)
- Modify: kartu hero oranye (dashboard hero, module detail hero, KB detail hero, profil hero — cari via grep `bg-primary`)

**Interfaces:**

- Consumes: Task 1 (selesai).
- Produces: class `.hero-texture` dipakai 4 hero.

- [ ] **Step 1: Tulis class** (pola songket belah ketupat, opacity 0.04, pointer-events none):

```css
.hero-texture {
  position: relative;
}
.hero-texture::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 3 L25 14 L14 25 L3 14 Z' fill='none' stroke='%23ffffff' stroke-width='1.5'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: Terapkan** `hero-texture` + `surface-raised` ke 4 hero (grep `bg-primary` level hero, bukan tombol).

- [ ] **Step 3: Verifikasi** build + dump-DOM `hero-texture` muncul 4x + teks hero tetap terbaca (dump teks).

- [ ] **Step 4: Commit** + push.

### Task 3a: Hierarki tab inti (dashboard, belajar, guru, KB)

**Files:** `apps/web/src/features/dashboard/*`, `module/module-tree.tsx`, `teacher/teacher.tsx`, `kb/kb-list.tsx`, `kb/kb-detail.tsx`.

- [ ] **Step 1: Judul halaman** → `text-[28px] md:text-[32px] font-extrabold tracking-tight` (ganti text-xl/2xl yang jadi judul utama).
- [ ] **Step 2: Eyebrow + divider** tiap seksi: `<p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">…</p>` + `border-t border-border/60` antar seksi + bungkus `space-y-6`.
- [ ] **Step 3: Kartu standar** tambah `shadow-sm`; hero sudah dari Task 2.
- [ ] **Step 4: Verifikasi** check + build + dump tiap tab (judul + eyebrow ada, tanpa teks hilang).
- [ ] **Step 5: Commit** + push.

### Task 3b: Hierarki profil, pengaturan, hasil, landing

Sama seperti 3a untuk `profil/profil-page.tsx`, `settings/*`, `quiz/quiz-result.tsx`, `landing/landing-home.tsx`. Commit + push terpisah.

### Task 4: Counter animasi

**Files:**

- Create: `apps/web/src/lib/use-count-up.ts` (hook: target, 600ms, reduced-motion → final)
- Create: `apps/web/src/components/animated-number.tsx` (tabular-nums wrapper)
- Modify: angka XP/streak/hati di dashboard + profil + hasil kuis (ganti teks angka saja)

**Interfaces:**

- Produces: `useCountUp(target: number): number`; `<AnimatedNumber value suffix?>`.

- [ ] **Step 1-3: Tulis hook + komponen + wiring** (satu angka dulu: XP dashboard).
- [ ] **Step 4: Verifikasi** DOM angka akhir benar (dump setelah budget > 600ms).
- [ ] **Step 5: Commit** + push.

### Task 5: Sapu akhir

- [ ] **Step 1:** `bun run check` 0 error, `bun run build` ✓, server 200, `public/` hanya `favicon.ico` + `fonts/`.
- [ ] **Step 2:** Screenshot 375/1280 dark/light per halaman (file /tmp, user nilai visual).
- [ ] **Step 3:** Laporan spesifik + update deskripsi PR #35.
