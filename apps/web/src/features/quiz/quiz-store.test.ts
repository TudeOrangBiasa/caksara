import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { gradeAnswer } from "./quiz-kind";
import type { QuizAnswer } from "./quiz-store";
import type { Question } from "../../lib/zod/question";

const sapaan: Question = {
  type: "cocokkan",
  prompt: "Pasangkan sapaan dengan artinya.",
  pairs: [
    { left: "Om Swastiastu", right: "Salam sejahtera" },
    { left: "Rahajeng semeng", right: "Selamat pagi" },
    { left: "Suksma", right: "Terima kasih" },
  ],
};

describe("cocokkan: soal selesai hanya bila SEMUA pasangan matched", () => {
  test("regresi skip level: satu pasangan benar (bentuk jawaban lama) TIDAK menyelesaikan soal", () => {
    const legacySingle = {
      match: { left: "Om Swastiastu", right: "Salam sejahtera" },
    } as unknown as QuizAnswer;
    assert.equal(gradeAnswer(sapaan, legacySingle), false);
  });

  test("satu dari tiga pasangan → belum selesai", () => {
    assert.equal(gradeAnswer(sapaan, { matches: { "Om Swastiastu": "Salam sejahtera" } }), false);
  });

  test("semua pasangan benar → selesai", () => {
    assert.equal(
      gradeAnswer(sapaan, {
        matches: {
          "Om Swastiastu": "Salam sejahtera",
          "Rahajeng semeng": "Selamat pagi",
          Suksma: "Terima kasih",
        },
      }),
      true,
    );
  });

  test("satu pasangan tertukar → salah", () => {
    assert.equal(
      gradeAnswer(sapaan, {
        matches: {
          "Om Swastiastu": "Salam sejahtera",
          "Rahajeng semeng": "Terima kasih",
          Suksma: "Selamat pagi",
        },
      }),
      false,
    );
  });
});
