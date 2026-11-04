# Quiz

## Sub-features

Pilihan ganda, pasangkan, mode dengar. Known bugs: #84, #85, #86.

## How to get to it (user POV)

Home, then a modul, then Mulai kuis.

## Driving it with Playwright

Owned by #83: a guest run at 390x844, 820x1180, and 1440x900, with screenshots per step.

## Gotchas

Mode dengar uses `speechSynthesis`, which headless Chromium may not have. Assert the UI state, not the audio.
