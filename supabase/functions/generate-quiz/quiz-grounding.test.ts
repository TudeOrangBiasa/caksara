import { describe, test } from "node:test";
import assert from "node:assert/strict";

// #97: soal Gemini tanpa sourceRef KB yang valid tidak lolos ke FE.
// Tanpa live Gemini/Supabase: fixture di-parse Zod FE (sumber tunggal,
// identik dengan question.ts Edge), grounding dicek helper tanpa-impor
// sehingga jalan di bun tanpa runtime Deno.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { quizSchema } from "../../../apps/web/src/lib/zod/question";
import { allQuestionsGrounded, sourceRefId } from "./quiz-grounding";

const root = join(import.meta.dirname, "..", "..", "..");

const q = (over: Record<string, unknown>) => ({
  type: "dengar_pilih",
  prompt: "Pilih sapaan yang benar.",
  choices: [
    { text: "Om Swastiastu", isCorrect: true },
    { text: "Matur suksma", isCorrect: false },
    { text: "Sampun", isCorrect: false },
    { text: "Ngiring", isCorrect: false },
  ],
  ...over,
});

// KB yang di-inject di prompt Edge: id numerik kb_entries (serial PK).
const kbIds = new Set(["7", "8", "9"]);

describe("quiz grounding #97 — sourceRef resolve ke KB yang di-inject", () => {
  test("valid: 3 soal + sourceRef KB#7/8/9 → lolos Zod + grounded (jalur gemini)", () => {
    const parsed = quizSchema.safeParse({
      moduleId: "mod_01",
      questions: [
        q({ sourceRef: "KB#7 · Basis Pengetahuan" }),
        q({ sourceRef: "KB#8 · Basis Pengetahuan" }),
        q({ sourceRef: "KB#9 · Basis Pengetahuan" }),
      ],
    });
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(allQuestionsGrounded(parsed.data.questions, kbIds), true);
  });

  test("orphan: satu soal tanpa sourceRef → Zod lolos tapi grounding gagal (validation-fail)", () => {
    const parsed = quizSchema.safeParse({
      moduleId: "mod_01",
      questions: [
        q({ sourceRef: "KB#7 · Basis Pengetahuan" }),
        q({ sourceRef: "KB#8 · Basis Pengetahuan" }),
        q({}),
      ],
    });
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(allQuestionsGrounded(parsed.data.questions, kbIds), false);
  });

  test("palsu: sourceRef id tak di-inject (KB#999 / kb_palsu) → grounding gagal", () => {
    const parsed = quizSchema.safeParse({
      moduleId: "mod_01",
      questions: [
        q({ sourceRef: "KB#7 · Basis Pengetahuan" }),
        q({ sourceRef: "KB#999 · Basis Pengetahuan" }),
        q({ sourceRef: "kb_palsu · Basis Pengetahuan" }),
      ],
    });
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(allQuestionsGrounded(parsed.data.questions, kbIds), false);
  });

  test("KB kosong → grounding gagal (fallback bank, jangan kirim soal yatim)", () => {
    const parsed = quizSchema.safeParse({
      moduleId: "mod_01",
      questions: [
        q({ sourceRef: "KB#7 · Basis Pengetahuan" }),
        q({ sourceRef: "KB#8 · Basis Pengetahuan" }),
        q({ sourceRef: "KB#9 · Basis Pengetahuan" }),
      ],
    });
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(allQuestionsGrounded(parsed.data.questions, new Set()), false);
  });
});

describe("sourceRefId — ekstrak id KB dari sourceRef mentah", () => {
  test("'KB#12 · Basis Pengetahuan' → '12'; 'kb_x · …' → 'kb_x'", () => {
    assert.equal(sourceRefId("KB#12 · Basis Pengetahuan"), "12");
    assert.equal(sourceRefId("kb_galungan · Basis Pengetahuan"), "kb_galungan");
  });
  test("kosong/tanpa id → string kosong", () => {
    assert.equal(sourceRefId(), "");
    assert.equal(sourceRefId(""), "");
    assert.equal(sourceRefId(" · Basis Pengetahuan"), "");
  });
});

describe("x-quiz-source jujur — FE memetakan gemini vs fallback/offline", () => {
  test("quiz-generate.tsx: offline → 'offline', cached → 'cache', else 'gemini'", () => {
    const gen = readFileSync(
      join(root, "apps", "web", "src", "features", "quiz", "quiz-generate.tsx"),
      "utf8",
    );
    assert.match(gen, /data\.offline \? "offline" : data\.cached \? "cache" : "gemini"/u);
  });
});
