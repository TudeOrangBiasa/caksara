/// <reference lib="deno.ns" />
// Grounding check #97: soal Gemini wajib mengutip KB Entry yang di-inject.
// Modul tanpa impor (seperti secret-keys.ts) sehingga bisa diuji langsung
// dari bun tanpa runtime Deno dan tanpa network/Supabase/Gemini.

/** Satu soal pasca-Zod yang membawa sourceRef opsional. */
export interface GroundedQuestion {
  sourceRef?: string;
}

/**
 * Ekstrak id KB dari sourceRef mentah ("kb_x · Basis Pengetahuan" atau
 * "KB#12 · Basis Pengetahuan …") → "kb_x" / "12". Kosong bila tak ada id.
 */
export function sourceRefId(sourceRef?: string): string {
  if (!sourceRef) return "";
  const head = sourceRef.split("·")[0]?.trim() ?? "";
  if (!head) return "";
  const hash = head.match(/^KB#(\d+)$/iu);
  if (hash?.[1]) return hash[1];
  return head;
}

/**
 * True bila setiap soal membawa sourceRef yang resolve ke salah satu id KB
 * yang di-inject di prompt. Gagal → jalur validation-fail (retry/fallback
 * bank), jangan kirim soal yatim ke FE.
 */
export function allQuestionsGrounded(
  questions: readonly GroundedQuestion[],
  kbIds: ReadonlySet<string>,
): boolean {
  if (questions.length === 0 || kbIds.size === 0) return false;
  return questions.every((q) => kbIds.has(sourceRefId(q.sourceRef)));
}
