const STORAGE_KEY = "caksara.module-selesai.v1";

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
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set<string>(arr) : new Set();
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
