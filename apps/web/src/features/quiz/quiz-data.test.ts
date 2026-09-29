import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSessionQuiz,
  getAdaptiveLevel,
  hasVariety,
  pickSessionQuestions,
  QUIZ_BANK,
  recordSessionLevel,
} from "./quiz-data";

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

  test("sesi berisi 3-8 soal dengan 2+ tipe termasuk dengar_pilih", () => {
    for (const mod of ["mod_01", "mod_02", "mod_03", "mod_04"]) {
      const quiz = buildSessionQuiz(mod, { seed: 0 });
      assert.ok(quiz.questions.length >= 3 && quiz.questions.length <= 8);
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
