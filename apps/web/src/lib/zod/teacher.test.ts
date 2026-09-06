import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { teacherAnswerSchema, teacherQuestionSchema } from "./teacher";

describe("teacherQuestionSchema", () => {
  test("pertanyaan wajar lolos", () => {
    assert.equal(teacherQuestionSchema.safeParse({ question: "Apa itu Wresastra?" }).success, true);
  });

  test("pertanyaan kosong dan kepanjangan ditolak", () => {
    assert.equal(teacherQuestionSchema.safeParse({ question: "" }).success, false);
    assert.equal(teacherQuestionSchema.safeParse({ question: "x".repeat(501) }).success, false);
  });
});

describe("teacherAnswerSchema", () => {
  test("jawaban dalam KB wajib menyertakan sourceRef", () => {
    const cited = teacherAnswerSchema.safeParse({
      kind: "answer",
      text: "Wresastra adalah 18 aksara dasar Bali.",
      sourceRefs: ["KB-03"],
    });
    const uncited = teacherAnswerSchema.safeParse({
      kind: "answer",
      text: "Wresastra adalah 18 aksara dasar Bali.",
      sourceRefs: [],
    });
    assert.equal(cited.success, true);
    assert.equal(uncited.success, false);
  });

  test("di luar materi jatuh ke fallback sopan plus pills", () => {
    const parsed = teacherAnswerSchema.safeParse({
      kind: "fallback",
      text: "Di luar materi, coba seputar aksara, bahasa, atau budaya Bali ya.",
      pills: ["Apa itu Wresastra?", "Tulis namaku"],
    });
    assert.equal(parsed.success, true);
  });
});
