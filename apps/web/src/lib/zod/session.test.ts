import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { sessionSchema } from "./session";

const validSession = () => ({
  profileId: "anon_1",
  moduleId: "mod_01",
  status: "in_progress" as const,
  score: 0,
  currentIndex: 0,
});

describe("sessionSchema", () => {
  test("Sesi Kuis baru lolos dengan status in_progress", () => {
    assert.equal(sessionSchema.safeParse(validSession()).success, true);
  });

  test("sesi tuntas lolos dengan status done", () => {
    const parsed = sessionSchema.safeParse({
      ...validSession(),
      status: "done",
      score: 20,
      currentIndex: 3,
    });
    assert.equal(parsed.success, true);
  });

  test("status asing ditolak", () => {
    const parsed = sessionSchema.safeParse({ ...validSession(), status: "paused" });
    assert.equal(parsed.success, false);
  });

  test("score negatif ditolak", () => {
    const parsed = sessionSchema.safeParse({ ...validSession(), score: -10 });
    assert.equal(parsed.success, false);
  });

  test("currentIndex negatif ditolak", () => {
    const parsed = sessionSchema.safeParse({ ...validSession(), currentIndex: -1 });
    assert.equal(parsed.success, false);
  });
});
