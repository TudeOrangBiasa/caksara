import { bind, play, setVolume } from "cuelume";

import { loadSettings } from "../features/settings/settings-store";

let bound = false;

/**
 * Soundboard interaksi (cuelume, Web Audio tersintesis, tanpa file audio).
 * Bunyi hanya keluar bila toggle Suara aktif di Pengaturan.
 */
export function initSoundboard(): void {
  if (typeof window === "undefined" || bound) return;
  bound = true;
  setVolume(0.7);
  bind();
}

export type SoundCue = "success" | "error" | "press" | "toggle";

/** Mainkan cue bila suara aktif. Aman dipanggil dari event handler. */
export function playCue(cue: SoundCue): void {
  if (typeof window === "undefined") return;
  try {
    if (!loadSettings().soundEnabled) return;
    play(cue);
  } catch {
    // Audio tidak tersedia/diblokir: diam, jangan ganggu belajar.
  }
}
