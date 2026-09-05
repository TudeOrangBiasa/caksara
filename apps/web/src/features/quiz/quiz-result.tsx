import { useEffect } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { Confetti } from "../../components/confetti";
import { playCue } from "../../lib/sound";
import type { CourseModule } from "../module/module-data";

const XP_PER_CORRECT = 10;

interface QuizResultProps {
  mod: CourseModule;
  score: { correct: number; total: number };
  isLatihan?: boolean;
  onRetry: () => void;
  onBack: () => void;
}

export function QuizResult({ mod, score, isLatihan, onRetry, onBack }: QuizResultProps) {
  const percentage = Math.round((score.correct / score.total) * 100);
  const passed = percentage >= 70;
  const xpGained = score.correct * XP_PER_CORRECT;
  const R = 54;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    playCue(passed ? "success" : "error");
  }, [passed]);

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center px-4 md:max-w-xl py-8">
      <Confetti active={passed} />
      <Bedawang
        mood={passed ? "semangat" : "sedih"}
        className={cn("size-20", !passed && "grayscale-[35%]")}
      />
      <h1 className="mt-3 text-center text-2xl font-bold tracking-tight">
        {isLatihan
          ? passed
            ? "Mantap, latihan beres!"
            : "Belum lulus, semangat ya"
          : passed
            ? "Mantap, modul beres!"
            : "Belum lulus, semangat ya"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{mod.title}</p>

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
            strokeDashoffset={C * (1 - percentage / 100)}
            transform="rotate(-90 70 70)"
            className={passed ? "stroke-primary" : "stroke-muted-foreground"}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold tabular-nums">
            {score.correct}/{score.total}
          </p>
          <p className="text-[11px] text-muted-foreground">{percentage}% benar</p>
        </div>
      </div>

      {passed && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent animate-[confetti-fall_1.4s_ease-out_forwards]">
          <Sparkles className="size-4" /> +{xpGained} XP
        </div>
      )}

      {passed && !isLatihan && (
        <div className="mt-5 w-full rounded-3xl bg-card p-5 text-left">
          <span className="font-balinese text-xl leading-none text-primary">ᬲᬧᬢ</span>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Seru! Kamu berhasil menuntaskan {mod.title}. Pelan-pelan aja, tanpa terasa aksara &amp;
            budaya Bali makin kamu kuasai.
          </p>
        </div>
      )}

      <div className="mt-auto flex w-full gap-2 pt-6">
        <Button variant="outline" className="h-12 flex-1 rounded-full" onClick={onBack}>
          Kembali
        </Button>
        <Button
          className="h-12 flex-1 gap-2 rounded-full text-base font-semibold"
          onClick={onRetry}
        >
          <RotateCcw className="size-4" />
          Ulangi
        </Button>
      </div>
    </div>
  );
}
