# Quiz

## Sub-features

Pilihan ganda, pasangkan (cocokkan), susun aksara, mode dengar
(dengar_pilih), kenali visual. Known bugs: #84, #85, #86.

## How to get to it (user POV)

Home -> Belajar -> Modul 1 (node "Aktif") -> Mulai Belajar -> materi
(Lanjut per halaman) -> Kerjakan N soal -> "Menyusun soal buat kamu…"
(fallback bank lokal bila offline/tanpa Supabase) -> Soal 1 / N.

## Driving it with Playwright

`bun run verify:caksara` drives this as a guest at 390x844, 820x1180, and
1440x900 (locale id-ID, fresh context = empty storage). Per viewport it
records the `Soal 1 / N` text plus the quiz progressbar `aria-valuemax`,
asserts no horizontal overflow at home/materi/quiz/kb/kb-detail
(`documentElement.scrollWidth <= clientWidth` + body), and saves
`<viewport>-02-quiz.png` to `.verify/caksara/<timestamp>/`.

Stable selectors: `Lewati`, `Mulai Petualangan`, nav `Belajar` (exact),
`ol button` first (Modul 1 Aktif), `Mulai belajar`, `Lanjut` / `Kerjakan`,
`Soal 1 /` text, `progressbar` named `Soal 1`, `Keluar dari kuis`,
`Kembali`, nav `KB`, `section button` first (KB card).

## Gotchas

Mode dengar uses `speechSynthesis`, which headless Chromium may not have. Assert the UI state, not the audio.
Desktop renders `TopNav` + `LandingHome` while mobile/tablet render
`Header` + `Dashboard` + `BottomNav`; nav button names are identical.
Quiz exit lands on Detail Modul (overlay, no nav) — click `Kembali` before
using nav tabs.
