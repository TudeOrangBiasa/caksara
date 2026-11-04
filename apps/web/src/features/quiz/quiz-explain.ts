import { fetchGuruRemote } from "../teacher/guru-remote";
import type { RagCitation } from "../../lib/zod/rag";

export interface QuizExplainDeps {
  prompt: string;
  /** Pilihan murid yang salah (teks choice / susunan / pasangan). */
  userChoice: string;
  sourceRef?: string;
  aksaraId?: string;
}

export interface QuizExplain {
  text: string;
  citations: RagCitation[];
}

/**
 * Minta Edge guru-rag mode explain (#95 "Kenapa?"). Null = pakai explanation
 * statis soal (tak pernah blank). Tak pernah melempar.
 */
export async function fetchQuizExplain(
  deps: QuizExplainDeps,
  opts?: {
    invokeRemote?: () => Promise<{ data: unknown; error: unknown }>;
  },
): Promise<QuizExplain | null> {
  try {
    const hint = [deps.sourceRef?.split("·")[0]?.trim(), deps.aksaraId]
      .filter((s): s is string => !!s)
      .join(" · ");
    const remote = await fetchGuruRemote(
      { mode: "explain", prompt: deps.prompt, userChoice: deps.userChoice, entryHint: hint },
      opts ? { invokeRemote: opts.invokeRemote } : undefined,
    );
    if (!remote.ok || !remote.verdict || remote.verdict.outside) return null;
    return { text: remote.verdict.answer, citations: remote.verdict.citations };
  } catch {
    return null;
  }
}

/** Ringkas jawaban murid menjadi satu baris konteks untuk Edge. */
export function describeUserChoice(answer: {
  selectedIndex?: number;
  ordered?: string[];
  matches?: Record<string, string>;
  choices?: { text: string }[];
}): string {
  if (answer.selectedIndex !== undefined) {
    return answer.choices?.[answer.selectedIndex]?.text ?? `pilihan ${answer.selectedIndex + 1}`;
  }
  if (answer.ordered) return answer.ordered.join("-");
  if (answer.matches) {
    return Object.entries(answer.matches)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
  }
  return "";
}
