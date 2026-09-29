import { z } from "zod";

import { resetProfile } from "../../lib/profile-store";
import { clearKbCache } from "../kb/kb-source";
import { clearSelesai } from "../module/module-store";
import { clearQuizProgress } from "../quiz/quiz-data";
import { clearQuizCache } from "../quiz/quiz-generate";
import { clearAllQuizResumes } from "../quiz/quiz-resume";
import { clearPendingSessions } from "../quiz/quiz-pending-sync";

export const WRESASTRA_FONT_SIZES = [20, 24, 32] as const;
export type WresastraFontSize = (typeof WRESASTRA_FONT_SIZES)[number];

export const appSettingsSchema = z.object({
  wresastraFontSize: z.enum(WRESASTRA_FONT_SIZES).default(WRESASTRA_FONT_SIZES[1]),
  soundEnabled: z.boolean().default(true),
});
export type AppSettings = z.infer<typeof appSettingsSchema>;

const STORAGE_KEY = "caksara.settings.v1";

const DEFAULT_SETTINGS: AppSettings = {
  wresastraFontSize: WRESASTRA_FONT_SIZES[1],
  soundEnabled: true,
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

let cache: AppSettings | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function readStored(): AppSettings {
  const raw = safeStorage()?.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return appSettingsSchema.parse(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persist(settings: AppSettings): void {
  cache = settings;
  safeStorage()?.setItem(STORAGE_KEY, JSON.stringify(settings));
  emit();
}

export function loadSettings(): AppSettings {
  if (cache) return cache;
  cache = readStored();
  return cache;
}

/** Baca ulang dari storage (abaikan cache modul) — untuk sinkron lintas tab/uji. */
export function refreshSettings(): AppSettings {
  cache = readStored();
  emit();
  return cache;
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Terapkan ukuran ke variabel CSS global agar permukaan baca ikut membesar. */
export function applyWresastraFontSize(size: WresastraFontSize): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--wresastra-size", `${size}px`);
}

/** Terapkan pengaturan tersimpan saat boot (sebelum permukaan baca render). */
export function initSettings(): AppSettings {
  const settings = loadSettings();
  applyWresastraFontSize(settings.wresastraFontSize);
  return settings;
}

export function setWresastraFontSize(size: WresastraFontSize): void {
  const next: AppSettings = { ...loadSettings(), wresastraFontSize: size };
  persist(next);
  applyWresastraFontSize(size);
}

export function setSoundEnabled(enabled: boolean): void {
  const next: AppSettings = { ...loadSettings(), soundEnabled: enabled };
  persist(next);
}

/**
 * Reset total progres belajar (#27): profil + modul selesai + tawaran lanjut
 * kuis + level adaptif + cache kuis/KB. Preferensi (tema/font/suara) dipertahankan.
 */
export function resetAllProgress(): void {
  resetProfile();
  clearSelesai();
  clearAllQuizResumes();
  clearPendingSessions();
  clearQuizProgress();
  clearQuizCache();
  clearKbCache();
}
