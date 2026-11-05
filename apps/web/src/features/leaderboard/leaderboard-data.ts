import { z } from "zod";

import { getSupabase } from "../../lib/supabase";
import type { WitaDate } from "../../lib/zod/game-state";

export const leaderboardEntrySchema = z.object({
  profile_id: z.string().min(1),
  display_name: z.string().min(1).max(20),
  suffix: z.number().int().min(100).max(999),
  xp: z.number().int().nonnegative(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const LEADERBOARD_LIMIT = 20;

/** Awal pekan liga: Senin 00:00 WITA. Copy Leaderboard ikut aturan ini. */
export function weekStartSenin(today: WitaDate): WitaDate {
  const [y, m, d] = today.split("-").map(Number) as [number, number, number];
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const back = (day + 6) % 7;
  const monday = new Date(Date.UTC(y, m - 1, d) - back * 86_400_000);
  const mm = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(monday.getUTCDate()).padStart(2, "0");
  return `${monday.getUTCFullYear()}-${mm}-${dd}` as WitaDate;
}

/** True hanya pada hari Senin: pekan liga direset tiap Senin WITA. */
export function isResetMingguIni(today: WitaDate): boolean {
  return weekStartSenin(today) === today;
}

export interface LeaderboardSource {
  list: (limit: number) => Promise<LeaderboardEntry[]>;
}

const PARITY_KEY = "caksara.parity-league.v1";

/** Fixture parity: 8 baris baseline t8BaKT dari localStorage (DEV + parity run saja). */
export function parityLeagueSource(): LeaderboardSource | null {
  if (!import.meta.env.DEV) return null;
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PARITY_KEY);
  if (!raw) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = z.array(leaderboardEntrySchema).safeParse(json);
  if (!parsed.success) return null;
  return {
    async list(limit: number): Promise<LeaderboardEntry[]> {
      return topEntries(parsed.data, limit);
    },
  };
}

/** Sumber Supabase: top-N diurut XP desc (RLS publik baca). */
export function supabaseLeaderboardSource(): LeaderboardSource | null {
  const supabase = getSupabase();
  if (!supabase) return null;
  return {
    async list(limit: number): Promise<LeaderboardEntry[]> {
      const { data, error } = await supabase
        .from("leaderboard_entries")
        .select("profile_id,display_name,suffix,xp")
        .order("xp", { ascending: false })
        .limit(limit);
      if (error || !data) return [];
      const parsed = z.array(leaderboardEntrySchema).safeParse(data);
      return parsed.success ? parsed.data : [];
    },
  };
}

/** Urutkan + potong di sisi klien untuk fixture/mock (mirror query server). */
export function topEntries(
  entries: readonly LeaderboardEntry[],
  limit: number,
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.xp - a.xp).slice(0, limit);
}
