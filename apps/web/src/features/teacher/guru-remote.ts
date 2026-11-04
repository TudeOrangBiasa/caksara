import { getSupabase } from "../../lib/supabase";
import { ragResponseSchema } from "../../lib/zod/rag";
import type { RagCitation } from "../../lib/zod/rag";
import { TEACHER_OUTSIDE_REPLY } from "./teacher-data";

export interface GuruRemoteVerdict {
  answer: string;
  entryIds: string[];
  citations: RagCitation[];
  outside: boolean;
}

export interface GuruRemoteResult {
  ok: boolean;
  verdict: GuruRemoteVerdict | null;
}

interface GuruRagPayload {
  mode: "ask" | "explain";
  question?: string;
  prompt?: string;
  userChoice?: string;
  entryHint?: string;
}

/**
 * Panggil Edge guru-rag (#94/#95). Tak pernah melempar — semua kegagalan
 * (offline, tanpa backend, 5xx, Zod gagal, jawaban tanpa kutipan valid)
 * kembali ok:false agar pemanggil jatuh ke fallback lokal dengan kalimat
 * exact #90 (TEACHER_OUTSIDE_REPLY / GEMINI_DOWN_MESSAGE di call-site).
 */
export async function fetchGuruRemote(
  payload: GuruRagPayload,
  opts?: {
    /** Suntik pemanggil Edge untuk uji tanpa Supabase (pola fetchGeneratedQuiz). */
    invokeRemote?: () => Promise<{ data: unknown; error: unknown }>;
  },
): Promise<GuruRemoteResult> {
  const fail: GuruRemoteResult = { ok: false, verdict: null };
  try {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return fail;
    const supabase = getSupabase();
    if (!supabase && !opts?.invokeRemote) return fail;
    const invoke =
      opts?.invokeRemote ??
      (() =>
        supabase?.functions.invoke("guru-rag", { body: payload }) ??
        Promise.resolve({ data: null, error: new Error("tanpa supabase") }));
    const res = await invoke();
    if (res?.error || res?.data == null) return fail;
    const parsed = ragResponseSchema.safeParse(res.data);
    if (!parsed.success) return fail;
    // outside:true → FE tampilkan kalimat tolak exact; answer Edge diabaikan.
    if (parsed.data.outside) {
      return {
        ok: true,
        verdict: { answer: TEACHER_OUTSIDE_REPLY, entryIds: [], citations: [], outside: true },
      };
    }
    // Jawaban tanpa kutipan valid = error → fallback lokal (jangan chip palsu).
    const entryIds = parsed.data.entryIds.filter((id) => id.length > 0);
    if (parsed.data.answer.trim().length === 0 || entryIds.length === 0) return fail;
    const citations = (parsed.data.citations ?? []).filter((c) => entryIds.includes(c.id));
    return {
      ok: true,
      verdict: { answer: parsed.data.answer, entryIds, citations, outside: false },
    };
  } catch {
    return fail;
  }
}
