import { Sparkles } from "lucide-react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";

const XP_PER_CORRECT = 10;

interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation?: string;
  onNext: () => void;
  isLast: boolean;
}

export function QuizFeedback({ isCorrect, explanation, onNext, isLast }: QuizFeedbackProps) {
  return (
    <div className={cn("mt-4 rounded-3xl p-4", isCorrect ? "bg-success/15" : "bg-destructive/10")}>
      <div className="flex items-start gap-3">
        <Bedawang mood={isCorrect ? "senang" : "sedih"} className="size-12 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={cn("font-bold", isCorrect ? "text-success" : "text-destructive")}>
              {isCorrect ? "Bener banget!" : "Belum tepat"}
            </p>
            {isCorrect && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                <Sparkles className="size-3" /> +{XP_PER_CORRECT} XP
              </span>
            )}
          </div>
          {explanation && <p className="mt-1 text-sm text-muted-foreground">{explanation}</p>}
        </div>
      </div>
      <Button
        onClick={onNext}
        className={cn(
          "mt-3 h-12 w-full rounded-full text-base font-semibold",
          isCorrect
            ? "bg-success text-white hover:bg-success/90"
            : "bg-destructive text-white hover:bg-destructive/90",
        )}
      >
        {isLast ? "Lihat Hasil" : "Lanjut"}
      </Button>
    </div>
  );
}
