import { describe, test } from "node:test";
import assert from "node:assert/strict";

// #94/#95: prompt-build RAG + saring id — tanpa live Gemini/Supabase.
// rag-context.ts tanpa impor sehingga jalan di bun tanpa runtime Deno
// (pola quiz-grounding.test.ts). Schema Zod diuji via rag.test.ts FE
// (sumber tunggal; Edge rag-schema.ts vendored — JAGA SINKRON).
import {
  buildAskPrompt,
  buildExplainPrompt,
  citationsFor,
  extractJson,
  filterValidIds,
  GURU_RAG_MAX_CONTEXT_CHARS,
  GURU_RAG_MODEL,
  GURU_RAG_TEMPERATURE,
  kbContextLines,
  type RagKbRow,
} from "./rag-context";

const row = (id: number, over: Partial<RagKbRow> = {}): RagKbRow => ({
  id,
  category: "budaya",
  title: `Entri ${id}`,
  body: `Isi materi entri ${id} tentang budaya Bali.`,
  source: "Parasali — Tradisi & hari raya",
  level: 2,
  ...over,
});

// Bank 27: 18 wresastra + 9 kosakata/budaya (cermin kb-data.ts).
const bank27: RagKbRow[] = [
  ...Array.from({ length: 18 }, (_, i) =>
    row(i + 1, { category: "wresastra", title: `Aksara ${i + 1}`, level: (i % 3) + 1 }),
  ),
  ...Array.from({ length: 9 }, (_, i) =>
    row(19 + i, { category: i < 6 ? "kosakata" : "budaya", level: (i % 3) + 1 }),
  ),
];

describe("kbContextLines — seluruh 27 entri sebagai konteks terikat #94", () => {
  test("teks memuat semua 27 id (KB#1..KB#27) + judul + excerpt isi", () => {
    const { text, ids } = kbContextLines(bank27);
    assert.equal(ids.length, 27);
    for (let i = 1; i <= 27; i++) {
      assert.ok(text.includes(`KB#${i} `), `KB#${i} hilang dari konteks`);
    }
    assert.ok(text.includes("Aksara 1"));
    assert.ok(text.includes("Isi materi entri 27"));
    assert.ok(text.length <= GURU_RAG_MAX_CONTEXT_CHARS);
  });

  test("body raksasa → excerpt menyusut tapi semua id TETAP muncul", () => {
    const fat = bank27.map((r) => row(Number(r.id), { body: "kata ".repeat(5000) }));
    const { text, ids } = kbContextLines(fat);
    assert.equal(ids.length, 27);
    for (let i = 1; i <= 27; i++) {
      assert.ok(text.includes(`KB#${i} `), `KB#${i} hilang saat excerpt menyusut`);
    }
    assert.ok(text.length <= GURU_RAG_MAX_CONTEXT_CHARS);
  });
});

describe("buildAskPrompt / buildExplainPrompt — aturan grounding di prompt", () => {
  test("ask: pertanyaan + aturan HANYA-dari-KB + outside + konteks", () => {
    const { text } = kbContextLines(bank27.slice(0, 2));
    const p = buildAskPrompt("Apa arti Galungan?", text);
    assert.ok(p.includes("Apa arti Galungan?"));
    assert.ok(p.includes("HANYA dari Basis Pengetahuan"));
    assert.ok(p.includes("outside:true"));
    assert.ok(p.includes("KB#1 "));
    assert.ok(p.includes("temperature") === false, "temp di generationConfig, bukan prompt");
  });

  test("explain: soal + pilihan salah + hint + batas 2-3 kalimat", () => {
    const { text } = kbContextLines(bank27.slice(0, 2));
    const p = buildExplainPrompt(
      { prompt: "Apa arti sapaan ini?", userChoice: "Selamat pagi", entryHint: "kb_sapaan" },
      text,
    );
    assert.ok(p.includes("2-3 kalimat"));
    assert.ok(p.includes("Selamat pagi"));
    assert.ok(p.includes("kb_sapaan"));
    assert.ok(p.includes("HANYA dari Basis Pengetahuan"));
  });

  test("model + temp terkunci per CODING_STANDARDS §6", () => {
    assert.equal(GURU_RAG_MODEL, "gemini-3.1-flash-lite");
    assert.equal(GURU_RAG_TEMPERATURE, 0.3);
  });
});

describe("filterValidIds — buang id asing server-side (sibling #97)", () => {
  const known = new Set(["1", "2", "3"]);

  test("valid lolos; asing/kosong/duplikat dibuang; cap 3", () => {
    assert.deepEqual(filterValidIds(["1", "999", "", "1", "2", "3", "2"], known), ["1", "2", "3"]);
    assert.deepEqual(filterValidIds(["7", "8"], known), []);
  });

  test("bukan array → kosong (jangan lempar)", () => {
    assert.deepEqual(filterValidIds("1", known), []);
    assert.deepEqual(filterValidIds(null, known), []);
  });
});

describe("citationsFor + extractJson — chip FE + parse pagar", () => {
  test("citations: id dikenal → judul; asing dilewati", () => {
    const rows = [row(1, { title: "Galungan" }), row(2, { title: "Nyepi" })];
    assert.deepEqual(citationsFor(["1", "999", "2"], rows), [
      { id: "1", title: "Galungan" },
      { id: "2", title: "Nyepi" },
    ]);
  });

  test("extractJson: mentah + berpagar ```json; rusak → null", () => {
    assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
    assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
    assert.equal(extractJson("bukan json"), null);
  });
});
