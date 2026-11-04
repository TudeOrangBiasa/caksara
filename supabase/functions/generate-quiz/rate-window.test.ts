import { describe, test } from "node:test";
import assert from "node:assert/strict";

// #60: bucket jam window_hour untuk counter 50/jam — modul tanpa impor
// (pola quiz-grounding.ts) sehingga bun mengujinya langsung tanpa Deno.
import { canUseFastPath, rateLimited, windowHourStart } from "./rate-window";

describe("rate-window #60 — windowHourStart truncate ke awal jam UTC", () => {
  test("menit/detik/ms dipangkas, jam dipertahankan", () => {
    assert.equal(windowHourStart("2026-11-04T13:45:59.123Z"), "2026-11-04T13:00:00.000Z");
  });

  test("tepat awal jam tetap; Date dan epoch didukung", () => {
    assert.equal(windowHourStart(new Date("2026-11-04T00:00:00.000Z")), "2026-11-04T00:00:00.000Z");
    assert.equal(
      windowHourStart(Date.parse("2026-11-04T23:59:59.999Z")),
      "2026-11-04T23:00:00.000Z",
    );
  });
});

describe("rate-window #60 — rateLimited semantik tak berubah (10/mnt + 50/jam)", () => {
  test("kosong → lolos; 9 dalam semenit → lolos; 10 dalam semenit → tolak", () => {
    assert.equal(rateLimited([]), false);
    const now = Date.now();
    const nine = Array.from({ length: 9 }, (_, i) => new Date(now - i * 5_000).toISOString());
    assert.equal(rateLimited(nine), false);
    const ten = [...nine, new Date(now - 45_000).toISOString()];
    assert.equal(rateLimited(ten), true);
  });

  test("50 dalam sejam (di luar semenit) → tolak; 49 → lolos", () => {
    const now = Date.now();
    const at = (minAgo: number) => new Date(now - minAgo * 60_000).toISOString();
    const fortyNine = Array.from({ length: 49 }, (_, i) => at(2 + i));
    assert.equal(rateLimited(fortyNine), false);
    assert.equal(rateLimited([...fortyNine, at(30)]), true);
  });

  test("panggilan 61 menit lalu tak dihitung", () => {
    const now = Date.now();
    const old = Array.from({ length: 60 }, (_, i) => new Date(now - 3_660_000 - i).toISOString());
    assert.equal(rateLimited(old), false);
  });
});

describe("rate-window #60 — canUseFastPath: baris null (pra-migrasi) → fallback", () => {
  test("semua ber-window_hour → jalur cepat", () => {
    const hour = windowHourStart();
    assert.equal(
      canUseFastPath([
        { called_at: new Date().toISOString(), window_hour: hour },
        { called_at: new Date().toISOString(), window_hour: hour },
      ]),
      true,
    );
  });

  test("kosong atau ada null → fallback in-memory", () => {
    assert.equal(canUseFastPath([]), false);
    assert.equal(
      canUseFastPath([
        { called_at: new Date().toISOString(), window_hour: windowHourStart() },
        { called_at: new Date().toISOString(), window_hour: null },
      ]),
      false,
    );
    assert.equal(canUseFastPath([{ called_at: new Date().toISOString() }]), false);
  });
});
