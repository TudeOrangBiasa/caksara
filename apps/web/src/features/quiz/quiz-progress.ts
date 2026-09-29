import { ensureAnonSession, getSupabase } from "../../lib/supabase";
import { deriveMastery } from "../../lib/game-rules";
import type { AksaraAnswer, ProgressRow } from "../../lib/aksara-stats";
import { mergeProgressStats } from "../../lib/aksara-stats";

export type SaveProgressReason = "offline" | "no-backend" | "no-session" | "server";

/**
 * Upsert jawaban sesi ke user_aksara_progress (#24): baca hitungan lama,
 * gabung dengan jawaban baru, tulis balik per baris. Gagal tidak melempar
 * karena progres lokal adalah sumber kebenaran Mastery.
 */
export async function saveAksaraProgress(
  answers: readonly AksaraAnswer[],
  knownIds: readonly string[],
): Promise<{ saved: boolean; reason?: SaveProgressReason }> {
  if (answers.length === 0) return { saved: true };
  const supabase = getSupabase();
  if (!supabase) return { saved: false, reason: "no-backend" };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { saved: false, reason: "offline" };
  }
  try {
    const uid = await ensureAnonSession();
    if (!uid) return { saved: false, reason: "no-session" };
    const { data: existing } = await supabase
      .from("user_aksara_progress")
      .select("aksara_id, correct_count, total_count")
      .eq("profile_id", uid)
      .in("aksara_id", [...knownIds]);
    const rows: ProgressRow[] = ((existing ?? []) as Record<string, unknown>[]).map((r) => ({
      aksaraId: String(r["aksara_id"] ?? ""),
      correctCount: Number(r["correct_count"] ?? 0),
      totalCount: Number(r["total_count"] ?? 0),
    }));
    const merged = mergeProgressStats(rows, answers);
    for (const row of merged) {
      const mastery = deriveMastery({
        correctCount: row.correctCount,
        totalCount: row.totalCount,
      });
      const { error } = await supabase.from("user_aksara_progress").upsert(
        {
          profile_id: uid,
          aksara_id: row.aksaraId,
          correct_count: row.correctCount,
          total_count: row.totalCount,
          mastery,
        },
        { onConflict: "profile_id,aksara_id" },
      );
      if (error) return { saved: false, reason: "server" };
    }
    return { saved: true };
  } catch {
    return { saved: false, reason: "server" };
  }
}
