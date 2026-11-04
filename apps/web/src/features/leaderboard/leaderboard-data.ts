import { z } from "zod";

import { getSupabase } from "../../lib/supabase";

export const leaderboardEntrySchema = z.object({
  profile_id: z.string().min(1),
  display_name: z.string().min(1).max(20),
  suffix: z.number().int().min(100).max(999),
  xp: z.number().int().nonnegative(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const LEADERBOARD_LIMIT = 20;

export interface LeaderboardSource {
  list: (limit: number) => Promise<LeaderboardEntry[]>;
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
