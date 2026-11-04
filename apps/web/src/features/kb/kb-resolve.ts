// Resolver murni deep-link /kb/:id #67 — tanpa router, diuji di kb-resolve.test.ts.
import { KB_ENTRIES } from "./kb-data";
import type { KbEntry } from "./kb-data";
export function resolveKbEntry(id?: string): KbEntry | null {
  if (!id) return null;
  return KB_ENTRIES.find((e) => e.id === id) ?? null;
}
