// Final-round native shell (#99, ADR-0014): Capacitor Android + Electron, tanpa iOS/Tauri.
import { getSupabase } from "./supabase";
import { loadProfile } from "./profile-store";
import type { UserProfile } from "./zod/profile";

export const GOOGLE_REDIRECT_PATH = "/";
export const LEADERBOARD_LIMIT = 20;
export const SUFFIX_MIN = 100;
export const SUFFIX_MAX = 999;

/** #100: scheme deep-link OAuth di shell Android (intent-filter + allowlist dashboard). */
export const NATIVE_AUTH_SCHEME = "app.caksara.web";
export const NATIVE_AUTH_PATH = "/auth/callback";
export const NATIVE_AUTH_REDIRECT = `${NATIVE_AUTH_SCHEME}://${NATIVE_AUTH_PATH.slice(1)}`;

/**
 * URL kembali OAuth Google. Daftarkan di Dashboard Supabase > Authentication >
 * URL Configuration > Redirect URLs:
 * - http://localhost:5173/ (dev lokal)
 * - https://<proyek>.vercel.app/ (preview + production)
 * - app.caksara.web://auth/callback (shell Android #100)
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
 * Mulai login Google via Supabase OAuth. Kembalikan URL tujuan bila backend
 * + provider siap; null bila tombol wajib disembunyikan (env kosong,
 * offline, provider mati, atau halaman OAuth sudah dibuka di browser
 * sistem native) — app tetap jalan sebagai tamu.
 */
export async function startGoogleLogin(origin: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;
  const native = typeof window !== "undefined" && "Capacitor" in window;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: native ? NATIVE_AUTH_REDIRECT : googleRedirectTo(origin),
      skipBrowserRedirect: native,
    },
  });
  if (error || !data.url) {
    if (import.meta.env.DEV) console.warn("[auth] Google login gagal:", error?.message);
    return null;
  }
  if (native) {
    try {
      // Modul @capacitor/browser tidak ada di web; impor dinamis di cabang
      // native saja agar bundle web tidak menarik runtime Capacitor.
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: data.url });
      return null;
    } catch {
      return data.url;
    }
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
  return toGoogleSession(
    user.id,
    user.user_metadata as { full_name?: unknown; name?: unknown } | null,
  );
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
    onSignedIn(
      toGoogleSession(
        user.id,
        user.user_metadata as { full_name?: unknown; name?: unknown } | null,
      ),
    );
  });
  return () => data.subscription.unsubscribe();
}

/**
 * True bila URL adalah callback OAuth milik scheme native
 * (`app.caksara.web://auth/callback?...`, murni — aman diuji tanpa WebView).
 */
export function isNativeAuthCallback(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== `${NATIVE_AUTH_SCHEME}:`) return false;
  // URL non-spesial: `auth` jadi host, bukan segmen path — gabungkan kembali.
  return `${parsed.host}${parsed.pathname}` === NATIVE_AUTH_PATH.slice(1);
}

/**
 * Ambil potongan sesi (`code` PKCE / `access_token`+`refresh_token` implicit)
 * dari URL callback. Kembalikan null bila bukan callback native atau
 * tanpa kredensial — pemanggil menampilkan EmptyState, bukan crash.
 */
export function parseNativeAuthCallback(rawUrl: string): {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
} | null {
  if (!isNativeAuthCallback(rawUrl)) return null;
  const query = new URL(rawUrl).searchParams;
  const fragment = new URLSearchParams(new URL(rawUrl).hash.slice(1));
  const code = query.get("code");
  const accessToken = fragment.get("access_token") ?? query.get("access_token");
  const refreshToken = fragment.get("refresh_token") ?? query.get("refresh_token");
  if (!code && !(accessToken && refreshToken)) return null;
  return { code, accessToken, refreshToken };
}

/**
 * Tukar kredensial deep-link native jadi sesi Supabase. PKCE (`code`)
 * diutamakan; implicit (`access_token`+`refresh_token`) cadangan.
 * Null bila backend mati atau tukaran gagal — tamu tetap jalan.
 */
export async function exchangeNativeAuthCallback(rawUrl: string): Promise<GoogleSession | null> {
  const supabase = getSupabase();
  const parsed = parseNativeAuthCallback(rawUrl);
  if (!supabase || !parsed) return null;
  if (parsed.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(parsed.code);
    if (error || !data.session || data.session.user.is_anonymous) return null;
    return toGoogleSession(data.session.user.id, data.session.user.user_metadata);
  }
  if (parsed.accessToken && parsed.refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: parsed.accessToken,
      refresh_token: parsed.refreshToken,
    });
    if (error || !data.session || data.session.user.is_anonymous) return null;
    return toGoogleSession(data.session.user.id, data.session.user.user_metadata);
  }
  return null;
}

function toGoogleSession(
  uid: string,
  meta: { full_name?: unknown; name?: unknown } | null,
): GoogleSession {
  const displayName =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.name === "string"
        ? meta.name
        : null;
  return { uid, displayName };
}
