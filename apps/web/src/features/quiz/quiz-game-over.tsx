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
        className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-6 md:max-w-xl text-center"
      >
        <Bedawang mood="sedih" className="size-24 drop-shadow-md" />
        <span className="mt-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 animate-card-pop">
          <HeartCrack className="size-7 text-destructive" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Hati kamu habis</h1>
        <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
          Nggak apa-apa, salah itu bagian dari belajar. Hati sudah pulih penuh, yuk coba lagi!
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button
            variant="cta"
            className="h-12 w-full gap-2 text-base font-bold tracking-wide"
            onClick={onRetry}
          >
            <RotateCcw className="size-4" aria-hidden /> Coba Lagi
          </Button>
          <Button variant="outline" className="h-12 w-full" onClick={onBack}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
