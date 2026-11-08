# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — glosarium tunggal (Wresastra, Modul, Sesi Kuis, Hati, XP, Streak, KB Entry, Guru Virtual, Mastery, Profil Anon) + `## Layar` mapping 19 frame Pencil → komponen web (ADR-0016).
- **`docs/adr/`** — baca ADR yang menyentuh area kerja (`0001` stack, `0002` auth, `0003` KB, `0005` audio, `0006` bulk+cache, `0008` streak/hearts, `0009` font/mastery, `0010` taste, `0013` duo-renewal, `0015` audit-token, `0016` pixel-perfect).

> Tidak ada file peta lain yang dicari — daftar di atas sudah lengkap untuk repo ini.

## File structure (aktual repo ini)

```
/
├── CONTEXT.md                          ← glosarium + Layar (19 frame Pencil)
├── docs/adr/0001..0016                 ← keputusan teknis (bukan 0001-0009 saja)
├── apps/web/src/
│   ├── routes/                         ← React Router (_index, kb.$id, auth.callback, $)
│   ├── features/<domain>/              ← landing, quiz, kb, teacher, …
│   └── lib/zod|supabase.ts|profile-store.ts
├── packages/ui|env|config/             ← SSOT token, env boundary, config
└── supabase/functions|rls|cron|migrations/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0016 (19-frame scope) — but worth reopening because…_
