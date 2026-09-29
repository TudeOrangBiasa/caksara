import { useEffect, useState } from "react";

import { quizSchema } from "../../lib/zod/question";
import type { Question, Quiz } from "../../lib/zod/question";
import { ensureAnonSession, getSupabase } from "../../lib/supabase";
import { notifyQuizFallback } from "../../lib/notify";
import { getAdaptiveLevel } from "./quiz-data";

export type QuizSource = "gemini" | "fallback" | "offline" | "cache";

export interface GeneratedQuiz {
  /** null bila fallback lokal kosong/invalid — pemanggil tampilkan EmptyState + Coba Lagi. */
  quiz: Quiz | null;
  source: QuizSource;
  offline: boolean;
}

interface GenerateQuizResponse {
  moduleId: string;
  questions: Question[];
  cached?: boolean;
  offline?: boolean;
}

const CACHE_KEY = "caksara.quiz-cache.v1";
const CACHE_TTL_MS = 5 * 60_000;

interface CacheRow {
  quiz: Quiz;
  source: QuizSource;
  at: number;
}

function readCache(): Record<string, CacheRow> {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CacheRow>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(all: Record<string, CacheRow>): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(all));
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
 * Ambil sesi kuis modul (#23): Edge generate-quiz dulu (Gemini temp 0.3,
 * bulk 3-8, cache TTL pendek), 429/Gemini down/offline → fallback bank
 * statis + info offline. Tidak pernah melempar — selalu kembalikan kuis.
 */
export async function fetchGeneratedQuiz(
  moduleId: string,
  opts?: {
    count?: number;
    wrongTopics?: string[];
    localFallback: () => Quiz;
    /** Resume terbuka: jangan fetch Gemini baru, pakai set tersimpan/cache saja. */
    deferRemote?: boolean;
  },
): Promise<GeneratedQuiz> {
  const level = getAdaptiveLevel(moduleId);
  const count = Math.min(8, Math.max(3, opts?.count ?? 5));
  // Array kosong (<3 soal) tidak di-parse paksa — kembalikan null agar
  // QuizLaunchView menampilkan EmptyState + tombol Coba Lagi.
  const buildOffline = (): GeneratedQuiz => {
    let fallback: Quiz | null = null;
    try {
      fallback = opts?.localFallback() ?? null;
    } catch {
      fallback = null;
    }
    const parsed = fallback
      ? quizSchema.safeParse({ moduleId, questions: fallback.questions })
      : { success: false as const };
    if (parsed.success) return { quiz: parsed.data, source: "offline", offline: true };
    return { quiz: null, source: "offline", offline: true };
  };

  try {
    if (typeof navigator !== "undefined" && !navigator.onLine) return buildOffline();
    if (opts?.deferRemote) {
      const cached = readCachedQuiz(moduleId, level);
      return cached ?? buildOffline();
    }
    const supabase = getSupabase();
    if (!supabase) return buildOffline();
    const cached = readCachedQuiz(moduleId, level);
    if (cached?.quiz && cached.quiz.questions.length >= 3) return cached;
    await ensureAnonSession();
    // Retry ringan 1x (bukan 3x seperti Edge) sebelum menyerah ke offline.
    let data: GenerateQuizResponse | null = null;
    let error: unknown = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await supabase.functions.invoke<GenerateQuizResponse>("generate-quiz", {
        body: { moduleId, level, count, wrongTopics: opts?.wrongTopics ?? [] },
      });
      data = res.data;
      error = res.error;
      if (!error && data) break;
    }
    if (error || !data) return buildOffline();
    const parsed = quizSchema.safeParse({ moduleId: data.moduleId, questions: data.questions });
    if (!parsed.success) return buildOffline();
    const source: QuizSource = data.offline ? "offline" : data.cached ? "cache" : "gemini";
    storeCachedQuiz(moduleId, level, parsed.data, source);
    return { quiz: parsed.data, source, offline: source === "offline" };
  } catch {
    return buildOffline();
  }
}

export interface QuizLaunchState {
  status: "loading" | "ready";
  quiz: Quiz | null;
  source: QuizSource;
  offline: boolean;
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
      if (g.offline) notifyQuizFallback();
      setState({ status: "ready", quiz: g.quiz, source: g.source, offline: g.offline });
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
      Audio: Mendeley CC BY 4.0 · Latin sementara bila belum terkurasi
    </p>
  );
}
