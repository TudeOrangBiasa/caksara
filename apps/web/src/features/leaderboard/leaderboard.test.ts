import { describe, expect, test } from "bun:test";

import { isResetMingguIni, topEntries, weekStartSenin } from "./leaderboard-data";
import type { LeaderboardEntry } from "./leaderboard-data";
import { parseWitaDate } from "../../lib/zod/game-state";

function entry(profile_id: string, xp: number): LeaderboardEntry {
  return { profile_id, display_name: profile_id, suffix: 100, xp };
}

function fixture(count: number): LeaderboardEntry[] {
  return Array.from({ length: count }, (_, i) => entry(`p${i}`, i * 10));
}

describe("topEntries (#89: ≤20 baris, XP desc)", () => {
  test("25 entri dipotong jadi 20, tertinggi dulu", () => {
    const top = topEntries(fixture(25), 20);
    expect(top).toHaveLength(20);
    expect(top[0]?.xp).toBe(240);
    expect(top[19]?.xp).toBe(50);
  });

  test("di bawah 20 tampil semua, tetap terurut", () => {
    const top = topEntries([entry("a", 5), entry("b", 99), entry("c", 30)], 20);
    expect(top.map((e) => e.profile_id)).toEqual(["b", "c", "a"]);
  });

  test("input acak keluar terurut desc", () => {
    const rows = fixture(20).reverse();
    const top = topEntries(rows, 20);
    for (let i = 1; i < top.length; i += 1) {
      expect(top[i - 1]?.xp).toBeGreaterThanOrEqual(top[i]?.xp ?? 0);
    }
  });

  test("tidak mengubah array asal", () => {
    const rows = [entry("a", 1), entry("b", 2)];
    topEntries(rows, 20);
    expect(rows[0]?.profile_id).toBe("a");
  });
});

describe("pekan liga reset tiap Senin WITA", () => {
  test("Senin membuka pekan baru", () => {
    expect(weekStartSenin(parseWitaDate("2026-09-07"))).toBe("2026-09-07");
    expect(isResetMingguIni(parseWitaDate("2026-09-07"))).toBe(true);
  });

  test("Selasa sampai Minggu ikut pekan Senin yang sama", () => {
    expect(weekStartSenin(parseWitaDate("2026-09-08"))).toBe("2026-09-07");
    expect(weekStartSenin(parseWitaDate("2026-09-13"))).toBe("2026-09-07");
    expect(isResetMingguIni(parseWitaDate("2026-09-08"))).toBe(false);
    expect(isResetMingguIni(parseWitaDate("2026-09-12"))).toBe(false);
    expect(isResetMingguIni(parseWitaDate("2026-09-13"))).toBe(false);
  });

  test("Senin berikutnya membuka pekan baru lagi", () => {
    expect(weekStartSenin(parseWitaDate("2026-09-14"))).toBe("2026-09-14");
    expect(isResetMingguIni(parseWitaDate("2026-09-14"))).toBe(true);
  });
});
