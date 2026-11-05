# Parity tracer: Profil + League Card (Pencil tXwUy/t8BaKT)

Dua layar: halaman Profil (streak, progres, lencana, mastery) dan kartu
leaderboard 8 baris di dalamnya. Pola tracer #156: baseline PNG frame
Pencil, gate threshold + probe geometri, known-deviations tercatat,
anti-shortcut.

## Baseline

- File: `.parity/baseline/profil/txwuy-profil.png` (profil),
  `.parity/baseline/profil/t8bakt-leaderboard.png` (league)
- Sumber: frame `tXwUy` ("Profil - CAKSARA"), `t8BaKT`
  ("03 Leaderboard - Desktop") dari
  `/home/todayz/Downloads/Caksara/Caksara.pen`
- Metode ekspor: `Export([...], 'png', out, {scale: 1})` via tool
  Pencil `execute` (render internal Pencil, 1 unit kanvas = 1 px)
- Resolusi: profil 1440 x 1250, league 1440 x 1024, sRGB, scale 1
- Viewport implementasi: sama dengan baseline, deviceScaleFactor 1,
  locale id-ID, tema light (seed `vite-ui-theme`)
- SHA256:
  - tXwUy: `5a59657746fa8dd011c7dd816a75f1fadafe3bb68a7cab3b2cd1a033ca06e50a`
  - t8BaKT: `b54d8002211896c2dc08030ab24ebefb7b49349a40cc98922134d565a639a333`
- Baseline TIDAK BOLEH diedit agar diff lolos (anti-shortcut).
  Verifikasi sha sebelum klaim angka.

## Cara jalan

```bash
# 1. Dev server worktree ini (jangan pakai milik worktree lain)
bun run dev:web -- --port 5281 --strictPort --host 127.0.0.1
# 2. Screenshot implementasi (Playwright, deterministik)
bun .parity/shoot-profil.ts 5281
bun .parity/shoot-leaderboard.ts 5281
# 3. Gate diff (threshold + probe posisi)
.parity/diff-profil.sh
```

Skenario deterministik (`.parity/fixture-profil.ts`): profil Putu
(id `parity-profil-putu`, XP 140, streak 6, hati 5, selesai mod_01 +
mod_02, mastery wre_01 ahli + wre_02/wre_05 dipahami, avatar
harbor-seal-2), lastActive = hari ini WITA supaya streak menyala
penuh tanpa overnight-reset. League: 8 baris ikut baseline (nama +
XP sama; suffix Putu 777 karena schema minta 100-999), profil
fixture = rank 7 supaya highlight Kamu muncul. Toast sonner
disembunyikan saat freeze (elemen transien, bukan konten layar).

`.parity/diff-profil.sh` lolos bila SEMUA terpenuhi:

1. RMSE profil <= 0,22
2. Beda nyata profil (difference threshold 5%) <= 500.000 px
3. Spot-check (`bun .parity/spotcheck-profil.ts`): 10/10 probe batas
   geometri cocok (2 profil same-coord + 8 league offset +179/+35
   tercatat; bentuknya harus sama persis, toleransi 0)

League RMSE/fuzz informatif saja, bukan gate. Kartu leaderboard
hidup di dalam halaman Profil (opsi B, keputusan Main), bukan
halaman penuh seperti frame t8BaKT, jadi perbandingan piksel penuh
tak bermakna. Gate league = 8 probe offset baris R1-R8.

## Angka final tracer ini

| Layar           | RMSE   | Ambang | Beda-nyata          | Ambang  | Probe | Status |
| --------------- | ------ | ------ | ------------------- | ------- | ----- | ------ |
| Profil (tXwUy)  | 0,2135 | 0,22   | 488.319 px (27,13%) | 500.000 | 2/2   | LOLOS  |
| League (t8BaKT) | 0,1327 | info   | 276.602 px          | info    | 8/8   | LOLOS  |

Threshold profil longgar karena tiga deviasi struktural yang
disengaja dan terukur per region (keputusan Main, opsi B): nav 5-tab
dipertahankan (+14rb px), overlay hero SSOT lebih gelap (+77rb px
region), dan konten dinamis streak/mastery/league (+112rb/+106rb px
region). Tanpa ketiganya, proyeksi di bawah ambang global.

## Known deviations (disengaja, tidak diperbaiki)

1. Nav 5-tab: app Beranda/Belajar/KB/Guru/Profil, Pencil 7 tab
   (tambah Papan Peringkat + Unduh). Keputusan Main opsi B: tab
   leaderboard/unduh tak ada rutenya. Dampak: region nav 13.984 px,
   probe profil memakai area kartu (bukan nav).
2. Hero overlay: app `zinc-950` gradient vs Pencil `#09090B`
   3-stop lebih terang. Overlay SSOT dipertahankan. Dampak: region
   hero 76.880 px. Foto `review_family` byte-identik, beda murni
   dari overlay.
3. Streak dinamis: app 6 pill menyala ikut tanggal jalan (Sab 31 -
   Jum 06), Pencil statis. Streak tak bisa dibekukan tanpa
   memalsukan tanggal. Dampak: region streak 111.574 px.
4. Mastery dinamis: app header "Mastery 18 Wresastra 3/18" +
   glyph hidup, Pencil tanpa header + statis. Dampak: region
   mastery 106.187 px.
5. Badge Pencil vs app: badge Pencil hijau foto-generatif,
   app ikon lucide + `cta`. Ikon SSOT dipertahankan.
   Dampak: region badge 62.324 px.
6. Latar body: app putih `#fff` vs Pencil `#F7F9FC` (semangat
   ADR-0015 no 12: degradasi ke putih disengaja). Probe
   menorm K ke W seperti modul-detail.
7. League halaman-penuh: frame t8BaKT H2 + kartu 800px tengah,
   app kartu 844px di kolom kanan Profil. Opsi B: struktur
   app dipertahankan, gate = 8 probe offset, bukan piksel penuh.
8. Suffix Putu: app "Putu 777" vs Pencil "Putu 77". Schema
   `leaderboardEntrySchema` minta suffix 100-999; data produksi
   menang atas piksel.
9. Rank 4-8 Pencil Space Mono vs app tabular Inter. Font angka
   SSOT dipertahankan (1px, tak kasatmata di probe).
10. Border kartu: `border` SSOT vs `#E5E5E5` (no 7); latar row
    rank/mine disamakan nilai Pencil karena bukan token
    (kuning/abu/oranye/hijau-muda satu-pakai).
11. Font: "Inter Variable" (app) vs Inter (Pencil). Glyph bisa
    beda <= 1 px. Tidak bisa disamakan tanpa ganti font app.

## Yang disamakan tracer ini (struktural, token-safe)

- Wiring gamifikasi PR #155: `claimStreakBonus` di profile-store
  (bonus 20 XP sekali per hari via `applyStreakBonus`), copy streak
  pill + header league ikut `XP_STREAK_BONUS` dan
  `isResetMingguIni` (tanpa wiring ini copy statis salah)
- League rows: rank pill 1-3 + rank teks 4-8, lingkaran inisial
  40px, nama + "Putu 777 - Kamu", XP grouping id-ID ("2.450 XP"
  bukan "2450 XP" + ikon), radius 14, padding 12/20, gap 10/14
- League header: gap 16, trophy 56, title 20 + sub 13,
  countdown pill 12 (nilai Pencil, bukan token)
- Profil container 1216 + grid 340/1fr + gap 32 (nilai Pencil)
- Kartu progres/lencana/mastery: padding 22, gap 12/14/10,
  border-tipis + shadow-2px di lg (pola modul-detail)
- Streak card: radius 24, padding 22, gap 12, pill bonus
  "+20 XP bonus streak diklaim" (wiring, bukan copy mati)
- Shoot deterministik: fixture profil + league via localStorage
  seed, `parityLeagueSource` DEV-only di belakang Supabase
  (produksi tak tersentuh: null tanpa seed, null di prod build)
- Mobile (<lg) tidak berubah: semua delta visual di balik
  prefix lg:, kecuali copy wiring (bonus pill, league header)
  yang berlaku semua viewport karena aturan main, bukan gaya
