import { cn } from "@caksara/ui/lib/utils";

import type { Question } from "../../lib/zod/question";

interface QuizChoiceProps {
  question: Question;
  selectedIndex: number | null;
  showFeedback: boolean;
  onSelect: (index: number) => void;
}

export function QuizChoice({ question, selectedIndex, showFeedback, onSelect }: QuizChoiceProps) {
  return (
    <div className="grid gap-2">
      {question.choices?.map((choice, i) => {
        const isSelected = selectedIndex === i;
        const isCorrect = choice.isCorrect;

        let stateClass = "border-border bg-card hover:bg-muted/50";
        if (showFeedback && isSelected) {
          stateClass = isCorrect
            ? "border-success bg-success/10"
            : "border-destructive bg-destructive/10";
        } else if (showFeedback && isCorrect) {
          stateClass = "border-success bg-success/5";
        }

        return (
          <button
            key={i}
            type="button"
            disabled={showFeedback}
            onClick={() => onSelect(i)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
              stateClass,
              showFeedback && "cursor-default",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                showFeedback && isSelected
                  ? isCorrect
                    ? "border-success bg-success text-white"
                    : "border-destructive bg-destructive text-white"
                  : "border-border",
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
