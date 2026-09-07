import { ensureAnonSession, getSupabase } from "../../lib/supabase";

export interface QuizAnswerDetail {
  questionIndex: number;
  correct: boolean;
}

/**
 * V10: simpan sesi + jawaban ke server (best-effort, soft state).
 * Gagal (offline / RLS / backend down) = diam, progres lokal tetap aman.
 */
export async function saveQuizSession(
  moduleId: string,
  answers: QuizAnswerDetail[],
  score: { correct: number; total: number },
): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const uid = await ensureAnonSession();
    if (!uid) return;
    const { data: session, error } = await supabase
      .from("quiz_sessions")
      .insert({
        profile_id: uid,
        module_id: moduleId,
        questions: answers,
        status: "done",
        score: score.correct,
        current_index: score.total,
      })
      .select("id")
      .single();
    const sessionId = (session as { id: number } | null)?.id;
    if (error || !sessionId) return;
    if (answers.length === 0) return;
    await supabase.from("answers").insert(
      answers.map((a) => ({
        session_id: sessionId,
        question_idx: a.questionIndex,
        correct: a.correct,
      })),
    );
  } catch {
    // Soft state: gagal simpan tidak menghalangi hasil kuis.
  }
}
