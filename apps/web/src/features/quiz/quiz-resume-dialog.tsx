import { RotateCcw } from "lucide-react";

import { Button } from "@caksara/ui/components/button";

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
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lanjutkan kuis"
      className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-6 md:max-w-xl text-center"
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-accent/20">
        <RotateCcw className="size-10 text-accent" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Lanjutkan kuis?</h1>
      <p className="mt-2 max-w-[32ch] text-sm text-muted-foreground">
        Terakhir sampai soal ke-{resume.currentIndex + 1} dari {total} ({tanggal}).
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Button
          variant="cta"
          className="h-12 w-full text-base font-bold tracking-wide"
          onClick={onResume}
        >
          Lanjut dari soal ke-{resume.currentIndex + 1}
        </Button>
        <Button variant="outline" className="h-12 w-full" onClick={onRestart}>
          Mulai ulang
        </Button>
      </div>
    </div>
  );
}
