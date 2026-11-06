import { HeartCrack, RotateCcw } from "lucide-react";

import { Button } from "@caksara/ui/components/button";

import { Bedawang } from "../../components/bedawang";

interface GameOverProps {
  onRetry: () => void;
  onBack: () => void;
}

export function GameOver({ onRetry, onBack }: GameOverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hati habis, kuis berakhir"
        className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-6 text-center md:max-w-xl"
      >
        <Bedawang mood="sedih" className="size-20 grayscale-[35%]" />
        <p className="mt-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-destructive">
          Hati habis
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Hati kamu habis</h1>
        <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
          Nggak apa-apa, salah itu bagian dari belajar. Hati sudah pulih penuh, yuk coba lagi!
        </p>
        <span className="mt-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 animate-card-pop">
          <HeartCrack className="size-7 text-destructive" aria-hidden />
        </span>
        <div className="mt-6 flex w-full max-w-xs gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-pill border-2 border-b-4"
            onClick={onBack}
          >
            Kembali
          </Button>
          <Button variant="cta" className="h-12 flex-1 text-base font-bold" onClick={onRetry}>
            <RotateCcw className="size-4" aria-hidden /> Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
