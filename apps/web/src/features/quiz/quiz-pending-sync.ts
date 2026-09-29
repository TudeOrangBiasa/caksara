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
  // Bagian yang sudah terkonfirmasi terkirim: flush melewatkannya agar tak
  // kirim ulang (progres kirim-ulang menggandakan hitungan Mastery).
  sessionSent: z.boolean().default(false),
  progressSent: z.boolean().default(false),
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

/**
 * Tambah sesi selesai yang gagal terkirim ke antrean buffer lokal.
 * Tolak skor inkonsisten (benar/total tak cocok jawaban) di batas agar entri
 * tak antre selamanya sampai prune 14 hari. Kembalikan true bila masuk antrean.
 */
export function enqueuePendingSession(input: {
  moduleId: string;
  answers: QuizAnswerDetail[];
  score: { correct: number; total: number };
  sessionSent?: boolean;
  progressSent?: boolean;
}): boolean {
  const parsed = pendingSessionSchema.omit({ enqueuedAt: true }).safeParse(input);
  if (!parsed.success) return false;
  const derivedCorrect = parsed.data.answers.filter((a) => a.correct).length;
  if (derivedCorrect !== parsed.data.score.correct) return false;
  if (parsed.data.answers.length !== parsed.data.score.total) return false;
  const all = prune(readAll());
  all.push({ ...parsed.data, enqueuedAt: Date.now() });
  writeAll(all);
  return true;
}

export function readPendingSessions(): PendingSession[] {
  return prune(readAll());
}

export function pendingSessionCount(): number {
  return readPendingSessions().length;
}

function entryKey(p: PendingSession): string {
  return `${p.moduleId}:${p.enqueuedAt}`;
}

function persistEntry(next: PendingSession): void {
  const key = entryKey(next);
  writeAll(prune(readAll()).map((p) => (entryKey(p) === key ? next : p)));
}

function dropEntry(done: PendingSession): void {
  const key = entryKey(done);
  writeAll(prune(readAll()).filter((p) => entryKey(p) !== key));
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
 * online). Atomik per entri: kedua bagian (sesi + progres) milik entri yang
 * sama dikirim dari entri itu; bagian yang sudah terkonfirmasi terkirim
 * dilewati agar tak kirim ulang (progres kirim-ulang menggandakan hitungan
 * Mastery). Entri hanya di-drop bila keduanya tuntas. Dedup sisi klien:
 * kunci moduleId:enqueuedAt. Batas: tanpa dedupe server, dua tab yang flush
 * bersamaan bisa insert sesi ganda — flag parsial dipersist per upaya agar
 * retry tak mengulang bagian yang sudah sukses. No-op saat offline/tanpa
 * backend. Tidak pernah melempar.
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
  let sent = 0;
  for (const p of pending) {
    try {
      let next = p;
      if (!next.sessionSent) {
        const sessionRes = await saveSession(next.moduleId, next.answers, next.score);
        if (!sessionRes.saved) continue;
        next = { ...next, sessionSent: true };
        persistEntry(next);
      }
      if (!next.progressSent) {
        const progressRes = await saveProgress(next.answers, knownIds);
        if (!progressRes.saved) continue;
        next = { ...next, progressSent: true };
        persistEntry(next);
      }
      dropEntry(next);
      sent += 1;
    } catch {
      continue;
    }
  }
  const remaining = prune(readAll()).length;
  return { attempted: pending.length, sent, remaining };
}

export interface SyncOnBackOnlineDeps extends FlushDeps {
  refreshKbCache?: () => Promise<unknown>;
}

/**
 * Sinkronisasi ulang saat koneksi pulih: flush buffer dan refresh KB cache
 * berjalan independen — KB selalu disegarkan walau antrean tersisa, karena
 * keterbacaan materi offline tak boleh diblokir kiriman tertunda. Keduanya
 * tak pernah melempar; kegagalan satu tak menggugurkan yang lain.
 */
export async function syncOnBackOnline(opts: SyncOnBackOnlineDeps = {}): Promise<FlushResult> {
  const { refreshKbCache, ...flushOpts } = opts;
  const result = await flushPendingSessions(flushOpts);
  try {
    if (refreshKbCache) await refreshKbCache();
    else await fetchKbEntries({ readCache: () => null });
  } catch {
    // KB refresh gagal: antrean tetap dilaporkan apa adanya, cache lama dipakai.
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
