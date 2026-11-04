// Final-round native shell (#99, ADR-0014): Capacitor Android + Electron, tanpa iOS/Tauri.
import { getSupabase } from "./supabase";
import { loadProfile } from "./profile-store";
import type { UserProfile } from "./zod/profile";

export const GOOGLE_REDIRECT_PATH = "/";
export const LEADERBOARD_LIMIT = 20;
export const SUFFIX_MIN = 100;
export const SUFFIX_MAX = 999;

/**
 * URL kembali OAuth Google. Daftarkan di Dashboard Supabase > Authentication >
 * URL Configuration > Redirect URLs:
 * - http://localhost:5173/ (dev lokal)
 * - https://<proyek>.vercel.app/ (preview + production)
 * Tanpa entri ini Supabase menolak callback; Tude mengaktifkan provider
 * Google + mendaftarkan URL di dashboard (bukan di repo).
 */
export function googleRedirectTo(origin: string): string {
  return `${origin}${GOOGLE_REDIRECT_PATH}`;
}

/** Suffix stabil 100-999 dari hash profile_id (bukan XP, bukan acak). */
export function suffixForProfileId(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i += 1) {
    hash = (Math.imul(hash, 31) + profileId.charCodeAt(i)) | 0;
  }
  const span = SUFFIX_MAX - SUFFIX_MIN + 1;
  return SUFFIX_MIN + (Math.abs(hash) % span);
}

/** Format tampil leaderboard: "Made 421". */
export function formatLeaderboardName(displayName: string, suffix: number): string {
  return `${displayName} ${suffix}`;
}

export interface GoogleSession {
  uid: string;
  displayName: string | null;
}

/**
 * Mulai login Google via Supabase OAuth. Mengembalikan URL tujuan bila
 * backend + provider siap; null bila tombol wajib disembunyikan (env kosong,
 * offline, atau provider mati) — app tetap jalan sebagai tamu.
 */
export async function startGoogleLogin(origin: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: googleRedirectTo(origin) },
  });
  if (error || !data.url) {
    if (import.meta.env.DEV) console.warn("[auth] Google login gagal:", error?.message);
    return null;
  }
  return data.url;
}

/** Baca sesi yang kembali dari callback OAuth (null bila tamu). */
export async function readGoogleSession(): Promise<GoogleSession | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  const user = data.session.user;
  if (user.is_anonymous) return null;
  const meta = user.user_metadata as { full_name?: unknown; name?: unknown } | null;
  const displayName =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.name === "string"
        ? meta.name
        : null;
  return { uid: user.id, displayName };
}

export interface MigrationPlan {
  uid: string;
  name: string;
  xp: number;
  streak: number;
  mastery: UserProfile["mastery"];
  aksaraStats: UserProfile["aksaraStats"];
}

/**
 * Gabung progres lokal ke baris server: XP/streak pakai nilai terbesar
 * (menang-maks, tidak pernah menghapus kerja), nama Google menang bila ada.
 */
export function planMigration(
  local: UserProfile | null,
  server: { xp: number; streak: number } | null,
  session: GoogleSession,
): MigrationPlan {
  return {
    uid: session.uid,
    name: session.displayName ?? local?.name ?? "Penjelajah",
    xp: Math.max(local?.xp ?? 0, server?.xp ?? 0),
    streak: Math.max(local?.streak ?? 0, server?.streak ?? 0),
    mastery: local?.mastery,
    aksaraStats: local?.aksaraStats,
  };
}

/**
 * Migrasi sekali setelah OAuth sukses: profil lokal anon di-upsert ke baris
 * server (profile_id = auth.uid()) + entri leaderboard disegarkan.
 * Gagal diam-diam (offline-first): progres lokal tetap aman.
 */
export async function migrateLocalToServer(session: GoogleSession): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const local = loadProfile();
  const { data: serverRow } = await supabase
    .from("profiles")
    .select("xp,streak")
    .eq("id", session.uid)
    .maybeSingle();
  const plan = planMigration(
    local,
    (serverRow as { xp: number; streak: number } | null) ?? null,
    session,
  );
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: plan.uid,
      is_anon: false,
      name: plan.name,
      xp: plan.xp,
      streak: plan.streak,
      last_active_date: local?.lastActiveDate ?? null,
      hearts: local?.hearts ?? 5,
      hearts_refilled_at: local?.heartsRefilledAt ?? null,
    },
    { onConflict: "id" },
  );
  if (profileError) return false;
  const { error: boardError } = await supabase.from("leaderboard_entries").upsert(
    {
      profile_id: plan.uid,
      display_name: plan.name,
      suffix: suffixForProfileId(plan.uid),
      xp: plan.xp,
    },
    { onConflict: "profile_id" },
  );
  return !boardError;
}

/**
 * Jalankan `onSignedIn` sekali untuk setiap sesi Google baru. Kembalikan
 * fungsi unsubscribe. No-op bila backend mati.
 */
export function watchGoogleSession(onSignedIn: (session: GoogleSession) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    if (!user || user.is_anonymous) return;
    const meta = user.user_metadata as { full_name?: unknown; name?: unknown } | null;
    const displayName =
      typeof meta?.full_name === "string"
        ? meta.full_name
        : typeof meta?.name === "string"
          ? meta.name
          : null;
    onSignedIn({ uid: user.id, displayName });
  });
  return () => data.subscription.unsubscribe();
}
