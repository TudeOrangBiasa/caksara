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

/**
 * Topik salah-terus (#33 V11a): id materi dengan rate benar < 50% dari ≥3
 * jawaban (riwayat + sesi ini). Murni agar bisa diuji tanpa storage.
 * Menerima aksaraId Wresastra maupun id materi non-Wresastra berformat
 * stabil (huruf/angka/garis-bawah/strip); sisanya diabaikan agar bank
 * korup tak meracuni level.
 */
export function deriveWrongTopics(stats: AksaraStats, answers: readonly AksaraAnswer[]): string[] {
  const merged: AksaraStats = {};
  for (const [id, s] of Object.entries(stats)) {
    if (!isStableTopicId(id)) continue;
    merged[id] = { ...s };
  }
  for (const a of answers) {
    if (!isStableTopicId(a.aksaraId)) continue;
    const prev = merged[a.aksaraId] ?? { correct: 0, total: 0 };
    merged[a.aksaraId] = {
      correct: prev.correct + (a.correct ? 1 : 0),
      total: prev.total + 1,
    };
  }
  return Object.entries(merged)
    .filter(([, s]) => s.total >= 3 && s.correct / s.total < 0.5)
    .map(([id]) => id)
    .toSorted();
}

// Debt #33 KB-adaptif: badge KB (kb-list/kb-detail) masih statis per entri
// dan tak mengikuti level adaptif sesi; sinkronkan bila KB disentuh lagi.
const TOPIC_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

function isStableTopicId(id: string | undefined): id is string {
  if (!id) return false;
  if (WRESASTRA_AKSARA.some((x) => x.id === id)) return true;
  return TOPIC_ID_RE.test(id);
}
