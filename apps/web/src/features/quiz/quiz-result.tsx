import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";
import { Bedawang } from "../../components/bedawang";
import { AnimatedNumber } from "../../components/animated-number";
import { Confetti } from "../../components/confetti";
import { playCue, playFanfare } from "../../lib/sound";
import { usePrefersReducedMotion } from "../../lib/use-prefers-reduced-motion";
import { XP_PER_CORRECT } from "../../lib/game-rules";
import type { CourseModule } from "../module/module-data";

interface QuizResultProps {
  mod: CourseModule;
  score: { correct: number; total: number };
  /** Level adaptif setelah sesi direkam (#33 V11a); absen untuk Latihan. */
  level?: number;
  /** Level sesi yang baru selesai — pembanding deteksi naik (#102). */
  prevLevel?: number;
  isLatihan?: boolean;
  tidbit?: string;
  onRetry: () => void;
  onBack: () => void;
}
export function QuizResult({
  mod,
  score,
  level,
  prevLevel,
  isLatihan,
  tidbit,
  onRetry,
  onBack,
}: QuizResultProps) {
  const percentage = Math.round((score.correct / score.total) * 100);
  const passed = percentage >= 70;
  const reduceMotion = usePrefersReducedMotion();
  const xpGained = score.correct * XP_PER_CORRECT;
  // Pencil Z8nXI/HK0rs: ring solid, hijau lulus dan merah gagal.
  const ringTone = passed ? "bg-cta" : "bg-destructive";
  const scoreTone = passed ? "text-cta" : "text-destructive";

  useEffect(() => {
    if (passed) playFanfare();
    else playCue("error");
    // Naik level adaptif (#96→#102): levelUp setelah fanfare selesai (±600ms),
    // tanpa animasi tambahan — bunyi saja, aman di reduced-motion.
    if (level !== undefined && prevLevel !== undefined && level > prevLevel) {
      const t = window.setTimeout(() => playCue("levelUp"), 700);
      return () => window.clearTimeout(t);
    }
  }, [passed, level, prevLevel]);

  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full max-w-lg flex-col items-center px-4 py-8 md:max-w-xl lg:max-w-[576px] lg:px-0 lg:py-0",
        // Sejajarkan hero dengan Result Col Pencil (Z8nXI y=277, HK0rs y=306);
        // pill V11a menambah tinggi kolom lulus-modul sehingga center tak stabil.
        level !== undefined
          ? "lg:justify-start lg:pt-[277px]"
          : passed
            ? "lg:justify-center"
            : "lg:justify-start lg:pt-[306px]",
      )}
    >
      <Confetti active={passed && !reduceMotion} />
      {/* Pencil Z8nXI/HK0rs: hero 2 kolom di desktop (maskot 200 + teks), 1 kolom di mobile. */}
      <div className="contents lg:flex lg:w-full lg:items-center lg:gap-5">
        <Bedawang
          mood={passed ? "semangat" : "sedih"}
          className={cn(
            "size-20 lg:shrink-0",
            passed ? "lg:size-[200px]" : "lg:size-[188px]",
            !passed && "grayscale-[35%]",
          )}
        />
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col">
          <p className="mt-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-accent-foreground lg:mt-0 lg:text-left lg:leading-none lg:tracking-[1.5px]">
            Hasil Kuis
          </p>
          <h1
            className={cn(
              "mt-1 text-center text-[28px] font-extrabold leading-tight tracking-tight text-foreground md:text-[32px] lg:mt-1 lg:text-left lg:text-[28px] lg:leading-[1.15] lg:tracking-[-0.5px]",
              passed ? "lg:text-cta" : "lg:text-destructive",
            )}
          >
            {isLatihan
              ? passed
                ? "Mantap, latihan beres!"
                : "Belum lulus, semangat ya"
              : passed
                ? "Mantap, modul beres!"
                : "Belum lulus, semangat ya"}
          </h1>
          <p className="mt-1 text-sm font-bold text-muted-foreground lg:text-left lg:text-[15px] lg:leading-[1.4]">
            {mod.title}
          </p>
          {level !== undefined && (
            <p
              role="status"
              aria-label={`Level sesi berikut: Level ${level}`}
              className="mt-2 self-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary lg:hidden"
            >
              Level {level} · Sesi berikut menyesuaikan hasilmu
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-4 lg:mt-0 lg:justify-start lg:pt-4">
            <div
              role="img"
              aria-label={`${percentage}% benar`}
              className={cn(
                "flex size-[120px] items-center justify-center rounded-full p-3",
                ringTone,
              )}
            >
              <div className="flex size-full flex-col items-center justify-center rounded-full bg-card">
                <p className={cn("text-2xl font-extrabold tabular-nums lg:text-[26px]", scoreTone)}>
                  <AnimatedNumber value={score.correct} />
                  {score.total > 0 ? `/${score.total}` : ""}
                </p>
                <p className="text-[11px] text-muted-foreground">{percentage}% benar</p>
              </div>
            </div>
            {passed && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground animate-card-pop">
                + <AnimatedNumber value={xpGained} /> XP
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Pill V11a di desktop: di bawah hero agar hero cocok Pencil (opsi B, Main). */}
      {level !== undefined && (
        <p
          role="status"
          aria-label={`Level sesi berikut: Level ${level}`}
          className="mt-2 hidden rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary lg:mt-1 lg:block"
        >
          Level {level} · Sesi berikut menyesuaikan hasilmu
        </p>
      )}
      {passed && !isLatihan && (
        <div className="mt-5 w-full rounded-2xl border-2 border-b-4 border-border bg-card p-5 text-left lg:mt-4">
          <span className="font-balinese text-xl leading-none text-primary lg:text-base">
            ᬫᬢᬸᬃ ᬲᬸᬓ᭄ᬱ᭄ᬫ
          </span>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:mt-2.5">
            Seru! Kamu berhasil menuntaskan {mod.title}. Pelan-pelan aja, tanpa terasa aksara &amp;
            budaya Bali makin kamu kuasai.
          </p>
          {tidbit && (
            <p className="mt-3 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground lg:mt-2.5 lg:border-t-0 lg:pt-0 lg:text-[13px]">
              <span className="font-bold text-foreground lg:font-normal lg:text-muted-foreground">
                Tahukah kamu?{" "}
              </span>
              {tidbit}
            </p>
          )}
        </div>
      )}
      {!passed && (
        <div className="mt-5 w-full rounded-2xl border-2 border-b-4 border-border bg-card p-5 text-left lg:mt-4">
          <p className="text-sm font-bold text-destructive">Jangan menyerah!</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground lg:mt-2.5">
            Kamu sudah benar {score.correct} dari {score.total}. Ulangi bagian yang sulit dan kamu
            pasti lulus.
          </p>
        </div>
      )}

      <div className="mt-auto flex w-full gap-3 pt-6 lg:mt-0">
        {passed ? (
          <>
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-pill border-2 border-b-4 lg:h-[50px] lg:text-[15px] lg:font-bold lg:text-muted-foreground"
              onClick={onRetry}
            >
              <RotateCcw className="mr-1.5 size-4" />
              Ulangi
            </Button>
            <Button
              variant="cta"
              className="h-12 flex-1 text-base font-bold lg:h-[51px]"
              onClick={onBack}
            >
              Kembali
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-pill border-2 border-b-4 lg:h-[50px] lg:text-[15px] lg:font-bold lg:text-muted-foreground"
              onClick={onBack}
            >
              Kembali
            </Button>
            <Button
              variant="cta"
              className="h-12 flex-1 text-base font-bold lg:h-[51px]"
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
