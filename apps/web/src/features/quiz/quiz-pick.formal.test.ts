import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { pickSessionQuestions, SESSION_COUNT, MIN_TYPES } from "./quiz-pick";
import type { Question } from "../../lib/zod/question";

// F1a — properti dengan prakondisi (advisory: ∀ tanpa syarat itu salah).
// Syarat: bank.length >= 8 && bankTypes.size >= 2.
// Tanpa syarat ini, cabang l39 (bank kosong → []) dan l102
// (byLevel.slice → <8) dan l73-76 (filtered → 1 tipe) sah mematahkan klaim.

function bankBesar(duaTipe = true): Question[] {
  const types: Question["type"][] = duaTipe
    ? ["dengar_pilih", "kenali_visual", "checkpoint_budaya", "susun_aksara", "cocokkan"]
    : ["kenali_visual"];
  const bank: Question[] = [];
  for (let i = 0; i < 12; i++) {
    const t = types[i % types.length] as Question["type"];
    if (t === "susun_aksara") {
      bank.push({ type: t, prompt: `susun ${i}`, tiles: ["a", "b"], level: (i % 3) + 1 });
    } else if (t === "cocokkan") {
      bank.push({
        type: t,
        prompt: `pasang ${i}`,
        pairs: [{ left: "x", right: "y" }],
        level: (i % 3) + 1,
      });
    } else {
      bank.push({
        type: t,
        prompt: `pilih ${i}`,
        choices: [
          { text: "benar", isCorrect: true },
          { text: "salah", isCorrect: false },
        ],
        level: (i % 3) + 1,
      });
    }
  }
  return bank;
}

describe("F1a pickSessionQuestions — properti bersyarat (bank>=8, tipe>=2)", () => {
  test("tepat SESSION_COUNT=8 soal", () => {
    assert.equal(SESSION_COUNT, 8);
    const out = pickSessionQuestions(bankBesar(), { level: 1, seed: 0 });
    assert.equal(out.length, 8);
  });

  test("2–5 tipe berbeda (MIN_TYPES=2)", () => {
    assert.equal(MIN_TYPES, 2);
    const out = pickSessionQuestions(bankBesar(), { level: 2, seed: 3 });
    const n = new Set(out.map((q) => q.type)).size;
    assert.ok(n >= 2 && n <= 5, `tipe=${n}`);
  });

  test("dengar_pilih wajib bila bank mengandungnya", () => {
    for (const seed of [0, 1, 2, 3, 7, 42]) {
      const out = pickSessionQuestions(bankBesar(), { level: 1, seed });
      assert.ok(
        out.some((q) => q.type === "dengar_pilih"),
        `seed ${seed} tanpa dengar_pilih`,
      );
    }
  });

  test("seed sama → urutan sama; seed beda → himpunan sama, urutan rotasi", () => {
    const a = pickSessionQuestions(bankBesar(), { level: 1, seed: 2 }).map((q) => q.prompt);
    const b = pickSessionQuestions(bankBesar(), { level: 1, seed: 2 }).map((q) => q.prompt);
    assert.deepEqual(a, b);
    const c = pickSessionQuestions(bankBesar(), { level: 1, seed: 5 }).map((q) => q.prompt);
    assert.deepEqual(c.toSorted(), a.toSorted());
  });

  test("sweep seed 0..19 tak pernah melanggar (himpunan tetap, 8 soal)", () => {
    const ref = pickSessionQuestions(bankBesar(), { level: 1, seed: 0 })
      .map((q) => q.prompt)
      .toSorted();
    for (let seed = 0; seed < 20; seed++) {
      const out = pickSessionQuestions(bankBesar(), { level: 1, seed });
      assert.equal(out.length, 8);
      assert.deepEqual(out.map((q) => q.prompt).toSorted(), ref, `seed ${seed} ganti himpunan`);
    }
  });
});

describe("F1b pickSessionQuestions — tabel edge (bank kecil / satu tipe)", () => {
  test("bank kosong → [] (bukan 8 soal)", () => {
    assert.deepEqual(pickSessionQuestions([], { level: 1, seed: 0 }), []);
  });

  test("bank <8 → len==min(8,len)", () => {
    const kecil: Question[] = [
      {
        type: "kenali_visual",
        prompt: "satu",
        choices: [
          { text: "a", isCorrect: true },
          { text: "b", isCorrect: false },
        ],
      },
      {
        type: "kenali_visual",
        prompt: "dua",
        choices: [
          { text: "a", isCorrect: true },
          { text: "b", isCorrect: false },
        ],
      },
    ];
    const out = pickSessionQuestions(kecil, { level: 1, seed: 0 });
    assert.equal(out.length, Math.min(8, kecil.length));
  });

  test("bank satu tipe → 1 tipe sah, bukan klaim 2–5", () => {
    const out = pickSessionQuestions(bankBesar(false), { level: 1, seed: 0 });
    assert.equal(new Set(out.map((q) => q.type)).size, 1);
  });

  test("bank tanpa dengar_pilih → sesi tanpa dengar_pilih sah", () => {
    const tanpa: Question[] = bankBesar().filter((q) => q.type !== "dengar_pilih");
    const out = pickSessionQuestions(tanpa, { level: 1, seed: 0 });
    assert.ok(!out.some((q) => q.type === "dengar_pilih"));
  });
});
