// Filter murni KB #25 — dipakai KbList, diuji di kb-filter.test.ts (tanpa DOM).
import type { KbCategory, KbEntry, KbLevel } from "./kb-data";

export type KbCategoryFilter = "semua" | KbCategory;
export type KbLevelFilter = "semua" | KbLevel;

export type KbFilterInput = Pick<KbEntry, "category" | "title" | "body" | "level"> & {
  latin?: string;
};

export function kbMatchesFilter(
  e: KbFilterInput,
  opts: { category: KbCategoryFilter; level: KbLevelFilter; query: string },
): boolean {
  if (opts.category !== "semua" && e.category !== opts.category) return false;
  if (opts.level !== "semua" && e.level !== opts.level) return false;
  const q = opts.query.trim().toLowerCase();
  if (q) {
    const hay = `${e.title} ${e.latin ?? ""} ${e.body}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}
