import { Button } from "@caksara/ui/components/button";

import { Bedawang } from "../../components/bedawang";

import type { QuizResume } from "./quiz-resume";

interface ResumeDialogProps {
  resume: QuizResume;
  total: number;
  onResume: () => void;
  onRestart: () => void;
}

export function ResumeDialog({ resume, total, onResume, onRestart }: ResumeDialogProps) {
  const tanggal = new Date(resume.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  const done = Math.min(resume.currentIndex, total);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lanjutkan kuis"
      className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-6 py-8 text-center md:max-w-xl lg:max-w-[480px]"
    >
      {/* Pencil A8B2n: ikon 128, judul 28/800, progres 400, tombol vertikal CTA+secondary. */}
      <Bedawang mood="senang" className="size-20 lg:size-32" />
      <h1 className="mt-4 text-[28px] font-extrabold tracking-tight lg:mt-6 lg:leading-[34px]">
        Lanjutkan kuis?
      </h1>
      <p className="mt-1 text-sm text-muted-foreground lg:text-xs">
        Terakhir sampai soal ke-{resume.currentIndex + 1} dari {total} ({tanggal}).
      </p>
      <div
        role="progressbar"
        aria-label={`Progres kuis ${done} dari ${total}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="mt-5 flex w-full max-w-xs gap-2 lg:mt-4 lg:max-w-[400px] lg:pt-2"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              i < done ? "h-3 flex-1 rounded-full bg-cta" : "h-3 flex-1 rounded-full bg-muted"
            }
          />
        ))}
      </div>
      <div className="mt-6 flex w-full max-w-xs gap-3 lg:mt-0 lg:max-w-[400px] lg:flex-col lg:gap-3 lg:pt-6">
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-pill border-2 border-b-4 lg:h-[50px] lg:flex-none lg:rounded-2xl lg:text-[15px] lg:font-bold lg:uppercase lg:text-muted-foreground"
          onClick={onRestart}
        >
          Mulai ulang
        </Button>
        <Button
          variant="cta"
          className="h-12 flex-1 text-base font-bold lg:order-first lg:h-[51px] lg:flex-none"
          onClick={onResume}
        >
          Lanjut dari soal ke-{resume.currentIndex + 1}
        </Button>
      </div>
    </div>
  );
}
