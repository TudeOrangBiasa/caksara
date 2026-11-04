import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const webRoot = join(import.meta.dir, "..", "..", "..");
const uiRoot = join(webRoot, "..", "..", "packages", "ui", "src", "styles");
const src = (p: string) => readFileSync(join(webRoot, "src", p), "utf8");

describe("Micro-interactions Digifest (#104)", () => {
  test("tanpa pustaka animasi berat", () => {
    const pkg = JSON.parse(readFileSync(join(webRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    expect("framer" + "-motion" in (pkg.dependencies ?? {})).toBe(false);
  });

  test("AnswerShake: pilihan salah dapat animate-shake", () => {
    const choice = src("features/quiz/quiz-choice.tsx");
    expect(choice.includes("shouldShake")).toBe(true);
    expect(choice.includes("animate-shake")).toBe(true);
  });

  test("pilihan min-h-11 (≥44px)", () => {
    expect(src("features/quiz/quiz-choice.tsx").includes("min-h-11")).toBe(true);
  });

  test("XpTick count-up di badge feedback benar", () => {
    expect(src("features/quiz/quiz-feedback.tsx").includes("<XpTick")).toBe(true);
    expect(src("features/quiz/xp-tick.tsx").includes("useCountUp")).toBe(true);
  });

  test("feedback sticky di bawah viewport soal", () => {
    expect(src("features/quiz/quiz-feedback.tsx").includes("sticky bottom-0")).toBe(true);
  });

  test("progress segmen transition-colors duration-300", () => {
    expect(src("features/quiz/quiz-shell.tsx").includes("transition-colors duration-300")).toBe(
      true,
    );
  });

  test("streak Flame pulse hanya bila streak>0 dan motion OK", () => {
    const dash = src("features/dashboard/dashboard.tsx");
    expect(dash.includes("streakPulse")).toBe(true);
    expect(dash.includes("usePrefersReducedMotion")).toBe(true);
  });

  test("confetti mati bila passed=false atau reduced-motion", () => {
    expect(src("features/quiz/quiz-result.tsx").includes("active={passed && !reduceMotion}")).toBe(
      true,
    );
  });

  test("shake ±4px 300ms + reduced-motion mematikan shake/pulse/confetti", () => {
    const css = readFileSync(join(uiRoot, "globals.css"), "utf8");
    expect(css.includes("--animate-shake: quiz-shake 300ms")).toBe(true);
    expect(css.includes("translateX(-4px)")).toBe(true);
    expect(css.includes("translateX(4px)")).toBe(true);
    const guard = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    for (const cls of [".animate-shake", ".animate-pulse", '[class*="animate-confetti"]']) {
      expect(guard.includes(cls)).toBe(true);
    }
    expect(guard.includes("animation: none !important")).toBe(true);
  });

  test("Bedawang mood senang/sedih di feedback", () => {
    const fb = src("features/quiz/quiz-feedback.tsx");
    expect(fb.includes('mood={isCorrect ? "senang" : "sedih"}')).toBe(true);
  });
});
