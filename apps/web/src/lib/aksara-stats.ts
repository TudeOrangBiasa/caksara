import { aksaraStatsSchema } from "./zod/profile";
import type { AksaraStats } from "./zod/profile";
import { deriveMastery } from "./game-rules";
import type { Mastery } from "./game-rules";
import { WRESASTRA_AKSARA } from "../features/module/aksara-data";

export { aksaraStatsSchema };
export type { AksaraStats, Mastery };
export interface AksaraAnswer {
  aksaraId: string;
  correct: boolean;
}

/**
 * Catat satu jawaban ber-aksara. Id asing diabaikan agar soal non-Wresastra
 * dan bank korup tidak pernah meracuni Mastery.
 */
export function recordAksaraAnswer(stats: AksaraStats, answer: AksaraAnswer): AksaraStats {
  if (!WRESASTRA_AKSARA.some((a) => a.id === answer.aksaraId)) return stats;
  const prev = stats[answer.aksaraId] ?? { correct: 0, total: 0 };
  return {
    ...stats,
    [answer.aksaraId]: {
      correct: prev.correct + (answer.correct ? 1 : 0),
      total: prev.total + 1,
    },
  };
}

/** Peta Mastery 18 Wresastra dari hitungan. Tanpa hitungan berarti belum. */
export function deriveMasteryMap(stats: AksaraStats): Record<string, Mastery> {
  const out: Record<string, Mastery> = {};
  for (const a of WRESASTRA_AKSARA) {
    const s = stats[a.id];
    out[a.id] = deriveMastery({
      correctCount: s?.correct ?? 0,
      totalCount: s?.total ?? 0,
    });
  }
  return out;
}

export interface ProgressRow {
  aksaraId: string;
  correctCount: number;
  totalCount: number;
}

/**
 * Gabung hitungan server lama dengan jawaban sesi baru untuk upsert
 * user_aksara_progress. Murni agar bisa diuji tanpa Supabase.
 */
export function mergeProgressStats(
  existing: readonly ProgressRow[],
  answers: readonly AksaraAnswer[],
): ProgressRow[] {
  const merged: Record<string, ProgressRow> = {};
  for (const row of existing) {
    if (WRESASTRA_AKSARA.some((a) => a.id === row.aksaraId)) merged[row.aksaraId] = { ...row };
  }
  for (const a of answers) {
    if (!WRESASTRA_AKSARA.some((x) => x.id === a.aksaraId)) continue;
    const prev = merged[a.aksaraId] ?? {
      aksaraId: a.aksaraId,
      correctCount: 0,
      totalCount: 0,
    };
    merged[a.aksaraId] = {
      aksaraId: a.aksaraId,
      correctCount: prev.correctCount + (a.correct ? 1 : 0),
      totalCount: prev.totalCount + 1,
    };
  }
  return Object.values(merged);
}
