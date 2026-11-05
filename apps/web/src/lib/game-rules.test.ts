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
  XP_STREAK_BONUS,
} from "./game-rules";
import { parseWitaDate } from "./zod/game-state";
import type { GameState } from "./game-rules";

describe("witaDateString", () => {
  test("16:00 UTC is already the next day in WITA", () => {
    assert.equal(witaDateString(new Date("2026-09-04T15:59:00Z")), "2026-09-04");
    assert.equal(witaDateString(new Date("2026-09-04T16:00:00Z")), "2026-09-05");
  });
});

const fresh = (): GameState => ({
  xp: 0,
  hearts: 5,
  streak: 0,
  lastActiveDate: parseWitaDate("2026-09-04"),
  heartsRefilledAt: parseWitaDate("2026-09-04"),
});

describe("jawaban Sesi Kuis", () => {
  test("jawaban benar memberi +10 XP tanpa menyentuh Hati", () => {
    const next = applyCorrectAnswer({ ...fresh(), xp: 20, hearts: 3 });
    assert.equal(next.xp, 30);
    assert.equal(next.hearts, 3);
  });

  test("jawaban salah mengurangi 1 Hati tanpa game over", () => {
    const { state, gameOver } = applyWrongAnswer(fresh());
    assert.equal(state.hearts, 4);
    assert.equal(gameOver, false);
  });

  test("Hati terakhir memicu game over dan Hati tidak pernah negatif", () => {
    const last = applyWrongAnswer({ ...fresh(), hearts: 1 });
    assert.equal(last.state.hearts, 0);
    assert.equal(last.gameOver, true);
    const again = applyWrongAnswer(last.state);
    assert.equal(again.state.hearts, 0);
    assert.equal(again.gameOver, true);
  });
});

describe("refill Hati harian (00:00 WITA)", () => {
  test("refill ke 5 sekali per hari WITA", () => {
    const empty = { ...fresh(), hearts: 0 };
    const refilled = refillHeartsForNewDay(empty, new Date("2026-09-05T01:00:00Z"));
    assert.equal(refilled.hearts, 5);
    assert.deepEqual(refillHeartsForNewDay(refilled, new Date("2026-09-05T10:00:00Z")), refilled);
    assert.equal(refilled.heartsRefilledAt, "2026-09-05");
  });

  test("hari UTC yang sama bisa menjadi hari WITA yang baru", () => {
    const next = refillHeartsForNewDay({ ...fresh(), hearts: 2 }, new Date("2026-09-04T16:30:00Z"));
    assert.equal(next.hearts, 5);
  });
});

describe("Streak", () => {
  test("hari WITA berurutan menambah, hari yang sama idempoten", () => {
    const day2 = touchStreakOnActivity({ ...fresh(), streak: 3 }, parseWitaDate("2026-09-05"));
    assert.equal(day2.streak, 4);
    assert.equal(day2.lastActiveDate, "2026-09-05");
    assert.equal(touchStreakOnActivity(day2, parseWitaDate("2026-09-05")).streak, 4);
  });

  test("hari yang terlewat memulai lagi dari 1 saat berikutnya aktif", () => {
    const back = touchStreakOnActivity({ ...fresh(), streak: 6 }, parseWitaDate("2026-09-10"));
    assert.equal(back.streak, 1);
  });

  test("cron menolkan Streak yang terputus tapi menjaga yang hidup", () => {
    const lapsed = resetStreakForMissedDay({ ...fresh(), streak: 6 }, parseWitaDate("2026-09-10"));
    const live = resetStreakForMissedDay({ ...fresh(), streak: 6 }, parseWitaDate("2026-09-05"));
    const today = resetStreakForMissedDay({ ...fresh(), streak: 2 }, parseWitaDate("2026-09-04"));
    assert.equal(lapsed.streak, 0);
    assert.equal(live.streak, 6);
    assert.equal(today.streak, 2);
  });
});

describe("Bonus Streak +20 XP", () => {
  test("streak bertambah memberi bonus sekali per hari", () => {
    const grown = touchStreakOnActivity({ ...fresh(), xp: 40 }, parseWitaDate("2026-09-05"));
    const first = applyStreakBonus(grown, parseWitaDate("2026-09-05"));
    assert.equal(first.granted, true);
    assert.equal(first.state.xp, 40 + XP_STREAK_BONUS);
    assert.equal(XP_STREAK_BONUS, 20);
    const second = applyStreakBonus(first.state, parseWitaDate("2026-09-05"));
    assert.equal(second.granted, false);
    assert.equal(second.state.xp, 40 + XP_STREAK_BONUS);
  });

  test("streak putus tidak dapat bonus", () => {
    const lapsed = resetStreakForMissedDay(
      { ...fresh(), xp: 40, streak: 6 },
      parseWitaDate("2026-09-10"),
    );
    assert.equal(lapsed.streak, 0);
    const denied = applyStreakBonus(lapsed, parseWitaDate("2026-09-10"));
    assert.equal(denied.granted, false);
    assert.equal(denied.state.xp, 40);
  });

  test("tanpa aktivitas hari ini tidak dapat bonus", () => {
    const idle = { ...fresh(), xp: 40, streak: 3 };
    const denied = applyStreakBonus(idle, parseWitaDate("2026-09-05"));
    assert.equal(denied.granted, false);
    assert.equal(denied.state.xp, 40);
  });
});

describe("Mastery", () => {
  test("tanpa percobaan berarti belum", () => {
    assert.equal(deriveMastery({ correctCount: 0, totalCount: 0 }), "belum");
  });

  test("sedikit percobaan tetap belum walau sempurna", () => {
    assert.equal(deriveMastery({ correctCount: 2, totalCount: 2 }), "belum");
  });

  test("akurasi stabil meraih dipahami, akurasi terjaga meraih ahli", () => {
    assert.equal(deriveMastery({ correctCount: 2, totalCount: 4 }), "dipahami");
    assert.equal(deriveMastery({ correctCount: 8, totalCount: 10 }), "ahli");
  });

  test("volume tinggi dengan akurasi rendah tetap belum", () => {
    assert.equal(deriveMastery({ correctCount: 3, totalCount: 10 }), "belum");
  });
});
