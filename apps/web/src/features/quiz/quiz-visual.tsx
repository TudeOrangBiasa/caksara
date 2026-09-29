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
  return (
    <div className="mb-4 flex gap-3">
      <Bedawang mood="semangat" className="size-12 shrink-0" />
      <div
        className={cn(
          "relative min-w-0 flex-1 rounded-2xl border-2 border-border bg-card px-4 py-3",
          "animate-bubble-in",
          showFeedback && isCorrect && "bg-success/15",
          showFeedback && !isCorrect && "bg-destructive/10",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-4 -left-2.5 size-5 rotate-45 border-b-2 border-l-2 border-border bg-card",
            showFeedback && isCorrect && "bg-success/15",
            showFeedback && !isCorrect && "bg-destructive/10",
          )}
        />
        {isAudio ? (
          <QuizAudio
            audioUrl={question.audioUrl}
            audioType={question.audioType}
            latinText={question.latinText}
          />
        ) : (
          <p className="font-balinese wresastra-flow leading-loose break-words text-card-foreground">
            {question.prompt}
          </p>
        )}
      </div>
    </div>
  );
}
