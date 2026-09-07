import { ensureAnonSession, getSupabase } from "./supabase";
import type { UserProfile } from "./zod/profile";

/** V9+: jeda sinkron profil agar tulis beruntun saat kuis tidak membanjiri API. */
const SYNC_DEBOUNCE_MS = 1000;

let timer: number | null = null;
let cachedUid: string | null = null;

async function pushNow(profile: UserProfile): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  if (!cachedUid) cachedUid = await ensureAnonSession();
  if (!cachedUid) return;
  const { error } = await supabase.from("profiles").upsert(
    {
      id: cachedUid,
      is_anon: true,
      name: profile.name,
      xp: profile.xp,
      streak: profile.streak,
      last_active_date: profile.lastActiveDate ?? null,
      hearts: profile.hearts,
    },
    { onConflict: "id" },
  );
  if (error && import.meta.env.DEV) {
    console.warn("[sync] profil gagal:", error.message);
  }
}

/**
 * Jadwalkan sinkron profil lokal ke Supabase (offline-first: gagal diam-diam).
 * No-op di SSR dan bila env backend belum diset.
 */
export function scheduleProfileSync(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  if (!getSupabase()) return;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    void pushNow(profile);
  }, SYNC_DEBOUNCE_MS);
}
