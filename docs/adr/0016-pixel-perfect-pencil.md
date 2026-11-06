# ADR 0016: Pixel-Perfect Pencil → Web CAKSARA (19 frame aktual, 4 keputusan grill)

Konteks: grill pixel-perfect Pencil→web disetujui user dengan aturan
screen di Pencil = screen di web, pixel-perfect, fungsional. Grounding
via `execute` visitor teks + `Get depth≤1` per page id (bukan screenshot).
Fakta file aktual `/home/todayz/Downloads/Caksara/Caksara.pen` (diukur
2026-11-06): hanya **19 frame** top-level — T4HbK, Ky2up, pAPnC, tXwUy,
Gd8Af, u78JLW, RJBIf, A8B2n, g6deu, Z8nXI, OfPb9, HK0rs, t8BaKT, IpWol,
FyN8o, jU8co, vjnVJ, VyFA4, lGwoj. Dikecualikan (tidak ada di file,
hasil scan 0/28): oUw3N, Touj1, s6fBnf, By3so, F9JfH, tYWO2, zcYGq,
rC4hQ, z5kXC, lLjRA, NGB8o, GqKlb, ise0X, D8Mhs, Q49tlr, TnrZR, chIYf,
r740fO, dP2jw, z0OhL, XXIlm, gQI9t, XGzWh, r8LGWn; tidak ada tema
Lontar/Banjar/Kelir, tidak ada Guru/Mobile/Soal terpisah. Lebar ukur:
Column/Result Col kuis-hasil **576px**, League Card + List peringkat
**800px**. Web adalah SPA satu route `/` (tab + view overlay); semua 19
frame sudah punya padanan komponen.

Keputusan:

**1. Acuan = 19 frame yang ADA; klaim varian phantom dibatalkan.**
Beranda = T4HbK tunggal (bukan ×4). Kuis = 7 frame (u78JLW dengar,
RJBIf pilihan ganda, g6deu pasangan, OfPb9 susun, A8B2n dialog, Z8nXI
lulus, HK0rs gagal). Kanvas 01 = 5 langkah onboarding (FyN8o Alasan,
jU8co Level, vjnVJ Komitmen, VyFA4 Nama, lGwoj Sukses) — bukan duplikat.
Tema eksplorasi tidak ada di file → tidak diimplementasikan. Guru tanpa
frame Pencil → acuan terdekat kartu Guru Virtual di T4HbK.

**2. Kuis desktop kolom tengah 576px, mobile tetap.** `QuizShell` +
`QuizResult` `lg:max-w-[576px]` (sudah di kode); hero result
`pt-[277px]` lulus / `pt-[306px]` gagal; threshold lulus 70%.
`GameOver`/`ResumeDialog` di luar cakupan 576 (existing 480/game-over).

**3. Peringkat halaman penuh t8BaKT.** H2 `Papan Peringkat` + League Card
(`TOP 20 / Reset tiap Senin / Sisa 2 hari`) + List R1–R8 + highlight
`• Kamu`, lebar 800 desktop; bukan kartu sampingan.

**4. Onboarding samakan copy ke Kanvas 01.** Q Level →
`Seberapa jauh kamu sudah kenal?`, Q Komitmen →
`Berapa lama waktumu tiap hari?`; sisanya sudah sama (Alasan, Nama,
Sukses, semua opsi/desc/bubble/CTA); hint Nama tanpa emoji visual
(ikon Sparkles, aturan ikon #103).

**Aturan pixel-perfect:** (a) token SSOT ADR 0010/0015, konsumsi via
kelas semantik, larang hex literal di komponen; (b) Pencil light-only,
web mirror warm hue 38-45 + primary lightened kontras ≥4.5:1; (c) lebar
kunci 576 kuis/hasil, 800 peringkat; (d) copy Indonesia eksak dari
Pencil, jangan parafrase; (e) ikon lucide saja, tanpa emoji visual.

**5. Token streak dari grounding Pencil.** Node `nItHP Streak Card`
(tXwUy) = gradien linear 135° `#FFA726`→`#FF7A00`; `--streak-edge`
(`#E87500`); hari lit fill `#FF9600` (`--streak-lit`), hari mati
`#FFFFFF44` + stroke `#E5E5E5` (tetap alpha/white existing). Token
ilustrasi HEX tetap light/dark (pola ADR-0011), mirror `--color-streak-*`.

**Utang lunas (PR #173):** hex rank/badge/shadow → token accent,
duo-blue, success, muted, secondary, border.

Konsekuensi: `CONTEXT.md ## Layar` + ADR ini = acuan tunggal cakupan
pixel-perfect (19 frame, bukan varian phantom). Tanpa edit kode; `bun
run check` tetap 0 error.
