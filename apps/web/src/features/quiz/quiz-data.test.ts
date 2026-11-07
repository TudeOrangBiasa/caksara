import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  buildMixedQuiz,
  buildSessionQuiz,
  getAdaptiveLevel,
  hasVariety,
  pickSessionQuestions,
  QUIZ_BANK,
  recordSessionLevel,
  validateQuizBank,
} from "./quiz-data";
import type { Question } from "../../lib/zod/question";

describe("sesi kuis #23 — 5 tipe bervariasi + dengar_pilih", () => {
  test("setiap modul punya soal dengar_pilih dengan badge Latin (bukan TTS aksara)", () => {
    for (const mod of ["mod_01", "mod_02", "mod_03", "mod_04"]) {
      const bank = QUIZ_BANK[mod] ?? [];
      const dengar = bank.filter((q) => q.type === "dengar_pilih");
      assert.ok(dengar.length >= 1, `${mod} tanpa dengar_pilih`);
      for (const q of dengar) {
        assert.equal(q.audioType, "latin");
        assert.ok(
          typeof q.latinText === "string" && q.latinText.length > 0,
          `${mod} dengar_pilih tanpa latinText`,
        );
        assert.ok(!q.audioUrl, `${mod} memakai audioUrl palsu`);
      }
    }
  });

  test("sesi tepat 8 soal dengan 2+ tipe termasuk dengar_pilih", () => {
    for (const mod of ["mod_01", "mod_02", "mod_03", "mod_04"]) {
      const quiz = buildSessionQuiz(mod, { seed: 0 });
      assert.equal(quiz.questions.length, 8);
      assert.ok(hasVariety(quiz.questions, 2), `${mod} kurang bervariasi`);
      assert.ok(
        quiz.questions.some((q) => q.type === "dengar_pilih"),
        `${mod} sesi tanpa dengar_pilih`,
      );
    }
  });

  test("pengulangan sesi memutar urutan soal (tidak monoton)", () => {
    const first = buildSessionQuiz("mod_01", { seed: 0 }).questions.map((q) => q.prompt);
    const second = buildSessionQuiz("mod_01", { seed: 1 }).questions.map((q) => q.prompt);
    assert.notDeepEqual(first, second);
    assert.deepEqual([...first].sort(), [...second].sort());
  });

  test("pilihan deterministik: seed sama → urutan sama (aman resume)", () => {
    const a = pickSessionQuestions(QUIZ_BANK.mod_01 ?? [], { level: 1, seed: 2 });
    const b = pickSessionQuestions(QUIZ_BANK.mod_01 ?? [], { level: 1, seed: 2 });
    assert.deepEqual(
      a.map((q) => q.prompt),
      b.map((q) => q.prompt),
    );
  });

  test("level adaptif: anjlok → turun, lancar → naik, sedang → tetap", () => {
    const mod = "mod_test_adaptif";
    recordSessionLevel(mod, 1, 5);
    assert.equal(getAdaptiveLevel(mod), 1);
    recordSessionLevel(mod, 5, 5);
    recordSessionLevel(mod, 5, 5);
    assert.equal(getAdaptiveLevel(mod), 3);
    recordSessionLevel(mod, 0, 5);
    assert.equal(getAdaptiveLevel(mod), 2);
  });

  test("salah terus (wrongTopics) di skor sedang → turun, lancar → naik", () => {
    const mod = "mod_test_wrongtopics";
    recordSessionLevel(mod, 5, 5);
    assert.equal(getAdaptiveLevel(mod), 2);
    recordSessionLevel(mod, 2, 5, ["wre_01", "wre_02"]);
    assert.equal(getAdaptiveLevel(mod), 1);
    recordSessionLevel(mod, 5, 5);
    assert.equal(getAdaptiveLevel(mod), 2);
    recordSessionLevel(mod, 4, 5);
    assert.equal(getAdaptiveLevel(mod), 3);
  });

  test("skor sempurna + wrongTopics → tahan, tidak naik", () => {
    const mod = "mod_test_wrongtopics_hold";
    recordSessionLevel(mod, 5, 5);
    assert.equal(getAdaptiveLevel(mod), 2);
    recordSessionLevel(mod, 5, 5, ["wre_01"]);
    assert.equal(getAdaptiveLevel(mod), 2);
    recordSessionLevel(mod, 4, 4, ["kb_sapaan"]);
    assert.equal(getAdaptiveLevel(mod), 2);
  });
});

describe("debt #42 — bank tervalidasi Zod saat dimuat", () => {
  test("semua modul lolos parse dengan pesan modul bernama", () => {
    for (const [moduleId, bank] of Object.entries(QUIZ_BANK)) {
      assert.ok(validateQuizBank(moduleId, bank).length > 0, `${moduleId} kosong`);
    }
  });

  test("entri invalid ditolak dengan nama modul", () => {
    const bad = [
      {
        type: "kenali_visual",
        prompt: "",
        choices: [{ text: "satu", isCorrect: true }],
      },
    ] as unknown as Question[];
    assert.throws(() => validateQuizBank("mod_xx", bad), /QUIZ_BANK\.mod_xx invalid/u);
  });
});

describe("debt #43 — buildMixedQuiz deterministik per seed", () => {
  const mods = ["mod_01", "mod_02"];

  test("seed sama → urutan sama", () => {
    const a = buildMixedQuiz(mods, 7).questions.map((q) => q.prompt);
    const b = buildMixedQuiz(mods, 7).questions.map((q) => q.prompt);
    assert.deepEqual(a, b);
  });

  test("seed beda → himpunan sama, urutan berputar", () => {
    const first = buildMixedQuiz(mods, 0).questions.map((q) => q.prompt);
    const second = buildMixedQuiz(mods, 1).questions.map((q) => q.prompt);
    assert.deepEqual([...first].sort(), [...second].sort());
    if (first.length > 1) assert.notDeepEqual(first, second);
  });

  test("tanpa argumen / tanpa seed jalan dengan default deterministik", () => {
    const zero = buildMixedQuiz().questions.map((q) => q.prompt);
    const one = buildMixedQuiz(mods).questions.map((q) => q.prompt);
    const two = buildMixedQuiz(mods, 3).questions.map((q) => q.prompt);
    assert.ok(zero.length >= 3 && zero.length <= 8, `campuran default ${zero.length} soal`);
    assert.ok(one.length >= 3 && one.length <= 8, `campuran 1-arg ${one.length} soal`);
    assert.ok(two.length >= 3 && two.length <= 8, `campuran 2-arg ${two.length} soal`);
    assert.deepEqual(
      one,
      buildMixedQuiz(mods).questions.map((q) => q.prompt),
    );
  });
});
