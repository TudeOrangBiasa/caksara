---
name: verify-caksara
description: Drive the Caksara web app (apps/web, React Router + Vite) like a learner and capture evidence. Use before a PR that touches UI, quiz, KB, or Guru Virtual. Issue #83 extends this with Playwright 3-viewport checks.
---

# Verify Caksara

Primary surface: the web app in `apps/web`. Supabase (auth, Edge Functions) and Gemini sit behind it.

## Launch

```sh
bun install --frozen-lockfile
bun run dev
```

Ready when `http://localhost:5173/` answers 200. Without a `.env` the guest path still works (materi, kuis, KB). Login and Guru Virtual need Supabase and Gemini env.

## Doctor

`curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:5173/` prints `200`. If the port belongs to a server you did not start, do not drive it.

## Drive

Today: the gate is `bun run verify` (oxlint, oxfmt, build). For UI, `bun run proof:ui -- <url> docs/proof/<pr>` takes screenshots (see `docs/agents/ui-proof.md`).

Planned (#83): a Playwright verifier that plays the quiz as a guest at mobile, tablet, and desktop viewports, asserts no horizontal scroll, and saves screenshots as evidence. Once it lands it becomes a step of `scripts/verify.sh`.

## Evidence

Screenshots under `docs/proof/<pr>/` for UI PRs. Paste the verifier output in the PR body.

## Cleanup

Stop the dev server you started (Ctrl+C or the pid you hold). Never kill by process name.

## Helpers

- `bun run verify` (`scripts/verify.sh`), also run by `.husky/pre-push`.
- Feature map: `features/README.md`.
