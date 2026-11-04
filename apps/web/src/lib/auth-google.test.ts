import { describe, expect, test } from "bun:test";

import { formatLeaderboardName, planMigration, suffixForProfileId } from "./auth-google";

describe("suffixForProfileId (#89)", () => {
  test("stabil untuk profile_id yang sama", () => {
    expect(suffixForProfileId("uid-google-123")).toBe(suffixForProfileId("uid-google-123"));
  });

  test("selalu dalam rentang 100-999", () => {
    for (const id of ["a", "anon_x", "uid-google-123", "profil-yang-sangat-panjang-0123456789"]) {
      const suffix = suffixForProfileId(id);
      expect(suffix).toBeGreaterThanOrEqual(100);
      expect(suffix).toBeLessThanOrEqual(999);
    }
  });

  test("berbeda untuk id berbeda (bukan konstanta)", () => {
    const seen = new Set(
      ["uid-1", "uid-2", "uid-3", "uid-4", "uid-5"].map((id) => suffixForProfileId(id)),
    );
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("formatLeaderboardName (#89)", () => {
  test("`Made 421` — nama + spasi + suffix", () => {
    expect(formatLeaderboardName("Made", 421)).toBe("Made 421");
  });
});

function localProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: "anon_lokal",
    isAnon: true,
    name: "Putu",
    xp: 120,
    streak: 3,
    hearts: 5,
    mastery: { wre_01: "dipahami" as const },
    ...overrides,
  };
}

describe("planMigration (#89: lokal tidak hilang)", () => {
  const session = { uid: "uid-google-1", displayName: "Putu G" };

  test("XP lokal menang bila server lebih kecil", () => {
    const plan = planMigration(localProfile({ xp: 120 }), { xp: 40, streak: 1 }, session);
    expect(plan.xp).toBe(120);
    expect(plan.uid).toBe("uid-google-1");
  });

  test("XP server menang bila lokal lebih kecil", () => {
    const plan = planMigration(localProfile({ xp: 10 }), { xp: 300, streak: 5 }, session);
    expect(plan.xp).toBe(300);
    expect(plan.streak).toBe(5);
  });

  test("tanpa baris server, lokal dipakai utuh", () => {
    const plan = planMigration(localProfile({ xp: 55, streak: 2 }), null, session);
    expect(plan.xp).toBe(55);
    expect(plan.streak).toBe(2);
  });

  test("nama Google menang; fallback ke nama lokal", () => {
    expect(planMigration(localProfile(), null, session).name).toBe("Putu G");
    expect(
      planMigration(localProfile({ name: "Putu" }), null, { uid: "u", displayName: null }).name,
    ).toBe("Putu");
  });

  test("mastery lokal ikut dibawa", () => {
    const plan = planMigration(localProfile(), null, session);
    expect(plan.mastery).toEqual({ wre_01: "dipahami" });
  });
});
