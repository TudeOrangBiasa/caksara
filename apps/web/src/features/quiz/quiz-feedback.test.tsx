import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(join(import.meta.dirname, "quiz-feedback.tsx"), "utf8");
const EXPECTED_LINES = [
  `{explanation && <p className="mt-1 text-sm text-foreground/80">{explanation}</p>}`,
  `<p className="mt-2 text-xs text-foreground/80" role="status">`,
  `<p className="mt-1 text-[11px] text-foreground/80">`,
  `<p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border/60">`,
];

describe("QuizFeedback #49 — kontras teks panel feedback", () => {
  test("keempat baris memakai text-foreground/80", () => {
    for (const line of EXPECTED_LINES) {
      assert.ok(src.includes(line), `hilang: ${line.slice(0, 60)}…`);
    }
  });

  test("tidak ada text-muted-foreground tersisa di panel", () => {
    assert.equal(src.includes("text-muted-foreground"), false);
  });

  test("tint panel + warna judul tak tersentuh (benar & salah)", () => {
    assert.ok(src.includes("bg-success/15"));
    assert.ok(src.includes("bg-destructive/10"));
    assert.ok(src.includes('"text-cta"'));
    assert.ok(src.includes('"text-destructive"'));
  });
});
