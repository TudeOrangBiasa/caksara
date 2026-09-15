import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { answerSchema } from "./answer";

describe("answerSchema", () => {
  test("jawaban lengkap lolos dengan aksaraId untuk Mastery", () => {
    const parsed = answerSchema.safeParse({
      sessionId: 1,
      questionIdx: 0,
      aksaraId: "ha",
      correct: true,
    });
    assert.equal(parsed.success, true);
  });

  test("tanpa correct ditolak — Hati/XP butuh kepastian", () => {
    const parsed = answerSchema.safeParse({ sessionId: 1, questionIdx: 0 });
    assert.equal(parsed.success, false);
  });

  test("questionIdx negatif ditolak", () => {
    const parsed = answerSchema.safeParse({ sessionId: 1, questionIdx: -1, correct: false });
    assert.equal(parsed.success, false);
  });

  test("tanpa aksaraId tetap lolos untuk soal non-Wresastra", () => {
    const parsed = answerSchema.safeParse({ sessionId: 1, questionIdx: 2, correct: false });
    assert.equal(parsed.success, true);
  });
});
