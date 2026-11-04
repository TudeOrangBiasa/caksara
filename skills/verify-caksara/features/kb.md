# KB (Basis Pengetahuan)

## Sub-features

27 local entries (wresastra, kosakata, budaya), category + level filters,
search, detail with glyph + sources + Mendeley audio attribution.
Out of scope for #83: Guru Virtual (needs Supabase + Gemini env).

## How to get to it (user POV)

Nav `KB` -> card grid -> tap a card -> detail (`Kembali ke Daftar KB`).

## Driving it with Playwright

`bun run verify:caksara` clicks nav `KB` (exact), screenshots
`<viewport>-03-kb.png` after opening the first `section button` card,
asserts no horizontal overflow at list + detail.

## Gotchas

KB list reads local entries, so it works with empty `.env`.
`section button` also matches filter chips — scope to the entry grid
section. Detail back button is labelled `Kembali ke daftar KB`.
