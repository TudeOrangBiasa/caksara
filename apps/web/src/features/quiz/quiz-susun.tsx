import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@caksara/ui/components/button";

interface SusunAksaraProps {
  tiles: string[];
  onAnswer: (ordered: string[]) => void;
  disabled?: boolean;
}

export function SusunAksara({ tiles, onAnswer, disabled }: SusunAksaraProps) {
  const [pool, setPool] = useStatePool(tiles);
  const [draft, setDraft] = useStateDraft();

  function take(index: number) {
    const tile = pool[index];
    if (tile === undefined) return;
    setPool((p) => p.filter((_, i) => i !== index));
    setDraft((d) => [...d, tile]);
  }

  function undo() {
    setDraft((d) => {
      if (d.length === 0) return d;
      const last = d[d.length - 1];
      setPool((p) => [...p, last]);
      return d.slice(0, -1);
    });
  }

  // Debt: drag-and-drop sesungguhnya belum ada — tap-to-place ini jalur
  // utama (tap usable, aria jelas). Jangan implementasi drag di sini.
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex min-h-24 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-3"
        role="status"
        aria-live="polite"
        aria-label="Susunan jawaban sementara"
      >
        {draft.length === 0 ? (
          <p className="text-center text-sm font-medium text-muted-foreground">
            Susun aksara sesuai urutan yang benar
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {draft.map((tile, i) => (
              <span
                key={`${tile}-${i}`}
                className="font-balinese rounded-xl border-2 border-primary bg-primary px-3 py-2 text-2xl text-primary-foreground shadow-sm"
              >
                {tile}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Pilihan ubin aksara"
      >
        {pool.map((tile, i) => (
          <button
            key={`${tile}-${i}`}
            type="button"
            disabled={disabled}
            onClick={() => take(i)}
            aria-label={`Pilih ubin ${tile}`}
            className="tile-duo font-balinese rounded-2xl border-2 border-border bg-card px-4 py-2.5 text-2xl transition-all duration-150 ease-out hover:border-cta/60 hover:bg-muted/50 focus-visible:border-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {tile}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={undo}
          disabled={disabled || draft.length === 0}
          className="h-11 rounded-full px-5 font-bold"
        >
          <ArrowLeft className="size-4" /> Batal
        </Button>
        <Button
          type="button"
          variant="cta"
          onClick={() => onAnswer(draft)}
          disabled={disabled || draft.length !== tiles.length}
          className="h-11 px-6 text-sm font-bold tracking-wide"
        >
          <Check className="size-4" /> Cek
        </Button>
      </div>
    </div>
  );
}

function useStatePool(initial: string[]) {
  const [pool, setPool] = useState<string[]>(() => shuffle(initial));
  return [pool, setPool] as const;
}
function useStateDraft() {
  const [draft, setDraft] = useState<string[]>([]);
  return [draft, setDraft] as const;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
