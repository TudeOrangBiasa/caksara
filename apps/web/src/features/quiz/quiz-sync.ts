import { z } from "zod";
import { ensureAnonSession, getSupabase } from "../../lib/supabase";

export interface QuizAnswerDetail {
  questionIndex: number;
  correct: boolean;
}

const quizAnswerDetailSchema = z.object({
  questionIndex: z.number().int().nonnegative(),
  correct: z.boolean(),
});

const saveQuizSessionInputSchema = z.object({
  moduleId: z.string().min(1),
  answers: z.array(quizAnswerDetailSchema),
  score: z.object({
    correct: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
});

export type SaveQuizSessionReason =
  | "validation"
  | "offline"
  | "no-backend"
  | "no-session"
  | "server";

export type SaveQuizSessionResult =
  | { saved: true }
  | { saved: false; reason: SaveQuizSessionReason };

/**
 * V10: simpan sesi + jawaban ke server. Gagal tidak melempar: hasilnya
 * dikembalikan sebagai SaveQuizSessionResult agar pemanggil bisa toast/retry.
 * Progres lokal tidak pernah bergantung pada hasil ini.
 */
export async function saveQuizSession(
  moduleId: string,
  answers: QuizAnswerDetail[],
  score: { correct: number; total: number },
): Promise<SaveQuizSessionResult> {
  const parsed = saveQuizSessionInputSchema.safeParse({ moduleId, answers, score });
  if (!parsed.success) return { saved: false, reason: "validation" };
  const { moduleId: mod, answers: validAnswers, score: validScore } = parsed.data;
  const derivedCorrect = validAnswers.filter((a) => a.correct).length;
  if (derivedCorrect !== validScore.correct || validAnswers.length !== validScore.total) {
    return { saved: false, reason: "validation" };
  }
  try {
    const supabase = getSupabase();
    if (!supabase) return { saved: false, reason: "no-backend" };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { saved: false, reason: "offline" };
    }
    const uid = await ensureAnonSession();
    if (!uid) return { saved: false, reason: "no-session" };
    const { data: session, error } = await supabase
      .from("quiz_sessions")
      .insert({
        profile_id: uid,
        module_id: mod,
        questions: validAnswers,
        status: "done",
        score: validScore.correct,
        current_index: validScore.total,
      })
      .select("id")
      .single();
    const sessionId = (session as { id: number } | null)?.id;
    if (error || !sessionId) return { saved: false, reason: "server" };
    if (validAnswers.length === 0) return { saved: true };
    const { error: answersError } = await supabase.from("answers").insert(
      validAnswers.map((a) => ({
        session_id: sessionId,
        question_idx: a.questionIndex,
        correct: a.correct,
      })),
    );
    if (answersError) return { saved: false, reason: "server" };
    return { saved: true };
  } catch {
    return { saved: false, reason: "server" };
  }
}
