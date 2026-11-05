import { cn } from "@caksara/ui/lib/utils";

import type { Question } from "../../lib/zod/question";

interface QuizChoiceProps {
  question: Question;
  selectedIndex: number | null;
  showFeedback: boolean;
  /** Pilihan terakhir yang disentuh — pemicu AnswerShake saat salah. */
  shakeIndex?: number | null;
  onSelect: (index: number) => void;
}

export function QuizChoice({
  question,
  selectedIndex,
  showFeedback,
  shakeIndex,
  onSelect,
}: QuizChoiceProps) {
  if (!("choices" in question)) return null;
  return (
    <div className="grid gap-3">
      {question.choices.map((choice, i) => {
        const isSelected = selectedIndex === i;
        const isCorrect = choice.isCorrect;
        const shouldShake = showFeedback && shakeIndex === i && isSelected && !isCorrect;

        let stateClass = "border-border bg-card hover:bg-muted/50";
        if (showFeedback && isSelected) {
          stateClass = isCorrect
            ? "border-success bg-success/15 ring-2 ring-success/60"
            : "border-destructive bg-destructive/10 ring-2 ring-destructive/60";
        } else if (showFeedback && isCorrect) {
          stateClass = "border-success bg-success/10";
        } else if (isSelected) {
          stateClass = "border-cta bg-cta/10 ring-2 ring-cta/60 shadow-duo";
        }

        return (
          <button
            key={i}
            type="button"
            disabled={showFeedback}
            onClick={() => onSelect(i)}
            aria-label={`Pilihan ${i + 1}: ${choice.text}`}
            aria-pressed={isSelected}
            className={cn(
              "tile-duo flex min-h-11 w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
              stateClass,
              showFeedback && "cursor-default",
              shouldShake && "animate-shake",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                showFeedback && isSelected
                  ? isCorrect
                    ? "border-success bg-success text-primary-foreground"
                    : "border-destructive bg-destructive text-primary-foreground"
                  : isSelected
                    ? "border-cta bg-cta text-primary-foreground"
                    : "border-border text-muted-foreground",
              )}
            >
              {String.fromCodePoint(65 + i)}
            </span>
            <span className="flex-1 text-sm">{choice.text}</span>
          </button>
        );
      })}
    </div>
  );
}
