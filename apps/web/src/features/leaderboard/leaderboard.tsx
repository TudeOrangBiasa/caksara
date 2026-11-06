import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { formatLeaderboardName } from "../../lib/auth-google";
import { witaTodayStr } from "../../lib/profile-store";
import { parseWitaDate } from "../../lib/zod/game-state";
import {
  LEADERBOARD_LIMIT,
  isResetMingguIni,
  parityLeagueSource,
  supabaseLeaderboardSource,
  topEntries,
} from "./leaderboard-data";

/** Row Pencil t8BaKT: rank pill rank 1-3, lingkaran inisial, XP grouping id-ID. */
function rowStyle(rank: number, mine: boolean): string {
  if (mine) return "border-cta bg-[#D7FFB8]";
  if (rank === 1) return "border-[#FFC800] bg-[#FFF3C4]";
  if (rank === 2) return "border-[#C9CFD6] bg-[#F4F6F8]";
  if (rank === 3) return "border-[#E8A15C] bg-[#FBEFE3]";
  return "border-[#EDEFF3] bg-card";
}

const RANK_PILL = [
  "bg-[#FFC800] text-white",
  "bg-[#C9CFD6] text-white",
  "bg-[#E8A15C] text-white",
] as const;

export function LeaderboardCard({
  source,
  currentProfileId,
}: {
  source?: LeaderboardSource;
  currentProfileId?: string;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    const active = source ?? parityLeagueSource() ?? supabaseLeaderboardSource();
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
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4 lg:gap-4 lg:px-6 lg:py-5">
        <div className="flex items-center gap-3 lg:gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#FFF3C4] text-[#FFC800]">
            <Trophy className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-xl font-extrabold tracking-tight lg:leading-[24px]">
              TOP {LEADERBOARD_LIMIT}
            </p>
            <p className="text-xs font-medium text-muted-foreground lg:text-[13px] lg:leading-[16px]">
              Reset tiap Senin
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#FFF3C4] px-3.5 py-1.5 text-xs font-extrabold text-[#8a6100] lg:px-4 lg:py-2 lg:leading-[15px]">
          {isResetMingguIni(parseWitaDate(witaTodayStr())) ? "Reset hari ini" : "Liga mingguan"}
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
          <ol className="flex flex-col gap-2 lg:gap-2.5">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const mine = entry.profile_id === currentProfileId;
              const name = formatLeaderboardName(entry.display_name, entry.suffix);
              return (
                <li
                  key={entry.profile_id}
                  aria-current={mine ? "true" : undefined}
                  className={`flex items-center gap-3.5 rounded-[14px] border-2 px-4 py-3 lg:gap-3.5 lg:px-5 lg:py-3 ${rowStyle(rank, mine)}`}
                >
                  {rank <= 3 ? (
                    <span
                      aria-hidden
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold tabular-nums ${RANK_PILL[rank - 1]}`}
                    >
                      {rank}
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className={`w-2.5 shrink-0 text-center text-[15px] tabular-nums ${mine ? "text-cta" : "text-muted-foreground"}`}
                    >
                      {rank}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ${mine ? "bg-cta text-white" : "bg-[#EDEFF3] text-muted-foreground"}`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-base ${mine ? "font-extrabold" : "font-semibold"}`}
                  >
                    {name}
                    {mine && <span className="ml-1.5">• Kamu</span>}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-1 tabular-nums">
                    <span className={`text-base font-extrabold ${mine ? "text-cta" : ""}`}>
                      {entry.xp.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">XP</span>
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
