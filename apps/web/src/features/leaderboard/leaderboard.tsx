import { Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { formatLeaderboardName } from "../../lib/auth-google";
import { LEADERBOARD_LIMIT, supabaseLeaderboardSource, topEntries } from "./leaderboard-data";
import type { LeaderboardEntry, LeaderboardSource } from "./leaderboard-data";

function rankStyle(rank: number): string {
  if (rank === 1) return "bg-[#FFC800] text-[#8a6100]";
  if (rank === 2) return "bg-muted text-muted-foreground";
  if (rank === 3) return "bg-[#FFEED1] text-primary";
  return "bg-transparent text-muted-foreground";
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

  const mineIndex = entries?.findIndex((e) => e.profile_id === currentProfileId) ?? -1;

  return (
    <section
      aria-label="Papan peringkat"
      className="overflow-hidden rounded-[20px] border-2 border-b-[5px] border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#FFF3C4] text-[#FFC800]">
            <Trophy className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-xl font-extrabold tracking-tight">TOP {LEADERBOARD_LIMIT}</p>
            <p className="text-xs font-medium text-muted-foreground">Liga mingguan</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#FFF3C4] px-3.5 py-1.5 text-xs font-extrabold text-[#8a6100]">
          {LEADERBOARD_LIMIT} teratas
        </span>
      </div>
      <div className="p-3">
        {entries === null ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">Memuat peringkat…</p>
        ) : entries.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            Belum ada peringkat. Masuk pakai Google biar XP-mu tercatat di sini.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const mine = entry.profile_id === currentProfileId;
              return (
                <li
                  key={entry.profile_id}
                  aria-current={mine ? "true" : undefined}
                  className={`flex items-center gap-3.5 rounded-2xl border-2 px-4 py-3 ${
                    mine
                      ? "border-cta bg-cta/10"
                      : rank <= 3
                        ? "border-border/70 bg-muted/40"
                        : "border-border/50 bg-card"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold tabular-nums ${rankStyle(rank)}`}
                  >
                    {rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-base font-semibold">
                    {formatLeaderboardName(entry.display_name, entry.suffix)}
                    {mine && <span className="ml-1.5 text-cta">• Kamu</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-extrabold tabular-nums text-[#1CB0F6]">
                    <Zap className="size-4 fill-current" aria-hidden />
                    {entry.xp} XP
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {mineIndex >= 0 && (
          <p className="px-2 pb-1 pt-3 text-xs font-medium text-muted-foreground">
            Posisimu peringkat #{mineIndex + 1} dari {entries?.length ?? 0} petualang.
          </p>
        )}
      </div>
    </section>
  );
}
