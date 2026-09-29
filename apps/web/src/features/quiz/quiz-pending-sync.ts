import { z } from "zod";
import { getSupabase } from "../../lib/supabase";
import { saveQuizSession } from "./quiz-sync";
import { saveAksaraProgress } from "./quiz-progress";
import { fetchKbEntries } from "../kb/kb-source";
import type { QuizAnswerDetail } from "./quiz-sync";
import type { AksaraAnswer } from "../../lib/aksara-stats";
const pendingSessionSchema = z.object({
  moduleId: z.string().min(1),
  answers: z.array(
    z.object({
      questionIndex: z.number().int().nonnegative(),
      correct: z.boolean(),
      aksaraId: z.string().min(1).optional(),
    }),
  ),
  score: z.object({
    correct: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  enqueuedAt: z.number().int(),
});

export type PendingSession = z.infer<typeof pendingSessionSchema>;

const KEY = "caksara.pending-sync.v1";
/** Antrean menua 14 hari, lalu dianggap basi dan dibuang. */
const MAX_AGE_MS = 14 * 24 * 3600 * 1000;

function readAll(): PendingSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = z.array(pendingSessionSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function writeAll(all: PendingSession[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage penuh/diblokir: antrean hilang, progres lokal tetap aman.
  }
}

function prune(all: PendingSession[], now = Date.now()): PendingSession[] {
  return all.filter((p) => now - p.enqueuedAt <= MAX_AGE_MS);
}

/** Tambah sesi selesai yang gagal terkirim ke antrean buffer lokal. */
export function enqueuePendingSession(input: {
  moduleId: string;
  answers: QuizAnswerDetail[];
  score: { correct: number; total: number };
}): void {
  const parsed = pendingSessionSchema.omit({ enqueuedAt: true }).safeParse(input);
  if (!parsed.success) return;
  const all = prune(readAll());
  all.push({ ...parsed.data, enqueuedAt: Date.now() });
  writeAll(all);
}

export function readPendingSessions(): PendingSession[] {
  return prune(readAll());
}

export function pendingSessionCount(): number {
  return readPendingSessions().length;
}

function dropSent(sent: PendingSession[]): void {
  if (sent.length === 0) return;
  const sentKeys = new Set(sent.map((s) => `${s.moduleId}:${s.enqueuedAt}`));
  writeAll(prune(readAll()).filter((p) => !sentKeys.has(`${p.moduleId}:${p.enqueuedAt}`)));
}

export interface FlushResult {
  attempted: number;
  sent: number;
  remaining: number;
}

export interface FlushDeps {
  online?: boolean;
  hasBackend?: boolean;
  saveSession?: (
    moduleId: string,
    answers: QuizAnswerDetail[],
    score: { correct: number; total: number },
  ) => Promise<{ saved: boolean }>;
  saveProgress?: (
    answers: readonly AksaraAnswer[],
    knownIds: readonly string[],
  ) => Promise<{ saved: boolean }>;
  knownIds?: readonly string[];
}

/**
 * Kirim antrean buffer saat online (ADR-0008: buffer lokal + sync saat
 * online). No-op saat offline/tanpa backend. Tidak pernah melempar.
 */
export async function flushPendingSessions(opts: FlushDeps = {}): Promise<FlushResult> {
  const online = opts.online ?? (typeof navigator === "undefined" ? true : navigator.onLine);
  if (!online) {
    const remaining = readPendingSessions().length;
    return { attempted: 0, sent: 0, remaining };
  }
  const hasBackend = opts.hasBackend ?? getSupabase() !== null;
  if (!hasBackend) {
    const remaining = readPendingSessions().length;
    return { attempted: 0, sent: 0, remaining };
  }
  const pending = prune(readAll());
  writeAll(pending);
  if (pending.length === 0) return { attempted: 0, sent: 0, remaining: 0 };
  const saveSession = opts.saveSession ?? saveQuizSession;
  const saveProgress = opts.saveProgress ?? saveAksaraProgress;
  const knownIds = opts.knownIds ?? [];
  const sent: PendingSession[] = [];
  for (const p of pending) {
    try {
      const sessionRes = await saveSession(p.moduleId, p.answers, p.score);
      if (!sessionRes.saved) continue;
      const progressRes = await saveProgress(p.answers, knownIds);
      if (!progressRes.saved) continue;
      sent.push(p);
    } catch {
      continue;
    }
  }
  dropSent(sent);
  const remaining = prune(readAll()).length;
  return { attempted: pending.length, sent: sent.length, remaining };
}

export interface SyncOnBackOnlineDeps extends FlushDeps {
  refreshKbCache?: () => Promise<unknown>;
}

/**
 * Sinkronisasi ulang saat koneksi pulih: kirim antrean buffer lalu
 * segarkan KB cache bila antrean tuntas. Tidak pernah melempar.
 */
export async function syncOnBackOnline(opts: SyncOnBackOnlineDeps = {}): Promise<FlushResult> {
  const { refreshKbCache, ...flushOpts } = opts;
  const result = await flushPendingSessions(flushOpts);
  if (result.remaining > 0) return result;
  try {
    if (refreshKbCache) await refreshKbCache();
    else await fetchKbEntries({ readCache: () => null });
  } catch {
    // KB refresh gagal: antrean tetap terkirim, cache lama tetap dipakai.
  }
  return result;
}

/** Hapus antrean buffer (dipakai reset progres total #27). */
export function clearPendingSessions(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage diblokir: tidak ada yang perlu dihapus.
  }
}
