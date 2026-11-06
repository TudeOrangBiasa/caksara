import { cn } from "@caksara/ui/lib/utils";

import type { Question } from "../../lib/zod/question";
import { Bedawang } from "../../components/bedawang";
import { QuizAudio } from "./quiz-audio";

interface KenaliVisualPromptProps {
  question: Question;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

export function KenaliVisualPrompt({ question, showFeedback, isCorrect }: KenaliVisualPromptProps) {
  const isAudio = question.audioUrl || question.type === "dengar_pilih";
  // Soal dengar tak pernah menaruh prompt mentah ke bubble pra-jawaban:
  // prompt bank ("Dengarkan kata …") aman, tapi prompt Gemini bisa berisi jawaban.
  const safePrompt =
    question.type === "dengar_pilih" && !showFeedback
      ? "Dengar, lalu pilih jawaban yang benar…"
      : question.prompt;
  return (
    <div className="mb-4 flex gap-3 lg:mt-4 lg:mb-0 lg:items-center lg:gap-4">
      <Bedawang mood="semangat" className="size-14 shrink-0 lg:size-32" />
      <div
        className={cn(
          "relative min-w-0 flex-1 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-sm lg:rounded-2xl lg:px-4 lg:py-3 lg:shadow-none",
          "animate-bubble-in",
          showFeedback && isCorrect && "border-success/50 bg-success/15",
          showFeedback && !isCorrect && "border-destructive/50 bg-destructive/10",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-4 -left-2.5 size-5 rotate-45 border-b-2 border-l-2 border-border bg-card",
            showFeedback && isCorrect && "border-success/50 bg-success/15",
            showFeedback && !isCorrect && "border-destructive/50 bg-destructive/10",
          )}
        />
        {isAudio ? (
          <div className="flex flex-col items-center gap-3 lg:gap-2">
            <p className="text-center text-sm font-semibold text-card-foreground">{safePrompt}</p>
            <QuizAudio
              audioUrl={question.audioUrl}
              audioType={question.audioType}
              latinText={question.latinText}
              showFeedback={showFeedback}
            />
          </div>
        ) : (
          <p
            lang="ban"
            className="font-balinese wresastra-flow leading-loose font-bold break-words text-card-foreground"
          >
            {question.prompt}
          </p>
        )}
      </div>
    </div>
  );
}
