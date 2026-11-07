import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  applyCorrectAnswer,
  applyStreakBonus,
  applyWrongAnswer,
  deriveMastery,
  refillHeartsForNewDay,
  resetStreakForMissedDay,
  touchStreakOnActivity,
  witaDateString,
  MAX_HEARTS,
  XP_PER_CORRECT,
  XP_STREAK_BONUS,
} from "./game-rules";
import { parseWitaDate } from "./zod/game-state";
import type { GameState } from "./game-rules";

// F2 — tabel kebenaran WITA boundary + state game.
// Batas hari: 00:00 WITA = 16:00 UTC sehari sebelumnya.

const fresh = (over: Partial<GameState> = {}): GameState => ({
  xp: 0,
  hearts: MAX_HEARTS,
  streak: 0,
  lastActiveDate: parseWitaDate("2026-09-04"),
  heartsRefilledAt: parseWitaDate("2026-09-04"),
  ...over,
});

describe("F2 WITA boundary — 16:00 UTC ganti hari", () => {
  test("15:59:59 UTC masih kemarin WITA", () => {
    assert.equal(witaDateString(new Date("2026-09-04T15:59:59Z")), "2026-09-04");
  });
  test("16:00:00 UTC sudah besok WITA", () => {
    assert.equal(witaDateString(new Date("2026-09-04T16:00:00Z")), "2026-09-05");
  });
  test("tengah malam UTC masih hari yang sama WITA", () => {
    assert.equal(witaDateString(new Date("2026-09-04T00:00:00Z")), "2026-09-04");
  });
  test("tengah malam WITA = 16:00 UTC kemarin", () => {
    assert.equal(witaDateString(new Date("2026-09-03T16:00:00Z")), "2026-09-04");
  });
});

describe("F2 jawaban — XP vs Hati vs gameOver", () => {
  test("benar: +10 XP, Hati utuh", () => {
    assert.equal(XP_PER_CORRECT, 10);
    const out = applyCorrectAnswer(fresh({ hearts: 3 }));
    assert.equal(out.xp, 10);
    assert.equal(out.hearts, 3);
  });
  test("salah: -1 Hati, tanpa gameOver", () => {
    const out = applyWrongAnswer(fresh({ hearts: 3 }));
    assert.equal(out.state.hearts, 2);
    assert.equal(out.gameOver, false);
  });
  test("salah di Hati 1: Hati 0 + gameOver, tak negatif", () => {
    const out = applyWrongAnswer(fresh({ hearts: 1 }));
    assert.equal(out.state.hearts, 0);
    assert.equal(out.gameOver, true);
    const again = applyWrongAnswer(out.state);
    assert.equal(again.state.hearts, 0);
  });
  test("refill idempoten dalam hari yang sama", () => {
    const a = refillHeartsForNewDay(fresh({ hearts: 0 }), new Date("2026-09-05T01:00:00Z"));
    assert.equal(a.hearts, MAX_HEARTS);
    const b = refillHeartsForNewDay(a, new Date("2026-09-05T10:00:00Z"));
    assert.equal(b, a);
  });
  test("reset vs touch tak digabung: cron nolkan yang putus, touch naikkan yang aktif", () => {
    const lapsed = resetStreakForMissedDay(fresh({ streak: 6 }), parseWitaDate("2026-09-10"));
    assert.equal(lapsed.streak, 0);
    const live = resetStreakForMissedDay(fresh({ streak: 6 }), parseWitaDate("2026-09-05"));
    assert.equal(live.streak, 6);
    const grown = touchStreakOnActivity(fresh({ streak: 6 }), parseWitaDate("2026-09-05"));
    assert.equal(grown.streak, 7);
  });
  test("bonus 20 XP sekali per hari tumbuh", () => {
    assert.equal(XP_STREAK_BONUS, 20);
    const grown = touchStreakOnActivity(fresh(), parseWitaDate("2026-09-05"));
    const first = applyStreakBonus(grown, parseWitaDate("2026-09-05"));
    assert.equal(first.granted, true);
    const second = applyStreakBonus(first.state, parseWitaDate("2026-09-05"));
    assert.equal(second.granted, false);
  });
  test("tanpa aktivitas hari ini: tanpa bonus", () => {
    const denied = applyStreakBonus(fresh({ streak: 3 }), parseWitaDate("2026-09-05"));
    assert.equal(denied.granted, false);
  });
});

describe("F2 mastery thresholds — volume x akurasi", () => {
  const cases: Array<[number, number, string]> = [
    [0, 0, "belum"],
    [2, 2, "belum"], // sempurna tapi volume <3
    [1, 3, "belum"], // volume cukup, akurasi <0.5
    [2, 4, "dipahami"], // ≥3 & ≥0.5
    [3, 6, "dipahami"], // ≥3 tapi <0.8 walau ≥5... volume 6, rate 0.5
    [4, 5, "ahli"], // ≥5 & ≥0.8
    [8, 10, "ahli"],
    [3, 10, "belum"], // volume tinggi, akurasi rendah
  ];
  for (const [correct, total, want] of cases) {
    test(`${correct}/${total} → ${want}`, () => {
      assert.equal(deriveMastery({ correctCount: correct, totalCount: total }), want);
    });
  }
});
