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
const store = await import("./settings-store");

beforeEach(() => {
  fakeStorage.store.clear();
  store.refreshSettings();
});

describe("appSettingsSchema (batas Zod)", () => {
  test("default: font 24 + suara aktif", () => {
    expect(store.loadSettings()).toEqual({ wresastraFontSize: 24, soundEnabled: true });
  });

  test("font 20/24/32 bertahan roundtrip", () => {
    for (const size of [20, 24, 32] as const) {
      store.setWresastraFontSize(size);
      expect(store.loadSettings().wresastraFontSize).toBe(size);
    }
  });

  test("nilai tak valid jatuh ke default, bukan crash", () => {
    fakeStorage.store.set("caksara.settings.v1", JSON.stringify({ wresastraFontSize: 99 }));
    expect(store.refreshSettings().wresastraFontSize).toBe(24);
  });

  test("toggle suara bertahan roundtrip", () => {
    store.setSoundEnabled(false);
    expect(store.loadSettings().soundEnabled).toBe(false);
    store.setSoundEnabled(true);
    expect(store.loadSettings().soundEnabled).toBe(true);
  });

  test("subscriber diberi tahu tiap perubahan", () => {
    let calls = 0;
    const unsub = store.subscribeSettings(() => calls++);
    store.setSoundEnabled(false);
    store.setWresastraFontSize(32);
    unsub();
    store.setSoundEnabled(true);
    expect(calls).toBe(2);
  });
});

describe("applyWresastraFontSize (efek DOM)", () => {
  test("tanpa document: no-op, tidak throw", () => {
    expect(() => store.applyWresastraFontSize(32)).not.toThrow();
  });

  test("initSettings menerapkan ukuran tersimpan tanpa throw", () => {
    store.setWresastraFontSize(20);
    expect(() => store.initSettings()).not.toThrow();
    expect(store.loadSettings().wresastraFontSize).toBe(20);
  });
});
