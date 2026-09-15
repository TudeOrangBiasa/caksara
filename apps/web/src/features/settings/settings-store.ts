import { z } from "zod";

export const WRESASTRA_FONT_SIZES = [20, 24, 32] as const;
export type WresastraFontSize = (typeof WRESASTRA_FONT_SIZES)[number];

export const appSettingsSchema = z.object({
  wresastraFontSize: z.union([z.literal(20), z.literal(24), z.literal(32)]).default(24),
  soundEnabled: z.boolean().default(true),
});
export type AppSettings = z.infer<typeof appSettingsSchema>;

const STORAGE_KEY = "caksara.settings.v1";

const DEFAULT_SETTINGS: AppSettings = {
  wresastraFontSize: 24,
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

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setWresastraFontSize(size: WresastraFontSize): void {
  const next: AppSettings = { ...loadSettings(), wresastraFontSize: size };
  persist(next);
}

export function setSoundEnabled(enabled: boolean): void {
  const next: AppSettings = { ...loadSettings(), soundEnabled: enabled };
  persist(next);
}
