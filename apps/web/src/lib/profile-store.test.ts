import { beforeEach, describe, expect, test } from "bun:test";

const STORAGE_KEY = "caksara.profile.v1";

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

// Jendela palsu dipasang SEBELUM modul store diimpor (impor dinamis di bawah),
// supaya jalur localStorage + debounce bisa diuji lewat API publik saja.
(globalThis as { window?: unknown }).window = {
  localStorage: fakeStorage,
  addEventListener: () => {},
  setTimeout: (...args: [(...a: never[]) => void, number]) => setTimeout(args[0], args[1]),
  clearTimeout: (id: number) => clearTimeout(id),
};

const store = await import("./profile-store");
const { userProfileSchema } = await import("./zod/profile");

function seed(raw: unknown) {
  store.resetProfile();
  fakeStorage.store.clear();
  fakeStorage.store.set(STORAGE_KEY, JSON.stringify(raw));
}

function baseProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: "anon_test",
    isAnon: true,
    name: "Putu",
    xp: 0,
    streak: 0,
    hearts: 5,
    ...overrides,
  };
}

beforeEach(() => {
  store.resetProfile();
  fakeStorage.store.clear();
});

describe("witaTodayStr (batas 00:00 WITA)", () => {
  test("23:59 WITA masih tanggal yang sama", () => {
    // 15:59:59 UTC = 23:59:59 WITA
    expect(store.witaTodayStr(Date.parse("2026-06-30T15:59:59Z"))).toBe("2026-06-30");
  });

  test("00:00 WITA ganti tanggal", () => {
    // 16:00:00 UTC = 00:00:00 WITA keesokan hari
    expect(store.witaTodayStr(Date.parse("2026-06-30T16:00:00Z"))).toBe("2026-07-01");
  });
});

describe("createAnonProfile", () => {
  test("nilai awal Hati 5, XP 0, Streak 0, mastery belum", () => {
    const p = store.createAnonProfile("Made");
    expect(p.hearts).toBe(5);
    expect(p.xp).toBe(0);
    expect(p.streak).toBe(0);
    expect(p.id.startsWith("anon_")).toBe(true);
    expect(p.lastActiveDate).toBe(store.witaTodayStr());
    expect(Object.values(p.mastery ?? {}).every((v) => v === "belum")).toBe(true);
  });
});

describe("setHearts / addXp (batas)", () => {
  test("hati dijepit ke 0..5", () => {
    store.createAnonProfile("A");
    store.setHearts(99);
    expect(store.loadProfile()?.hearts).toBe(5);
    store.setHearts(-3);
    expect(store.loadProfile()?.hearts).toBe(0);
  });

  test("xp tidak pernah negatif", () => {
    store.createAnonProfile("A");
    store.addXp(-50);
    expect(store.loadProfile()?.xp).toBe(0);
    store.addXp(10);
    store.addXp(-4);
    expect(store.loadProfile()?.xp).toBe(6);
  });
});

describe("recordAnswerStats (#24 derived Mastery)", () => {
  test("jawaban ber-aksara menaikkan hitungan + mastery, id asing diabaikan", () => {
    store.createAnonProfile("S");
    store.recordAnswerStats([
      { aksaraId: "wre_01", correct: true },
      { aksaraId: "wre_01", correct: true },
      { aksaraId: "wre_01", correct: false },
      { aksaraId: "asing", correct: true },
      { correct: true },
    ]);
    const profile = store.loadProfile();
    expect(profile?.aksaraStats?.["wre_01"]).toEqual({ correct: 2, total: 3 });
    expect(profile?.mastery?.["wre_01"]).toBe("dipahami");
    expect(profile?.aksaraStats?.["asing"]).toBeUndefined();
  });
});

describe("refillHearts (V9)", () => {
  test("isi penuh bila refill terakhir sebelum hari ini", () => {
    const today = store.witaTodayStr();
    const yesterdayMs = Date.parse(`${today}T00:00:00Z`) - 24 * 3600 * 1000 + 8 * 3600 * 1000;
    const yesterday = store.witaTodayStr(yesterdayMs);
    seed(baseProfile({ hearts: 2, heartsRefilledAt: yesterday }));
    expect(store.loadProfile()?.hearts).toBe(2);
    expect(store.refillHearts()).toBe(true);
    expect(store.loadProfile()?.hearts).toBe(5);
    expect(store.loadProfile()?.heartsRefilledAt).toBe(today);
  });

  test("tidak refill bila sudah penuh hari ini", () => {
    const today = store.witaTodayStr();
    seed(baseProfile({ hearts: 5, heartsRefilledAt: today }));
    expect(store.refillHearts()).toBe(false);
  });
});

describe("applyOvernightReset + updateStreak (V9)", () => {
  test("streak nol bila terakhir aktif lebih tua dari kemarin", () => {
    const oldMs = Date.now() - 4 * 24 * 3600 * 1000;
    seed(baseProfile({ streak: 4, lastActiveDate: store.witaTodayStr(oldMs) }));
    expect(store.applyOvernightReset()).toBe(true);
    expect(store.loadProfile()?.streak).toBe(0);
  });

  test("streak bertahan bila aktif kemarin", () => {
    const yMs = Date.now() - 24 * 3600 * 1000;
    seed(baseProfile({ streak: 3, lastActiveDate: store.witaTodayStr(yMs) }));
    expect(store.applyOvernightReset()).toBe(false);
    expect(store.loadProfile()?.streak).toBe(3);
  });

  test("updateStreak naik bila kemarin aktif, 1 bila terputus", () => {
    const yMs = Date.now() - 24 * 3600 * 1000;
    seed(baseProfile({ streak: 2, lastActiveDate: store.witaTodayStr(yMs) }));
    store.updateStreak();
    expect(store.loadProfile()?.streak).toBe(3);

    const oldMs = Date.now() - 5 * 24 * 3600 * 1000;
    seed(baseProfile({ streak: 9, lastActiveDate: store.witaTodayStr(oldMs) }));
    store.updateStreak();
    expect(store.loadProfile()?.streak).toBe(1);
  });
});
describe("claimStreakBonus (#159)", () => {
  test("streak tumbuh memberi 20 XP sekali per hari", () => {
    const yMs = Date.now() - 24 * 3600 * 1000;
    seed(baseProfile({ xp: 40, streak: 2, lastActiveDate: store.witaTodayStr(yMs) }));
    expect(store.updateStreak()).toBe(true);
    expect(store.loadProfile()?.xp).toBe(60);
    expect(store.claimStreakBonus()).toBe(false);
    expect(store.loadProfile()?.xp).toBe(60);
  });

  test("streak aktif hari ini tetap dapat bonus sekali", () => {
    seed(baseProfile({ xp: 40, streak: 3, lastActiveDate: store.witaTodayStr() }));
    expect(store.updateStreak()).toBe(false);
    expect(store.claimStreakBonus()).toBe(true);
    expect(store.loadProfile()?.xp).toBe(60);
    expect(store.claimStreakBonus()).toBe(false);
  });
});

describe("debounce tulis (V9, anti-banjir)", () => {
  test("tulis XP/Hati beruntun didebounce, flush menulis sekaligus", () => {
    store.createAnonProfile("Debounce");
    store.flushProfileWrites();
    fakeStorage.store.clear();
    for (let i = 0; i < 5; i += 1) store.addXp(10);
    expect(fakeStorage.store.has(STORAGE_KEY)).toBe(false);
    store.flushProfileWrites();
    expect(fakeStorage.store.has(STORAGE_KEY)).toBe(true);
    expect(store.loadProfile()?.xp).toBe(50);
  });

  test("refill cap tanggal walau Hati sudah penuh", () => {
    const today = store.witaTodayStr();
    const yesterdayMs = Date.parse(`${today}T00:00:00Z`) - 24 * 3600 * 1000 + 8 * 3600 * 1000;
    const yesterday = store.witaTodayStr(yesterdayMs);
    seed(baseProfile({ hearts: 5, heartsRefilledAt: yesterday }));
    expect(store.refillHearts()).toBe(false);
    expect(store.loadProfile()?.heartsRefilledAt).toBe(today);
  });
});

describe("setProfileName", () => {
  test("kosong dan >20 karakter ditolak", () => {
    store.createAnonProfile("Awal");
    expect(store.setProfileName("   ")).not.toBeNull();
    expect(store.setProfileName("x".repeat(21))).not.toBeNull();
    expect(store.loadProfile()?.name).toBe("Awal");
  });

  test("nama valid tersimpan", () => {
    store.createAnonProfile("Awal");
    expect(store.setProfileName("Wayan")).toBeNull();
    expect(store.loadProfile()?.name).toBe("Wayan");
  });
});

describe("readStored + skema", () => {
  test("JSON korup menghasilkan profil null", () => {
    store.resetProfile();
    fakeStorage.store.set(STORAGE_KEY, "{bukan-json");
    expect(store.loadProfile()).toBeNull();
  });

  test("skema menolak hati 6 dan xp negatif", () => {
    expect(userProfileSchema.safeParse(baseProfile({ hearts: 6 })).success).toBe(false);
    expect(userProfileSchema.safeParse(baseProfile({ xp: -1 })).success).toBe(false);
    expect(userProfileSchema.safeParse(baseProfile()).success).toBe(true);
  });
});
