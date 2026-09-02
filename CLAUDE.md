# CLAUDE.md — CAKSARA

Sync dengan `AGENTS.md` — baca `AGENTS.md` sebagai sumber utama.

- Spec & Plan: GitHub Issues `#1` Spec + `#2-#9` Tickets (ready-for-agent) — jangan pakai `.scratch/`
- Glossary: `CONTEXT.md`
- ADR: `docs/adr/0001-0009`
- Standards: `docs/CODING_STANDARDS.md`
- Stack: React+Vite+TS · Tailwind · oxlint · Zod · Drizzle · Supabase · Gemini Flash temp 0.3

Workflow: ambil ticket ready-for-agent blockers-first, fresh context per ticket, `/tdd` + `/code-review` sebelum commit. `bun run check` wajib hijau.

## Agent skills

### Issue tracker

Issues and specs live as GitHub Issues in TudeOrangBiasa/caksara. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five labels (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: CONTEXT.md + docs/adr/ at repo root (writing-for-agents + domain-modeling as base). See `docs/agents/domain.md`.
