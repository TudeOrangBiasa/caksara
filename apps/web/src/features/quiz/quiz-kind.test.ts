import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CHOICE_KINDS, gradeAnswer, KIND_GRADE } from "./quiz-kind";
import type { Question } from "../../lib/zod/question";

const choiceQ: Question = {
  type: "kenali_visual",
  prompt: "Arti?",
  choices: [
    { text: "Salah", isCorrect: false },
    { text: "Benar", isCorrect: true },
  ],
};

const susunQ: Question = {
  type: "susun_aksara",
  prompt: "Susun.",
  tiles: ["a", "b"],
};

const cocokQ: Question = {
  type: "cocokkan",
  prompt: "Pasangkan.",
  pairs: [{ left: "x", right: "y" }],
};

describe("quiz-kind — satu seam grade per tipe", () => {
  test("tabel mencakup semua 5 tipe", () => {
    assert.deepEqual(Object.keys(KIND_GRADE).sort(), [
      "checkpoint_budaya",
      "cocokkan",
      "dengar_pilih",
      "kenali_visual",
      "susun_aksara",
    ]);
  });

  test("choice kinds: 3 benar, 2 salah", () => {
    assert.equal(CHOICE_KINDS.dengar_pilih, true);
    assert.equal(CHOICE_KINDS.kenali_visual, true);
    assert.equal(CHOICE_KINDS.checkpoint_budaya, true);
    assert.equal(CHOICE_KINDS.susun_aksara, false);
    assert.equal(CHOICE_KINDS.cocokkan, false);
  });

  test("grade tiap tipe via tabel", () => {
    assert.equal(gradeAnswer(choiceQ, { selectedIndex: 1 }), true);
    assert.equal(gradeAnswer(choiceQ, { selectedIndex: 0 }), false);
    assert.equal(gradeAnswer(susunQ, { ordered: ["a", "b"] }), true);
    assert.equal(gradeAnswer(susunQ, { ordered: ["b", "a"] }), false);
    assert.equal(gradeAnswer(cocokQ, { matches: { x: "y" } }), true);
    assert.equal(gradeAnswer(cocokQ, { matches: { x: "z" } }), false);
  });
});
