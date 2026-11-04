---
description: Drive the Caksara web app (apps/web, React Router + Vite) like a learner and capture evidence. Use before a PR that touches UI, quiz, KB, or Guru Virtual. Runs `bun run verify:caksara` (Playwright, 3 viewports, guest path).
---

# Verify Caksara

Primary surface: the web app in `apps/web`. Supabase (auth, Edge Functions) and Gemini sit behind it.

## Launch

`bun run verify:caksara` starts `bun run dev:web` itself when port 5173 is
free, and reuses a server you already run (it never kills a server it did
not start). Manual equivalent:

```sh
bun install --frozen-lockfile
bun run dev:web
```

Ready when `http://localhost:5173/` answers 200. Without a `.env` the guest path still works (materi, kuis, KB). Login and Guru Virtual need Supabase and Gemini env.

## Doctor

`curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:5173/` prints `200`,
then the `Lewati` onboarding button must appear within 20s. If the port
belongs to a server you did not start, do not drive it.

## Drive

`bun run verify:caksara` (`skills/verify-caksara/verify-caksara.ts`) plays the
guest path headless at 3 viewports — mobile 390x844, tablet 820x1180,
desktop 1440x900, locale id-ID — and fails if any viewport overflows
horizontally. Flow per viewport: splash -> Lewati -> ready -> Belajar ->
Modul 1 -> materi -> kuis (records `Soal 1 / N` + `aria-valuemax`) -> KB
list -> 1 KB detail. Screenshots per milestone land in
`.verify/caksara/<timestamp>/` with `overflow.json` + `report.json`.

Guest path needs no Supabase/Gemini env: quiz launch falls back to the
local bank (`fetchGeneratedQuiz` -> `buildFallback("offline")`), KB reads
local entries. Login and Guru Virtual stay out of scope (need env).

For UI PRs, `bun run proof:ui -- <url> docs/proof/<pr>` takes screenshots
(see `docs/agents/ui-proof.md`).

## Evidence

Screenshots under `.verify/caksara/<timestamp>/` (kept after run, gitignored;
copy the set you cite into `docs/proof/<pr>/`). Paste the verifier output in
the PR body.

## Cleanup

The verifier stops only the dev server it launched; evidence under
`.verify/caksara/<timestamp>/` stays. Manual runs: stop the dev server you
started (Ctrl+C or the pid you hold). Never kill by process name.

## Helpers

- `bun run verify` (`scripts/verify.sh`, step 5 = this verifier), also run by `.husky/pre-push`.
- `bun run check:secrets` — no hardcoded env fallback (part of the drive contract).
- Feature map: `features/README.md`.
