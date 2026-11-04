import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { formatLeaderboardName } from "../../lib/auth-google";
import { LEADERBOARD_LIMIT, supabaseLeaderboardSource, topEntries } from "./leaderboard-data";
import type { LeaderboardEntry, LeaderboardSource } from "./leaderboard-data";

function rankBadge(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

export function LeaderboardCard({
  source,
  currentProfileId,
}: {
  source?: LeaderboardSource;
  currentProfileId?: string;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    const active = source ?? supabaseLeaderboardSource();
    if (!active) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    void active.list(LEADERBOARD_LIMIT).then((rows) => {
      if (!cancelled) setEntries(topEntries(rows, LEADERBOARD_LIMIT));
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  return (
    <section
      aria-label="Papan peringkat"
      className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/50 border border-border/40"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Trophy className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Papan Peringkat
          </p>
          <h2 className="text-lg font-extrabold tracking-tight">Top {LEADERBOARD_LIMIT} XP</h2>
        </div>
      </div>
      {entries === null ? (
        <p className="text-sm text-muted-foreground">Memuat peringkat…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada peringkat. Masuk pakai Google biar XP-mu tercatat di sini.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {entries.map((entry, idx) => {
            const mine = entry.profile_id === currentProfileId;
            return (
              <li
                key={entry.profile_id}
                aria-current={mine ? "true" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                  mine ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted/40"
                }`}
              >
                <span
                  aria-hidden
                  className="flex w-7 shrink-0 items-center justify-center text-sm font-extrabold tabular-nums"
                >
                  {rankBadge(idx + 1)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                  {formatLeaderboardName(entry.display_name, entry.suffix)}
                </span>
                <span className="shrink-0 text-sm font-extrabold tabular-nums text-success">
                  {entry.xp} XP
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
