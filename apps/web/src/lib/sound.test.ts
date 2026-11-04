import { beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";

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
const playCalls: string[] = [];
const delayCalls: number[] = [];

// Window palsu dipasang SEBELUM impor modul (impor dinamis di bawah).
// cuelume asli tak bisa jalan headless: AudioContext butuh browser, jadi
// mock di seam play/setTimeout dan asertir nama cue yang diteruskan.
mock.module("cuelume", () => ({
  bind: () => {},
  setVolume: () => {},
  play: (cue: string) => void playCalls.push(cue),
}));

Object.assign(globalThis, {
  window: {
    localStorage: fakeStorage,
    // Jalankan timer sinkron agar sequence levelUp/streak teramati tanpa fake clock.
    setTimeout: (fn: () => void, ms: number) => {
      delayCalls.push(ms);
      fn();
      return 1;
    },
    clearTimeout: () => {},
  },
});

const sound = await import("./sound");
const settings = await import("../features/settings/settings-store");

beforeEach(() => {
  fakeStorage.store.clear();
  settings.refreshSettings();
  playCalls.length = 0;
  delayCalls.length = 0;
});

describe("playCue levelUp/streak #102", () => {
  test("levelUp → sparkle lalu chime (naik), streak → sparkle lalu sparkle", () => {
    sound.playCue("levelUp");
    expect(playCalls).toEqual(["sparkle", "chime"]);

    playCalls.length = 0;
    sound.playCue("streak");
    expect(playCalls).toEqual(["sparkle", "sparkle"]);
  });

  test("suara OFF → levelUp/streak sunyi total (no-op)", () => {
    settings.setSoundEnabled(false);
    sound.playCue("levelUp");
    sound.playCue("streak");
    expect(playCalls).toEqual([]);
  });

  test("suara ON: sequence menjadwalkan lapis kedua via setTimeout", () => {
    sound.playCue("levelUp");
    expect(delayCalls.length).toBe(1);
    expect(delayCalls[0]).toBeGreaterThan(0);
  });
});
