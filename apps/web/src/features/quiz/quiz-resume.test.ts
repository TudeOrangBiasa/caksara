import { beforeEach, describe, expect, test } from "bun:test";

function makeStorage() {
  const map = new Map<string, string>();
  return {
    store: map,
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const fakeStorage = makeStorage();

Object.assign(globalThis, { window: { localStorage: fakeStorage } });

// Impor dinamis disengaja: modul dibaca setelah window palsu terpasang.
const resume = await import("./quiz-resume");

function seedResume(moduleId = "mod_01") {
  resume.saveResume({
    moduleId,
    currentIndex: 3,
    answers: [],
    hearts: 4,
    updatedAt: Date.now(),
  });
}

beforeEach(() => {
  fakeStorage.store.clear();
});

describe("clearAllQuizResumes (reset progres total)", () => {
  test("menghapus semua simpanan lanjut kuis lintas modul", () => {
    seedResume("mod_01");
    seedResume("mod_02");
    expect(resume.loadResume("mod_01")).not.toBeNull();

    resume.clearAllQuizResumes();

    expect(resume.loadResume("mod_01")).toBeNull();
    expect(resume.loadResume("mod_02")).toBeNull();
  });

  test("tanpa simpanan: no-op, tidak throw", () => {
    expect(() => resume.clearAllQuizResumes()).not.toThrow();
  });
});
