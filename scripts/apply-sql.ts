#!/usr/bin/env bun
// Apply SQL mentah ke Supabase (RLS, cron) — drizzle-kit push tidak bisa.
// Pakai: bun run db:apply-sql supabase/rls/0001_rls.sql
// Butuh DATABASE_URL di .env root (lihat .env.example).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const file = process.argv[2];
if (!file) {
  console.error("Pakai: bun run db:apply-sql <file.sql>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL missing — set in .env root (lihat .env.example)");
}

const sqlText = readFileSync(resolve(file), "utf8");
const sql = postgres(url, { max: 1 });
try {
  await sql.unsafe(sqlText);
  console.log(`✓ Applied: ${file}`);
} finally {
  await sql.end();
}
