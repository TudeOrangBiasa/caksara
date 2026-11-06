import { describe, test } from "node:test";
import assert from "node:assert/strict";

// Kontrak RLS CAKSARA (ADR-0002, #20): data privat terisolasi per profile_id =
// auth.uid(), tabel publik read-only. Test ini memverifikasi FILE SQL-nya
// (policy ada, klausa benar, idempoten) — bukan live DB, supaya jalan di CI
// tanpa kredensial. Verifikasi live: bun run db:apply-sql supabase/rls/0001_rls.sql
// lalu cek di Dashboard > Authentication > Policies.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(
  join(import.meta.dirname, "..", "..", "..", "..", "supabase", "rls", "0001_rls.sql"),
  "utf8",
);

const PRIVATE_TABLES = [
  "profiles",
  "quiz_sessions",
  "answers",
  "user_aksara_progress",
  "quiz_calls",
] as const;

describe("rls 0001: RLS nyala di semua tabel", () => {
  for (const table of [...PRIVATE_TABLES, "kb_entries", "modules", "leaderboard_entries"]) {
    test(`${table} enable row level security`, () => {
      assert.ok(sql.includes(`alter table public.${table} enable row level security;`));
    });
  }
});

describe("rls 0001: isolasi pemilik (auth.uid)", () => {
  test("profiles dikunci ke id = auth.uid()", () => {
    assert.ok(sql.includes("on public.profiles"));
    assert.ok(sql.includes("auth.uid()::text = id"));
  });

  for (const table of ["quiz_sessions", "user_aksara_progress", "quiz_calls"]) {
    test(`${table} dikunci ke profile_id = auth.uid()`, () => {
      assert.ok(sql.includes(`on public.${table}`));
    });
  }

  test("semua tabel privat memakai klausa auth.uid", () => {
    const uidUses = sql.match(/auth\.uid\(\)::text/gu) ?? [];
    // profiles(2) + sessions(2) + answers(2) + progress(2) + calls(2) + leaderboard(3) = 13
    assert.equal(uidUses.length, 13);
  });

  test("answers dijaga lewat kepemilikan sesi induk", () => {
    assert.ok(sql.includes("on public.answers"));
    assert.ok(sql.includes("quiz_sessions s"));
    assert.ok(sql.includes("s.profile_id = auth.uid()::text"));
  });
});

describe("rls 0001: tabel publik read-only", () => {
  for (const table of ["kb_entries", "modules"]) {
    test(`${table} hanya boleh select publik`, () => {
      assert.ok(sql.includes(`on public.${table} for select using (true)`));
    });
  }

  test("leaderboard dibaca publik (anon+auth), tulis hanya baris sendiri", () => {
    assert.ok(sql.includes("on public.leaderboard_entries\n  for select using (true)"));
    assert.ok(sql.includes("on public.leaderboard_entries\n  for insert with check"));
    assert.ok(sql.includes("on public.leaderboard_entries\n  for update using"));
    assert.ok(sql.includes("auth.uid()::text = profile_id"));
  });
  test("tidak ada policy tulis di tabel publik", () => {
    for (const table of ["kb_entries", "modules"]) {
      const writes = sql.match(
        new RegExp(`on public\\.${table} for (insert|update|delete|all)`, "gu"),
      );
      assert.equal(writes, null);
    }
  });
});

describe("rls 0001: idempoten (aman diulang)", () => {
  test("setiap create policy didahului drop if exists", () => {
    const creates = sql.match(/create policy "/gu) ?? [];
    const drops = sql.match(/drop policy if exists "/gu) ?? [];
    assert.ok(creates.length > 0);
    assert.equal(drops.length, creates.length);
  });
});
