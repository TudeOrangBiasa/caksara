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
const sfxCalls: string[] = [];

// Window palsu dipasang SEBELUM impor modul (impor dinamis di bawah).
// cuelume asli tak bisa jalan headless: AudioContext butuh browser, jadi
// mock di seam play/setTimeout dan asertir nama cue yang diteruskan.
// #109: Audio dimock agar lapis SFX Kenney teramati tanpa file biner.
mock.module("cuelume", () => ({
  bind: () => {},
  setVolume: () => {},
  play: (cue: string) => void playCalls.push(cue),
}));

class FakeAudio {
  currentTime = 0;
  volume = 1;
  constructor(public src: string) {}
  play(): Promise<void> {
    sfxCalls.push(this.src);
    return Promise.resolve();
  }
}

Object.assign(globalThis, {
  Audio: FakeAudio,
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
  sfxCalls.length = 0;
});

describe("playCue levelUp/streak #102 + SFX Kenney #109", () => {
  test("levelUp → file sparkle lalu chime; streak → sparkle lalu sparkle", () => {
    sound.playCue("levelUp");
    expect(sfxCalls).toEqual(["/sfx/sparkle.ogg", "/sfx/chime.ogg"]);
    expect(playCalls).toEqual([]);

    sfxCalls.length = 0;
    sound.playCue("streak");
    expect(sfxCalls).toEqual(["/sfx/sparkle.ogg", "/sfx/sparkle.ogg"]);
  });

  test("suara OFF → levelUp/streak sunyi total (no-op)", () => {
    settings.setSoundEnabled(false);
    sound.playCue("levelUp");
    sound.playCue("streak");
    expect(sfxCalls).toEqual([]);
    expect(playCalls).toEqual([]);
  });

  test("suara ON: sequence menjadwalkan lapis kedua via setTimeout", () => {
    sound.playCue("levelUp");
    expect(delayCalls.length).toBe(1);
    expect(delayCalls[0]).toBeGreaterThan(0);
  });
});
