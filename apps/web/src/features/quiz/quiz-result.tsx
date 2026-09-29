import { useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";
import { Bedawang } from "../../components/bedawang";
import { AnimatedNumber } from "../../components/animated-number";
import { Confetti } from "../../components/confetti";
import { playCue, playFanfare } from "../../lib/sound";
import { XP_PER_CORRECT } from "../../lib/game-rules";
import type { CourseModule } from "../module/module-data";

interface QuizResultProps {
  mod: CourseModule;
  score: { correct: number; total: number };
  /** Level adaptif setelah sesi direkam (#33 V11a); absen untuk Latihan. */
  level?: number;
  isLatihan?: boolean;
  tidbit?: string;
  onRetry: () => void;
  onBack: () => void;
}
export function QuizResult({
  mod,
  score,
  level,
  isLatihan,
  tidbit,
  onRetry,
  onBack,
}: QuizResultProps) {
  const percentage = Math.round((score.correct / score.total) * 100);
  const passed = percentage >= 70;
  const xpGained = score.correct * XP_PER_CORRECT;
  const R = 54;
  const C = 2 * Math.PI * R;
  const dashOffset = C * (1 - percentage / 100);

  useEffect(() => {
    if (passed) playFanfare();
    else playCue("error");
  }, [passed]);

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center px-4 md:max-w-xl py-8">
      <Confetti active={passed} />
      <Bedawang
        mood={passed ? "semangat" : "sedih"}
        className={cn("size-20", !passed && "grayscale-[35%]")}
      />
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Hasil Kuis
      </p>
      {level !== undefined && (
        <p
          role="status"
          aria-label={`Level sesi berikut: Level ${level}`}
          className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
        >
          Level {level} · Sesi berikut menyesuaikan hasilmu
        </p>
      )}

      <div className="relative mt-6">
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          role="img"
          aria-label={`${percentage}% benar`}
        >
          <circle cx="70" cy="70" r={R} fill="none" strokeWidth="12" className="stroke-muted" />
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 70 70)"
            className={cn(
              "transition-[stroke-dashoffset] duration-[1200ms] ease-out",
              passed ? "stroke-primary" : "stroke-muted-foreground",
            )}
            style={{ "--tw-stroke-dashoffset-from": String(C) } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">
            <AnimatedNumber value={score.correct} />
            {score.total > 0 ? `/${score.total}` : ""}
          </p>
          <p className="text-[11px] text-muted-foreground">{percentage}% benar</p>
        </div>
      </div>

      {passed && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent-foreground dark:text-accent animate-card-pop">
          <Sparkles className="size-4" /> +<AnimatedNumber value={xpGained} /> XP
        </div>
      )}

      {passed && !isLatihan && (
        <div className="mt-5 w-full rounded-3xl bg-card p-5 text-left shadow-sm">
          <span className="font-balinese text-xl leading-none text-primary">ᬲᬧᬢ</span>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Seru! Kamu berhasil menuntaskan {mod.title}. Pelan-pelan aja, tanpa terasa aksara &amp;
            budaya Bali makin kamu kuasai.
          </p>
          {tidbit && (
            <p className="mt-3 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">Tahukah kamu? </span>
              {tidbit}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto flex w-full gap-2 border-t-2 border-border pt-6">
        {passed ? (
          <>
            <Button variant="outline" className="h-12 flex-1 rounded-full" onClick={onRetry}>
              <RotateCcw className="size-4 mr-1.5" />
              Ulangi
            </Button>
            <Button
              variant="cta"
              className="h-12 flex-1 gap-2 text-base font-bold tracking-wide"
              onClick={onBack}
            >
              Kembali
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="h-12 flex-1 rounded-full" onClick={onBack}>
              Kembali
            </Button>
            <Button
              variant="cta"
              className="h-12 flex-1 gap-2 text-base font-bold tracking-wide"
              onClick={onRetry}
            >
              <RotateCcw className="size-4" />
              Coba Lagi
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
