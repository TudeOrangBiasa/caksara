import { bind, play, setVolume } from "cuelume";

import { loadSettings } from "../features/settings/settings-store";

let bound = false;

/**
 * Soundboard interaksi #109: Kenney Interface Sounds (CC0, /sfx/*.ogg)
 * diutamakan; cuelume (Web Audio tersintesis) fallback bila file gagal.
 * Bunyi hanya keluar bila toggle Suara aktif di Pengaturan.
 */
export function initSoundboard(): void {
  if (typeof window === "undefined" || bound) return;
  bound = true;
  setVolume(0.7);
  bind();
}

export type SoundCue =
  | "success"
  | "error"
  | "press"
  | "toggle"
  | "sparkle"
  | "chime"
  | "levelUp"
  | "streak";

/**
 * Nama cue cuelume asli (tanpa alias #102). Alias levelUp/streak diselesaikan
 * ke sequence di bawah, bukan direct play, agar tak ada file audio baru.
 */
type CuelumeCue = "success" | "error" | "press" | "toggle" | "sparkle" | "chime";

/**
 * Reduced-motion (#102): bunyi bukan motion — cue tetap boleh berbunyi saat
 * prefers-reduced-motion, tetapi pemanggil dilarang merangkai cue ini dengan
 * animasi panjang (confetti/ripple maraton). Fanfare/levelUp/streak hanya
 * menjadwalkan bunyi; animasi visual diurus komponen dengan guard-nya sendiri.
 */
/**
 * Peta cue → file Kenney. levelUp/streak diselesaikan ke sequence di bawah,
 * bukan direct play, agar karakternya tetap fanfare dua lapis.
 */
const SFX_FILE: Record<CuelumeCue, string> = {
  success: "/sfx/success.ogg",
  error: "/sfx/error.ogg",
  press: "/sfx/press.ogg",
  toggle: "/sfx/toggle.ogg",
  sparkle: "/sfx/sparkle.ogg",
  chime: "/sfx/chime.ogg",
};

const sfxCache = new Map<string, HTMLAudioElement>();

function playSfxFile(cue: CuelumeCue): boolean {
  try {
    let audio = sfxCache.get(cue);
    if (!audio) {
      audio = new Audio(SFX_FILE[cue]);
      audio.volume = 0.7;
      sfxCache.set(cue, audio);
    } else {
      audio.currentTime = 0;
    }
    void audio.play().catch(() => playCuelume(cue));
    return true;
  } catch {
    return false;
  }
}

function playCuelume(cue: CuelumeCue): void {
  try {
    if (!loadSettings().soundEnabled) return;
    play(cue);
  } catch {
    // Audio tidak tersedia/diblokir: diam, jangan ganggu belajar.
  }
}

function playRaw(cue: CuelumeCue): void {
  try {
    if (!loadSettings().soundEnabled) return;
    if (!playSfxFile(cue)) playCuelume(cue);
  } catch {
    // Audio tidak tersedia/diblokir: diam, jangan ganggu belajar.
  }
}

/** Mainkan cue bila suara aktif. Aman dipanggil dari event handler. */
export function playCue(cue: SoundCue): void {
  if (typeof window === "undefined") return;
  if (cue === "levelUp" || cue === "streak") {
    playLevelCue(cue);
    return;
  }
  playRaw(cue);
}

/**
 * Alias levelUp/streak ke sequence sparkle+chime cuelume. Tiap lapis cek
 * toggle lagi agar user yang mematikan suara mid-sequence langsung sunyi.
 */
function playLevelCue(cue: "levelUp" | "streak"): void {
  playRaw("sparkle");
  // levelUp naik (chime penutup), streak turun (sparkle ulang): beda arah nada.
  const closer: CuelumeCue = cue === "levelUp" ? "chime" : "sparkle";
  window.setTimeout(() => playRaw(closer), cue === "levelUp" ? 220 : 300);
}

/**
 * Pratinjau bunyi tombol Coba di Pengaturan: sengaja bypass toggle suara
 * agar user dengar contoh walau efek sedang off. Alias levelUp/streak ikut
 * di-resolve; file SFX diutamakan, cuelume fallback.
 */
export function playPreview(cue: SoundCue): void {
  if (typeof window === "undefined") return;
  try {
    const resolved: CuelumeCue = cue === "levelUp" ? "sparkle" : cue === "streak" ? "chime" : cue;
    if (playSfxFile(resolved)) return;
    play(resolved);
  } catch {
    // Audio tidak tersedia/diblokir: diam, jangan ganggu belajar.
  }
}

/** Fanfare lulus kuis: 3 lapis nada (tiap lapis cek toggle lagi). */
export function playFanfare(): void {
  if (typeof window === "undefined") return;
  playCue("success");
  window.setTimeout(() => playCue("sparkle"), 250);
  window.setTimeout(() => playCue("chime"), 550);
}
