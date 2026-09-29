import { getSupabase } from "../../lib/supabase";
import { KB_ENTRIES } from "./kb-data";
import type { KbEntry } from "./kb-data";
import { parseSupabaseKbRows } from "./kb-remote";
import type { SupabaseKbRow } from "./kb-remote";

export type KbEntriesSource = "remote" | "cache" | "local";

export interface KbFetchDeps {
  online: boolean;
  hasBackend: boolean;
  readCache: () => SupabaseKbRow[] | null;
  writeCache: (rows: SupabaseKbRow[]) => void;
  queryRemote: () => Promise<SupabaseKbRow[]>;
}

export interface KbFetchResult {
  entries: KbEntry[];
  source: KbEntriesSource;
  offline: boolean;
  /** Remote dicoba tapi tak usable (down/kosong/invalid) → daftar lokal fallback tampil. */
  loadError: boolean;
}

const CACHE_KEY = "caksara.kb-cache.v1";
const CACHE_TTL_MS = 10 * 60_000;

interface CachePayload {
  at: number;
  rows: SupabaseKbRow[];
}

export function readKbCache(): SupabaseKbRow[] | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload;
    if (!parsed || !Array.isArray(parsed.rows)) return null;
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.rows;
  } catch {
    return null;
  }
}

export function writeKbCache(rows: SupabaseKbRow[]): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rows }));
  } catch {
    // Storage diblokir: KB tetap jalan dari lokal.
  }
}
/** Hapus cache KB remote (dipakai reset progres total #27). */
export function clearKbCache(): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    // Storage diblokir: tidak ada yang perlu dihapus.
  }
}

/**
 * Ambil daftar KB #25: cache-first 10 menit (kb_entries read-only publik),
 * remote dicoba saat cache dingin, fallback lokal KB_ENTRIES bila remote
 * kosong/invalid/down. Offline (ADR-0008: KB cache lokal untuk mode offline)
 * memakai cache segar dulu sebelum lokal. Tidak pernah melempar — selalu
 * kembalikan entri.
 */
export async function fetchKbEntries(
  opts: { local?: KbEntry[] } & Partial<KbFetchDeps>,
): Promise<KbFetchResult> {
  const local = opts.local ?? KB_ENTRIES;
  const online = opts.online ?? (typeof navigator === "undefined" ? true : navigator.onLine);
  const readCache = opts.readCache ?? readKbCache;
  const writeCache = opts.writeCache ?? writeKbCache;

  if (!online) {
    const cached = readCache();
    if (cached) {
      const parsed = parseSupabaseKbRows(cached);
      if (parsed.length > 0)
        return { entries: parsed, source: "cache", offline: true, loadError: false };
    }
    return { entries: local, source: "local", offline: true, loadError: false };
  }

  const hasBackend = opts.hasBackend ?? getSupabase() !== null;
  const queryRemote = opts.queryRemote ?? queryKbEntriesRemote;

  if (!hasBackend) {
    const cached = readCache();
    if (cached) {
      const parsed = parseSupabaseKbRows(cached);
      if (parsed.length > 0)
        return { entries: parsed, source: "cache", offline: false, loadError: false };
    }
    return { entries: local, source: "local", offline: false, loadError: false };
  }

  try {
    const cached = readCache();
    if (cached) {
      const parsed = parseSupabaseKbRows(cached);
      if (parsed.length > 0)
        return { entries: parsed, source: "cache", offline: false, loadError: false };
    }
    const rows = await queryRemote();
    const parsed = parseSupabaseKbRows(rows);
    if (parsed.length > 0) {
      writeCache(rows);
      return { entries: parsed, source: "remote", offline: false, loadError: false };
    }
  } catch {
    return { entries: local, source: "local", offline: false, loadError: true };
  }
  return { entries: local, source: "local", offline: false, loadError: true };
}

async function queryKbEntriesRemote(): Promise<SupabaseKbRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("kb_entries")
    .select("id,category,title,body,source,level")
    .order("id", { ascending: true })
    .limit(200);
  if (error || !Array.isArray(data)) return [];
  return data as SupabaseKbRow[];
}
