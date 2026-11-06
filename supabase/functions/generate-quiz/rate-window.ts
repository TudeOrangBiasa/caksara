/// <reference lib="deno.ns" />
// Bucket jam UTC untuk rate-limit #60: counter 50/jam via kolom window_hour +
// index (profile_id, window_hour). Modul tanpa impor (seperti quiz-grounding.ts
// dan secret-keys.ts) sehingga bisa diuji langsung dari bun tanpa runtime
// Deno dan tanpa network/Supabase/Gemini.

/** Truncate ke awal jam UTC: "2026-11-04T13:45:00.000Z" → "...T13:00:00.000Z". */
export function windowHourStart(now: Date | string | number = Date.now()): string {
  const d = now instanceof Date ? now : new Date(now);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours()),
  ).toISOString();
}

/** Satu baris quiz_calls yang dibaca checkRateLimit. */
export interface QuizCallRow {
  called_at: string;
  window_hour?: string | null;
}

/**
 * Semantik rate-limit tak berubah (#60): tolak bila ≥10 panggilan dalam
 * 60 detik terakhir ATAU ≥50 dalam 60 menit terakhir.
 */
export function rateLimited(calledAts: string[]): boolean {
  const now = Date.now();
  const lastMinute = calledAts.filter((iso) => Date.parse(iso) >= now - 60_000).length;
  const lastHour = calledAts.filter((iso) => Date.parse(iso) >= now - 3_600_000).length;
  return lastMinute >= 10 || lastHour >= 50;
}

/**
 * True bila jalur cepat #60 boleh dipakai: setiap baris membawa window_hour
 * (tak ada baris pra-migrasi null) sehingga hitung agregat atas index
 * (profile_id, window_hour) lengkap tanpa fallback in-memory.
 */
export function canUseFastPath(rows: readonly QuizCallRow[]): boolean {
  return (
    rows.length > 0 && rows.every((r) => r.window_hour !== null && r.window_hour !== undefined)
  );
}
