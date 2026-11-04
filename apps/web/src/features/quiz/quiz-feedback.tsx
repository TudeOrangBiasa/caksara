import { AlertCircle, BookOpenCheck, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";
import { Bedawang } from "../../components/bedawang";
import { XP_PER_CORRECT } from "../../lib/game-rules";
import { XpTick } from "./xp-tick";
interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation?: string;
  /** sourceRef mentah soal ("kb_x · Basis Pengetahuan") — tautan balik kecil opsional. */
  sourceRef?: string;
  onOpenKbEntry?: (entryId: string) => void;
  onNext: () => void;
  isLast: boolean;
}
export function QuizFeedback({
  isCorrect,
  explanation,
  sourceRef,
  onOpenKbEntry,
  onNext,
  isLast,
}: QuizFeedbackProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "sticky bottom-0 mt-4 rounded-3xl p-4",
        isCorrect ? "animate-card-pop bg-success/15" : "animate-shake bg-destructive/10",
      )}
    >
      <div className="flex items-start gap-3">
        <Bedawang mood={isCorrect ? "senang" : "sedih"} className="size-12 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "flex items-center gap-1.5 font-bold",
                isCorrect ? "text-cta" : "text-destructive",
              )}
            >
              {isCorrect ? (
                <CheckCircle2 className="size-5 shrink-0" aria-hidden />
              ) : (
                <AlertCircle className="size-5 shrink-0" aria-hidden />
              )}
              {isCorrect ? "Bener banget!" : "Belum tepat — baca dulu ya"}
            </p>
            {isCorrect && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-foreground dark:text-accent">
                <Sparkles className="size-3" aria-hidden /> <XpTick from={0} to={XP_PER_CORRECT} />
              </span>
            )}
          </div>
          {explanation && <p className="mt-1 text-sm text-muted-foreground">{explanation}</p>}
          {sourceRef && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Sumber: {sourceRef}
              {onOpenKbEntry && (
                <button
                  type="button"
                  onClick={() => onOpenKbEntry(sourceRef.split("·")[0]?.trim() ?? sourceRef)}
                  className="ml-1 font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Buka di Basis Pengetahuan →
                </button>
              )}
            </p>
          )}
          {!isCorrect && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/60">
              <BookOpenCheck className="size-3.5 shrink-0 text-primary" />
              Penjelasan dari Basis Pengetahuan
            </p>
          )}
        </div>
      </div>
      <Button
        variant="cta"
        onClick={onNext}
        aria-label={isLast ? "Lihat hasil" : "Lanjut ke soal berikutnya"}
        className="mt-3 h-12 w-full text-base font-bold tracking-wide"
      >
        {isLast ? "Lihat Hasil" : "Lanjut"}
      </Button>
    </div>
  );
}
