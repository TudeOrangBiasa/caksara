import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/**
 * Klien Supabase (lazy). Kembalikan null bila env belum diset sehingga
 * aplikasi tetap jalan penuh secara lokal (localStorage) tanpa backend.
 * Env dibaca dari apps/web/.env (gitignored, lihat .env.example).
 */
export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !publishableKey) {
    if (import.meta.env.DEV) {
      console.warn(
        "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY belum diset, mode lokal.",
      );
    }
    cached = null;
    return cached;
  }
  cached = createClient(url, publishableKey);
  return cached;
}

/**
 * Pastikan ada sesi anon (ADR-0002). No-op bila backend belum diset.
 * Kembalikan user id (auth.uid()) atau null.
 */
export async function ensureAnonSession(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const existing = data.session?.user.id;
  if (existing) return existing;
  const { data: created, error } = await supabase.auth.signInAnonymously();
  if (error || !created.session) {
    console.warn("[supabase] signInAnonymously gagal:", error?.message);
    return null;
  }
  return created.session.user.id;
}
