import { describe, expect, test } from "bun:test";
import { fetchGeneratedQuiz, isRateLimitedError } from "./quiz-generate";
import type { Quiz } from "../../lib/zod/question";

function quizTiga(): Quiz {
  return {
    moduleId: "mod_01",
    questions: [
      {
        type: "kenali_visual",
        prompt: "Apa arti 'Om Swastiastu'?",
        choices: [
          { text: "Salam sejahtera", isCorrect: true },
          { text: "Selamat tinggal", isCorrect: false },
        ],
      },
      {
        type: "kenali_visual",
        prompt: "Kata 'matur' artinya?",
        choices: [
          { text: "Bicara", isCorrect: true },
          { text: "Diam", isCorrect: false },
        ],
      },
      {
        type: "kenali_visual",
        prompt: "Galungan merayakan?",
        choices: [
          { text: "Dharma atas adharma", isCorrect: true },
          { text: "Panen raya", isCorrect: false },
        ],
      },
    ],
  };
}

describe("isRateLimitedError — 429 vs non-429 #29", () => {
  test("Response 429 di context → true", () => {
    expect(isRateLimitedError({ context: new Response(null, { status: 429 }) })).toBe(true);
  });

  test("status 429 polos di context → true", () => {
    expect(isRateLimitedError({ context: { status: 429 } })).toBe(true);
  });

  test("pesan Edge 429 → true", () => {
    expect(isRateLimitedError({ message: "terlalu banyak permintaan, coba lagi sebentar" })).toBe(
      true,
    );
  });

  test("500 / null / pesan biasa → false", () => {
    expect(isRateLimitedError({ context: new Response(null, { status: 500 }) })).toBe(false);
    expect(isRateLimitedError({ message: "gemini 500" })).toBe(false);
    expect(isRateLimitedError(null)).toBe(false);
  });
});

describe("fetchGeneratedQuiz — klasifikasi failure #29", () => {
  test("invoke 429 sekali saja (tanpa retry) + failure rate-limited", async () => {
    let calls = 0;
    const out = await fetchGeneratedQuiz("mod_01", {
      localFallback: quizTiga,
      invokeRemote: () => {
        calls += 1;
        return Promise.resolve({
          data: null,
          error: { message: "terlalu banyak permintaan, coba lagi sebentar" },
        });
      },
    });
    expect(calls).toBe(1);
    expect(out.failure).toBe("rate-limited");
    expect(out.quiz).not.toBeNull();
    expect(out.source).toBe("offline");
  });

  test("invoke 500 di-retry 1x lalu failure server-down", async () => {
    let calls = 0;
    const out = await fetchGeneratedQuiz("mod_01", {
      localFallback: quizTiga,
      invokeRemote: () => {
        calls += 1;
        return Promise.resolve({ data: null, error: { message: "gemini 500" } });
      },
    });
    expect(calls).toBe(2);
    expect(out.failure).toBe("server-down");
  });

  test("navigator offline → failure offline tanpa invoke", async () => {
    const nav = (globalThis as { navigator?: unknown }).navigator;
    Object.assign(globalThis, { navigator: { onLine: false } });
    try {
      let calls = 0;
      const out = await fetchGeneratedQuiz("mod_01", {
        localFallback: quizTiga,
        invokeRemote: () => {
          calls += 1;
          return Promise.resolve({ data: null, error: null });
        },
      });
      expect(calls).toBe(0);
      expect(out.failure).toBe("offline");
    } finally {
      Object.assign(globalThis, { navigator: nav });
    }
  });
});
