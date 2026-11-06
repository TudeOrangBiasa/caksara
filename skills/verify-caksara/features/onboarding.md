# Onboarding

## Sub-features

Splash (~1.5s) -> 4 langkah (tujuan, level, komitmen, nama) -> Siap Mulai.
`Lewati` jumps straight to Siap Mulai; empty name defaults to "Penjelajah".

## How to get to it (user POV)

Fresh storage -> splash -> "Langkah 1 dari 4". Returning profile skips to Home.

## Driving it with Playwright

`bun run verify:caksara` waits for `Lewati`, screenshots
`<viewport>-00-onboarding.png`, clicks `Lewati` -> `Mulai Petualangan`.
Doctor gate: `Lewati` must appear within 20s of load.

## Gotchas

Splash fades at 1.2s, unmounts at 1.5s — never assert splash pixels, only
that onboarding follows. Name validation (`profileNameSchema`) rejects
empty/oversize names with an inline error.
