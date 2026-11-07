import { useEffect, useState } from "react";
import { z } from "zod";

import { quizSchema } from "../../lib/zod/question";
import type { Question, Quiz } from "../../lib/zod/question";
import { ensureAnonSession, getSupabase } from "../../lib/supabase";
import { notifyQuizFallback } from "../../lib/notify";
import { getAdaptiveLevel } from "./quiz-data";

export type QuizFailureReason = "offline" | "rate-limited" | "server-down";

export type QuizNotice = "quiz-fallback" | "quiz-ratelimit";

export type QuizSource = "gemini" | "fallback" | "offline" | "cache";

export interface GeneratedQuiz {
  /** null bila fallback lokal kosong/invalid — pemanggil tampilkan EmptyState + Coba Lagi. */
  quiz: Quiz | null;
  source: QuizSource;
  offline: boolean;
  /**
   * Penyebab kegagalan Edge yang bisa ditindak user (#29 V8c):
   * offline = perangkat tanpa koneksi, rate-limited = 429 dari Edge/Gemini,
   * server-down = 5xx/Gemini down/invalid. Absen bila kuis Gemini/cache valid.
   */
  failure?: QuizFailureReason;
}

interface GenerateQuizResponse {
  moduleId: string;
  questions: Question[];
  cached?: boolean;
  offline?: boolean;
}

/** Body persis yang dikirim ke Edge generate-quiz (#96: level adaptif + wrongTopics). */
export interface GenerateQuizRequestBody {
  moduleId: string;
  level: number;
  count: number;
  wrongTopics: string[];
}

const CACHE_KEY = "caksara.quiz-cache.v1";
const CACHE_TTL_MS = 5 * 60_000;

const cacheRowSchema = z.object({
  quiz: quizSchema,
  source: z.enum(["gemini", "fallback", "offline", "cache"]),
  at: z.number(),
});

type CacheRow = z.infer<typeof cacheRowSchema>;

const cacheSchema = z.record(z.string(), cacheRowSchema);

function readCache(): Record<string, CacheRow> {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = cacheSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

function writeCache(all: Record<string, CacheRow>): void {
  try {
    if (typeof window === "undefined") return;
    const validated = cacheSchema.safeParse(all);
    if (!validated.success) return;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(validated.data));
  } catch {
    // Storage diblokir: cache dilewati, kuis tetap jalan dari fallback lokal.
  }
}
/** Hapus cache kuis Gemini (dipakai reset progres total #27). */
export function clearQuizCache(): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    // Storage diblokir: tidak ada yang perlu dihapus.
  }
}

export function readCachedQuiz(moduleId: string, level: number): GeneratedQuiz | null {
  const row = readCache()[`${moduleId}:L${level}`];
  if (!row) return null;
  if (Date.now() - row.at > CACHE_TTL_MS) return null;
  const parsed = quizSchema.safeParse(row.quiz);
  return parsed.success ? { quiz: parsed.data, source: "cache", offline: false } : null;
}

function storeCachedQuiz(moduleId: string, level: number, quiz: Quiz, source: QuizSource): void {
  const all = readCache();
  all[`${moduleId}:L${level}`] = { quiz, source, at: Date.now() };
  writeCache(all);
}

/**
 * Ambil sesi kuis modul: Edge generate-quiz dulu (Gemini temp 0.3,
 * tepat 8 soal screen truth, cache TTL pendek), 429/Gemini down/offline → fallback
 * bank statis + info offline. Tidak pernah melempar — selalu kembalikan kuis.
 */
export async function fetchGeneratedQuiz(
  moduleId: string,
  opts?: {
    count?: number;
    wrongTopics?: string[];
    localFallback: () => Quiz;
    /** Resume terbuka: jangan fetch Gemini baru, pakai set tersimpan/cache saja. */
    deferRemote?: boolean;
    /** Suntik pemanggil Edge untuk uji 429/non-429 tanpa Supabase (#29 V8c). */
    invokeRemote?: () => Promise<{ data: GenerateQuizResponse | null; error: unknown }>;
    /**
     * Intip body request Edge (#96): dipanggil sebelum invoke dengan body
     * persis yang dikirim. Hanya untuk uji/harness — produksi abaikan.
     */
    onRequestBody?: (body: GenerateQuizRequestBody) => void;
  },
): Promise<GeneratedQuiz> {
  const level = getAdaptiveLevel(moduleId);
  const count = 8; // Screen truth: sesi selalu 8 soal offline maupun online.
  const buildFallback = (failure: QuizFailureReason): GeneratedQuiz => {
    let fallback: Quiz | null = null;
    try {
      fallback = opts?.localFallback() ?? null;
    } catch {
      fallback = null;
    }
    const parsed = fallback
      ? quizSchema.safeParse({ moduleId, questions: fallback.questions })
      : { success: false as const };
    if (parsed.success) return { quiz: parsed.data, source: "offline", offline: true, failure };
    return { quiz: null, source: "offline", offline: true, failure };
  };

  try {
    if (typeof navigator !== "undefined" && navigator.onLine === false)
      return buildFallback("offline");
    if (opts?.deferRemote) {
      const cached = readCachedQuiz(moduleId, level);
      return cached ?? buildFallback("offline");
    }
    const supabase = getSupabase();
    if (!supabase && !opts?.invokeRemote) return buildFallback("offline");
    const cached = readCachedQuiz(moduleId, level);
    if (cached?.quiz && cached.quiz.questions.length >= 8) return cached;
    // Seam uji: invokeRemote menyuntik hasil Edge tanpa sesi jaringan.
    if (!opts?.invokeRemote) await ensureAnonSession();
    const body: GenerateQuizRequestBody = {
      moduleId,
      level,
      count,
      wrongTopics: opts?.wrongTopics ?? [],
    };
    opts?.onRequestBody?.(body);
    const invoke =
      opts?.invokeRemote ??
      (() => supabase?.functions.invoke<GenerateQuizResponse>("generate-quiz", { body }));
    // Retry ringan 1x (bukan 3x seperti Edge) sebelum menyerah ke fallback.
    // 429 tidak di-retry: Edge rate-limit per menit, ulangi langsung pasti gagal lagi.
    let data: GenerateQuizResponse | null = null;
    let error: unknown = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await invoke();
      data = res?.data ?? null;
      error = res?.error ?? new Error("generate-quiz tanpa respons");
      if (!error && data) break;
      if (isRateLimitedError(error)) break;
    }
    if (error || !data) {
      return buildFallback(isRateLimitedError(error) ? "rate-limited" : "server-down");
    }
    const parsed = quizSchema.safeParse({ moduleId: data.moduleId, questions: data.questions });
    if (!parsed.success) return buildFallback("server-down");
    const source: QuizSource = data.offline ? "offline" : data.cached ? "cache" : "gemini";
    storeCachedQuiz(moduleId, level, parsed.data, source);
    return { quiz: parsed.data, source, offline: source === "offline" };
  } catch {
    return buildFallback("server-down");
  }
}

/**
 * 429 dari supabase functions-js: FunctionsHttpError membawa Response asli
 * di context (bukan di error.status). Cek status Response + pola pesan 429.
 */
export function isRateLimitedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("context" in error) {
    const ctx: unknown = error.context;
    if (ctx instanceof Response && ctx.status === 429) return true;
    if (ctx && typeof ctx === "object" && "status" in ctx && ctx.status === 429) return true;
    if (ctx && typeof ctx === "object") {
      if ("message" in ctx && typeof ctx.message === "string" && RATE_LIMIT_RE.test(ctx.message))
        return true;
      if ("error" in ctx && typeof ctx.error === "string" && RATE_LIMIT_RE.test(ctx.error))
        return true;
    }
  }
  if ("message" in error && typeof error.message === "string" && RATE_LIMIT_RE.test(error.message))
    return true;
  return false;
}

const RATE_LIMIT_RE = /\b429\b|terlalu banyak permintaan/i;

export interface QuizLaunchState {
  status: "loading" | "ready";
  quiz: Quiz | null;
  source: QuizSource;
  offline: boolean;
  failure?: QuizFailureReason;
}

/**
 * Hook peluncur Sesi Kuis: loading → siap. Fallback lokal dipakai bila
 * Edge 429/Gemini down/offline sehingga sesi tidak pernah macet.
 */
export function useQuizLaunch(
  moduleId: string,
  opts?: {
    count?: number;
    wrongTopics?: string[];
    localFallback: () => Quiz;
    deferRemote?: boolean;
    reloadToken?: number;
    onNotice?: (notice: QuizNotice) => void;
  },
): QuizLaunchState {
  const [state, setState] = useState<QuizLaunchState>({
    status: "loading",
    quiz: null,
    source: "fallback",
    offline: false,
  });
  useEffect(() => {
    let alive = true;
    setState({ status: "loading", quiz: null, source: "fallback", offline: false });
    void fetchGeneratedQuiz(moduleId, opts).then((g) => {
      if (!alive) return;
      if (g.failure === "rate-limited") opts?.onNotice?.("quiz-ratelimit");
      else if (g.offline) opts?.onNotice?.("quiz-fallback");
      if (g.offline && !opts?.onNotice) notifyQuizFallback();
      setState({
        status: "ready",
        quiz: g.quiz,
        source: g.source,
        offline: g.offline,
        failure: g.failure,
      });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, opts?.deferRemote, opts?.count, opts?.reloadToken]);

  return state;
}

/** Atribusi audio CC BY 4.0 di bawah tombol Putar (badge Latin bila belum terkurasi). */
export function AudioSourceNote() {
  return (
    <p className="mt-1 text-center text-[11px] text-muted-foreground">
      Audio: Mendeley Data CC BY 4.0 · Latin sementara bila belum terkurasi
    </p>
  );
}
