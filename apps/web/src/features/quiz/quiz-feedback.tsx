import { AlertCircle, BookOpenCheck, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";
import { Bedawang } from "../../components/bedawang";
import { XP_PER_CORRECT } from "../../lib/game-rules";
import { useOnlineStatus } from "../../lib/use-online-status";
import type { RagCitation } from "../../lib/zod/rag";
import { XpTick } from "./xp-tick";
import { describeUserChoice, fetchQuizExplain } from "./quiz-explain";
import type { QuizAnswer } from "./quiz-store";
interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation?: string;
  /** sourceRef mentah soal ("kb_x · Basis Pengetahuan") — tautan balik kecil opsional. */
  sourceRef?: string;
  aksaraId?: string;
  /** Konteks tombol "Kenapa?" #95: prompt + jawaban salah murid. */
  prompt?: string;
  answer?: QuizAnswer;
  choices?: { text: string }[];
  onOpenKbEntry?: (entryId: string) => void;
  onNext: () => void;
  isLast: boolean;
}
export function QuizFeedback({
  isCorrect,
  explanation,
  sourceRef,
  aksaraId,
  prompt,
  answer,
  choices,
  onOpenKbEntry,
  onNext,
  isLast,
}: QuizFeedbackProps) {
  const online = useOnlineStatus();
  const [kenapa, setKenapa] = useState<null | { text: string; citations: RagCitation[] }>(null);
  const [kenapaBusy, setKenapaBusy] = useState(false);
  const showKenapa =
    !isCorrect && online && !!prompt && !kenapaBusy && kenapa === null && explanation !== undefined;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "sticky bottom-0 mt-4 rounded-3xl border-2 border-transparent p-4 shadow-md lg:mt-6 lg:rounded-2xl lg:p-4 lg:shadow-none",
        isCorrect ? "animate-card-pop bg-success/15" : "animate-shake bg-destructive/10",
      )}
    >
      <div className="flex items-start gap-3 lg:items-center lg:gap-3">
        <Bedawang mood={isCorrect ? "senang" : "sedih"} className="size-14 shrink-0 lg:size-12" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 lg:gap-2">
            <p
              className={cn(
                "flex items-center gap-1.5 text-lg font-extrabold lg:gap-2 lg:text-xl lg:font-bold",
                isCorrect ? "text-cta" : "text-destructive",
              )}
            >
              {isCorrect ? (
                <CheckCircle2 className="size-5 shrink-0 lg:size-6" aria-hidden />
              ) : (
                <AlertCircle className="size-5 shrink-0 lg:size-6" aria-hidden />
              )}
              {isCorrect ? "Bener banget!" : "Belum tepat — baca dulu ya"}
            </p>
            {isCorrect && (
              <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-xs font-bold text-accent-foreground shadow-sm ring-1 ring-border/60 lg:gap-1 lg:px-2 lg:py-0.5 lg:text-xs lg:shadow-none dark:text-accent">
                <Sparkles className="size-3" aria-hidden /> <XpTick from={0} to={XP_PER_CORRECT} />
              </span>
            )}
          </div>
          {explanation && <p className="mt-1 text-sm text-foreground/80">{explanation}</p>}
          {showKenapa && (
            <button
              type="button"
              onClick={() => {
                if (!prompt) return;
                setKenapaBusy(true);
                void fetchQuizExplain({
                  prompt,
                  userChoice: describeUserChoice({ ...answer, choices }),
                  sourceRef,
                  aksaraId,
                }).then((out) => {
                  setKenapaBusy(false);
                  if (out) setKenapa(out);
                });
              }}
              className="mt-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
            >
              Kenapa?
            </button>
          )}
          {kenapaBusy && (
            <p className="mt-2 text-xs text-foreground/80" role="status">
              Bedawang mikir…
            </p>
          )}
          {kenapa && (
            <div className="mt-2 rounded-2xl bg-muted/60 px-2.5 py-2">
              <p className="text-sm leading-relaxed">{kenapa.text}</p>
              {kenapa.citations.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Sumber rujukan">
                  {kenapa.citations.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      {c.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {sourceRef && (
            <p className="mt-1 text-[11px] text-foreground/80">
              Sumber: {sourceRef}
              {onOpenKbEntry && (
                <button
                  type="button"
                  onClick={() => onOpenKbEntry(sourceRef.split("·")[0]?.trim() ?? sourceRef)}
                  className="ml-1 text-[11px] font-bold text-primary underline-offset-2 hover:underline"
                >
                  Buka di Basis Pengetahuan →
                </button>
              )}
            </p>
          )}
          {!isCorrect && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border/60">
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
        className="mt-3 h-12 w-full text-base font-bold tracking-wide lg:mt-3 lg:h-[47px] lg:text-base"
      >
        {isLast ? "Lihat Hasil" : "Lanjut"}
      </Button>
    </div>
  );
}
