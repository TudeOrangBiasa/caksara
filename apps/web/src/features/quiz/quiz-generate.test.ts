import { beforeEach, describe, expect, test } from "bun:test";
import { fetchGeneratedQuiz, isRateLimitedError, readCachedQuiz } from "./quiz-generate";
import type { GenerateQuizRequestBody } from "./quiz-generate";
import { getAdaptiveLevel, recordSessionLevel } from "./quiz-data";
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

describe("fetchGeneratedQuiz — body adaptif #96", () => {
  test("sesi buruk → body berisi wrongTopics non-kosong + level adaptif", async () => {
    const mod = "mod_test_body96";
    recordSessionLevel(mod, 5, 5);
    recordSessionLevel(mod, 1, 5, ["wre_01", "wre_02"]);
    let seen: GenerateQuizRequestBody | null = null;
    const out = await fetchGeneratedQuiz(mod, {
      localFallback: quizTiga,
      wrongTopics: ["wre_01", "wre_02"],
      onRequestBody: (body) => {
        seen = body;
      },
      invokeRemote: () =>
        Promise.resolve({
          data: { moduleId: mod, questions: quizTiga().questions },
          error: null,
        }),
    });
    expect(out.quiz).not.toBeNull();
    expect(seen).not.toBeNull();
    const body = seen as unknown as GenerateQuizRequestBody;
    expect(body.wrongTopics.length).toBeGreaterThan(0);
    expect(body.level).toBe(getAdaptiveLevel(mod));
  });
});

describe("readCachedQuiz — kontrak cacheSchema #58", () => {
  const CACHE_KEY = "caksara.quiz-cache.v1";
  const CACHE_TTL_MS = 5 * 60_000;

  function makeStorage() {
    const map = new Map<string, string>();
    return {
      getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
  }

  const fakeStorage = makeStorage();

  beforeEach(() => {
    Object.assign(globalThis, {
      window: { localStorage: fakeStorage },
      navigator: { onLine: true },
    });
    fakeStorage.removeItem(CACHE_KEY);
  });

  function seedStore(raw: string): void {
    fakeStorage.setItem(CACHE_KEY, raw);
  }

  function seedRow(moduleId: string, level: number, row: unknown): void {
    seedStore(JSON.stringify({ [`${moduleId}:L${level}`]: row }));
  }

  function validRow() {
    return { quiz: quizTiga(), source: "gemini", at: Date.now() };
  }

  test("baris valid round-trip → cache hit", () => {
    seedRow("mod_01", 1, validRow());
    const hit = readCachedQuiz("mod_01", 1);
    expect(hit?.quiz?.moduleId).toBe("mod_01");
    expect(hit?.quiz?.questions.length).toBe(3);
    expect(hit?.source).toBe("cache");
    expect(hit?.offline).toBe(false);
  });

  test("store bukan JSON → null tanpa throw", () => {
    seedStore("{bukan-json");
    expect(readCachedQuiz("mod_01", 1)).toBeNull();
  });

  test("store JSON bentuk asing → null tanpa throw", () => {
    seedStore(JSON.stringify({ "mod_01:L1": { aneh: true } }));
    expect(readCachedQuiz("mod_01", 1)).toBeNull();
  });

  test("baris kuis invalid → null tanpa throw", () => {
    seedRow("mod_01", 1, {
      quiz: { moduleId: "mod_01", questions: [] },
      source: "gemini",
      at: Date.now(),
    });
    expect(readCachedQuiz("mod_01", 1)).toBeNull();
  });

  test("baris kedaluwarsa TTL → null", () => {
    seedRow("mod_01", 1, {
      quiz: quizTiga(),
      source: "gemini",
      at: Date.now() - CACHE_TTL_MS - 1000,
    });
    expect(readCachedQuiz("mod_01", 1)).toBeNull();
  });
});
