import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const shell = readFileSync(join(dir, "quiz-shell.tsx"), "utf8");
/**
 * Kontrak ref keyboard #46: listener didaftar sekali (`[]`), handler
 * membaca state terbaru lewat `keyStateRef.current` — bukan closure render.
 * Logika tombol (1-4 pilih, Enter lanjut hanya saat feedback) dipertahankan.
 */
describe("quiz-keyboard #46 — listener sekali, state lewat ref", () => {
  test("listener keydown terdaftar sekali dengan cleanup", () => {
    const register = shell.match(/window\.addEventListener\("keydown", onKey\)/g) ?? [];
    const cleanup = shell.match(/window\.removeEventListener\("keydown", onKey\)/g) ?? [];
    assert.equal(register.length, 1);
    assert.equal(cleanup.length, 1);
  });

  test("effect keyboard memakai deps kosong — tanpa re-subscribe per render", () => {
    const tail = shell.slice(shell.indexOf("window.addEventListener"));
    assert.match(tail.slice(0, 200), /},\s*\[\]\)/);
  });

  test("handler membaca showFeedback/currentIndex/questions dari ref, bukan closure", () => {
    for (const field of [
      "keyStateRef.current",
      "latest.showFeedback",
      "latest.currentIndex",
      "latest.questions",
      "latest.handleNext()",
      "latest.submitAnswer",
    ]) {
      assert.ok(shell.includes(field), `shell tak membaca lewat ref: ${field}`);
    }
  });

  test("logika tombol dipertahankan: 1-4 pilih, Enter hanya saat feedback, guard INPUT/TEXTAREA", () => {
    for (const snippet of [
      'e.key >= "1" && e.key <= "4"',
      'e.key === "Enter" && latest.showFeedback',
      'target.tagName === "INPUT"',
      'target.tagName === "TEXTAREA"',
      "showFeedback: session.showFeedback",
      "currentIndex: session.currentIndex",
    ]) {
      assert.ok(shell.includes(snippet), `kontrak hilang: ${snippet}`);
    }
  });

  test("ref diperbarui tiap render sebelum effect berjalan", () => {
    const refAssign = shell.indexOf("keyStateRef.current = {");
    const effectStart = shell.indexOf("useEffect(() => {\n    const onKey");
    assert.ok(
      refAssign > 0 && effectStart > refAssign,
      "ref harus diassign sebelum effect keyboard",
    );
  });

  test("tak ada effect keyboard tanpa deps (re-subscribe tiap render)", () => {
    assert.equal(shell.includes('removeEventListener("keydown", onKey);\n  });'), false);
  });
});
