---
name: create-formal-verification
description: Pin a ticket's invariants to exact strings and run the formal gate before opening a PR. Use when a fix or feature is code-complete and needs a merge verdict.
---

# Create formal verification

The gate each owner runs before `gh pr create`. It turns the ticket's
acceptance criteria into pins an owner can re-run: exact strings in the
tree plus the repo's own checks. `verify-caksara` drives the app like a
learner; this skill decides whether the change merges.

## Launch

Name the invariants first, one line each, with the exact string that
proves it. A pin that needs a regex or a judgment call is not a pin yet.
Rewrite it until `rg -F` can check it.

Pin by ticket type:

- Bug: one repro-then-fix predicate. The old behavior gets a forbid pin
  (the string that must be gone), the new behavior a require pin.
  #84 pinned `matches?: Record<string, string>` (require) and the
  per-pair early submit (forbid).
- Feature: one boolean per acceptance criterion. #85 pinned
  `const SESSION_COUNT = 3;` plus the UI copies that show 3.
- Edge (Supabase/Gemini): Zod-parse at the seam plus a sourceRef fixture
  matrix. Cited answers carry `sourceRefs`, fallbacks carry pills, and
  the fixture proves both shapes parse (`teacher.test.ts` shows the
  pattern). Grounding adds two pins from #90/#97: every Gemini question
  resolves its `sourceRef` to an injected KB id
  (`allQuestionsGrounded` in `quiz-grounding.ts`, exercised by
  `quiz-grounding.test.ts`), and the Guru fallback reply is the exact
  locked string (`TEACHER_OUTSIDE_REPLY`, asserted in
  `teacher-data.test.ts`).

## Drive

Run the steps in order. Any red step stops the run; fix and restart
from step 1. Cap: 4 iterations per failing check, then ask for help.

1. `bash scripts/verify.sh` (install, oxlint, oxfmt, build,
   `verify:caksara` at 3 viewports). See `docs/agents/verifier.md`.
2. `bun run check:secrets`.
3. UI touched: `bun run lint:tailwind`.
4. The feature's own assert: its Playwright flow or fixture test
   (`quiz-data.test.ts`, `quiz-store.test.ts`, or the 3-viewport run
   from `skills/verify-caksara/`).
5. The pins: `rg -F -- 'exact string' apps packages supabase scripts`
   for each require pin, and the same with expected-absent for each
   forbid pin.

Portable subset in one command (`verify-formal.sh` in this folder runs
steps 1, 2, and 5 headlessly):

```sh
bash skills/create-formal-verification/verify-formal.sh --name <pr-slug> \
  --require 'const SESSION_COUNT = 3;' \
  --forbid 'debugger'
```

Real pins from merged work: `const SESSION_COUNT = 3;`,
`matches?: Record<string, string>;`,
`{doneCount} dari {pairs.length} pasangan cocok`,
`allQuestionsGrounded`, `TEACHER_OUTSIDE_REPLY`, and `aria-valuemax`
recorded as 3 in `report.json`.

## Verdict

Read the verdict off the run, not off intent:

- VERIFIED: steps 1-5 green, every pin checked, evidence paths exist.
- NOT VERIFIED: any step red or any pin missing. Fix, re-run, do not merge.
- INCONCLUSIVE: flaky or environment failure (port busy, browser
  download failed). Re-run; an INCONCLUSIVE never merges.

`verify-formal.sh` prints `formal-verify: VERIFIED` or
`formal-verify: NOT VERIFIED` as its last line and exits nonzero on red.

## Evidence

Three artifacts, all three required:

1. Command plus output pasted in the PR body (the real text, not a summary).
2. `.verify/<pr-slug>/<timestamp>/` holding `formal.json`
   (written by the script) plus the screenshots or `report.json` the
   ticket cites. The dir stays after the run; it is gitignored.
3. A `## Verification` section in the PR body with this shape:

```md
## Verification

Verdict: VERIFIED
Gate: `bash skills/create-formal-verification/verify-formal.sh --name <slug> --require '<pin>'`
Evidence: `.verify/<slug>/<timestamp>/`
Pins:

- require `<pin>` — present
- forbid `<pin>` — absent
```

## Cleanup

Stop the dev server the run launched (the verifier stops its own;
manual runs end with Ctrl-C or the pid you hold). Never kill by process
name. Leave `.verify/` in place; copy the cited files to
`docs/proof/<pr>/` when the PR needs them.

## Helpers

- `bash scripts/verify.sh`, also run by `.husky/pre-push`.
- `bun run check:secrets` (no hardcoded env fallback).
- `bun run lint:tailwind` for UI diffs.
- App-driving proof: `skills/verify-caksara/` (guest Playwright run).
- Mocking rule: Supabase and Gemini stay behind fixtures at the seam
  (`fetchGeneratedQuiz` fallback, local KB entries, Zod fixtures).
  The gate never needs network or keys in the repo.
