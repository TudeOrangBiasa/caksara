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

  return (
    <div className="space-y-4">
      <div className="min-h-20 rounded-lg border border-dashed p-3">
        {draft.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Susun aksara sesuai urutan yang benar
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {draft.map((tile, i) => (
              <span
                key={`${tile}-${i}`}
                className="font-balinese rounded-md bg-primary px-3 py-2 text-2xl text-primary-foreground"
              >
                {tile}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((tile, i) => (
          <button
            key={`${tile}-${i}`}
            type="button"
            disabled={disabled}
            onClick={() => take(i)}
            className="font-balinese rounded-lg border border-border bg-card px-3 py-2 text-2xl transition-colors hover:bg-muted/50"
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
        >
          <ArrowLeft className="size-4" /> Batal
        </Button>
        <Button
          type="button"
          onClick={() => onAnswer(draft)}
          disabled={disabled || draft.length !== tiles.length}
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
