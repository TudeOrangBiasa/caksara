import { z } from "zod";

const STORAGE_KEY = "caksara.module-selesai.v1";
const selesaiIdsSchema = z.array(z.string().min(1));

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readSelesai(): Set<string> {
  const storage = safeStorage();
  if (!storage) return new Set();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = selesaiIdsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? new Set<string>(parsed.data) : new Set();
  } catch {
    return new Set();
  }
}

export function hasSelesai(id: string): boolean {
  return readSelesai().has(id);
}

export function markSelesai(id: string): void {
  const next = readSelesai();
  next.add(id);
  safeStorage()?.setItem(STORAGE_KEY, JSON.stringify([...next]));
}

export function clearSelesai(): void {
  safeStorage()?.removeItem(STORAGE_KEY);
}
