/// <reference lib="deno.ns" />
// Prompt-build + validasi id untuk Edge guru-rag (#94 ask, #95 explain).
// Modul tanpa impor (seperti quiz-grounding.ts) sehingga bisa diuji langsung
// dari bun tanpa runtime Deno dan tanpa network/Supabase/Gemini.

/** Baris kb_entries minimal yang dibutuhkan sebagai konteks RAG. */
export interface RagKbRow {
  id: number | string;
  category: string;
  title: string;
  body: string;
  source: string;
  level: number | string;
}

export const GURU_RAG_MODEL = "gemini-3.1-flash-lite";
export const GURU_RAG_TEMPERATURE = 0.3;
/** Batas konteks agar prompt 27 entri muat di satu request flash-lite. */
export const GURU_RAG_MAX_CONTEXT_CHARS = 14_000;
/** Maksimal kutipan per jawaban — chip FE tidak dirancang untuk lebih. */
export const GURU_RAG_MAX_IDS = 3;

/** Potong body ke n karakter tanpa memenggal kata terakhir bila bisa. */
function excerpt(text: string, n: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= n) return clean;
  const cut = clean.slice(0, n);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > n * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

function sourceHead(source: string): string {
  const first = source.split("\n")[0]?.trim() ?? "";
  return first || "Rujukan KB";
}

/**
 * Konteks terikat: seluruh baris KB (id + judul + isi ringkas). Excerpt
 * adaptif menjamin semua id tetap muncul walau body panjang — id yang
 * hilang dari konteks tak bisa dikutip model (#94 grounding).
 */
export function kbContextLines(rows: readonly RagKbRow[]): { text: string; ids: string[] } {
  const ids = rows.map((r) => String(r.id));
  let len = 300;
  let text = "";
  while (len >= 75) {
    text =
      `Basis Pengetahuan CAKSARA (${rows.length} entri — satu-satunya sumber jawaban):\n` +
      rows
        .map(
          (r) =>
            `- KB#${r.id} [${r.category}/L${r.level}] ${r.title}: ${excerpt(r.body, len)} (sumber: ${sourceHead(r.source)})`,
        )
        .join("\n");
    if (text.length <= GURU_RAG_MAX_CONTEXT_CHARS) break;
    len = Math.floor(len / 2);
  }
  return { text, ids };
}

const GROUND_RULES = [
  "Aturan mengikat:",
  "- Jawab HANYA dari Basis Pengetahuan di bawah; jangan tambah fakta luar.",
  "- Kutip 1-3 id dari daftar (entryIds); id di luar daftar DITOLAK.",
  '- Bila pertanyaan di luar materi → outside:true dan answer:"" (FE yang menampilkan kalimat tolak).',
  "- Balas hanya JSON { answer, entryIds, outside }, tanpa markdown fence.",
].join("\n");

/** Prompt tanya-jawab Guru (#94). */
export function buildAskPrompt(question: string, context: string): string {
  return [
    "Kamu Bedawang Nala, guru virtual CAKSARA (aksara & budaya Bali).",
    `Pertanyaan murid: ${question.trim()}`,
    GROUND_RULES,
    context,
  ].join("\n");
}

export interface ExplainInput {
  prompt: string;
  userChoice: string;
  entryHint: string;
}

/** Prompt penjelasan jawaban salah (#95 "Kenapa?"): 2-3 kalimat + kutipan. */
export function buildExplainPrompt(input: ExplainInput, context: string): string {
  return [
    "Kamu Bedawang Nala, guru virtual CAKSARA (aksara & budaya Bali).",
    "Jelaskan kenapa jawaban murid salah dalam 2-3 kalimat singkat.",
    `Soal: ${input.prompt.trim()}`,
    `Jawaban murid (salah): ${input.userChoice.trim() || "-"}`,
    `Rujukan soal (bila relevan): ${input.entryHint.trim() || "-"}`,
    GROUND_RULES,
    context,
  ].join("\n");
}

/**
 * Saring entryIds model ke id yang di-inject: buang asing/kosong/duplikat,
 * cap 3. Sibling dari allQuestionsGrounded (#97) untuk bentuk RAG.
 */
export function filterValidIds(ids: unknown, known: ReadonlySet<string>): string[] {
  if (!Array.isArray(ids)) return [];
  const out: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string" || id.length === 0) continue;
    if (!known.has(id) || out.includes(id)) continue;
    out.push(id);
    if (out.length >= GURU_RAG_MAX_IDS) break;
  }
  return out;
}

/** Judul chip FE per id valid; id tak dikenal dilewati (jangan chip palsu). */
export function citationsFor(
  ids: readonly string[],
  rows: readonly RagKbRow[],
): { id: string; title: string }[] {
  return ids.flatMap((id) => {
    const row = rows.find((r) => String(r.id) === id);
    return row ? [{ id, title: row.title }] : [];
  });
}

/** Ambil JSON dari teks model (mentah atau berpagar ```json). */
export function extractJson(raw: string): unknown {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/iu);
  const text = (fence?.[1] ?? raw).trim();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
