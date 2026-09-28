import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";
import type { MatchPair } from "../../lib/zod/question";

interface CocokkanProps {
  pairs: MatchPair[];
  onAnswer: (left: string, right: string) => void;
  disabled?: boolean;
}

export function Cocokkan({ pairs, onAnswer, disabled }: CocokkanProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const [rightsShuffled] = useState(() => {
    const a = pairs.map((p) => p.right);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i] as string;
      a[i] = a[j] as string;
      a[j] = t;
    }
    return a;
  });

  function handleRight(right: string) {
    const pair = pairs.find((p) => p.left === selectedLeft);
    if (!pair || disabled) return;
    onAnswer(pair.left, right);
    setSelectedLeft(null);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2" aria-label="Kolom aksara">
        {pairs.map((p) => (
          <button
            key={p.left}
            type="button"
            disabled={disabled}
            onClick={() => setSelectedLeft(p.left)}
            className={cn(
              "tile-duo font-balinese w-full rounded-xl border-2 p-3 text-2xl transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
              selectedLeft === p.left
                ? "border-cta bg-cta/10 ring-2 ring-cta/60 shadow-duo"
                : "border-border bg-card hover:bg-muted/50",
            )}
            aria-pressed={selectedLeft === p.left}
            aria-label={`Aksara ${p.left}`}
          >
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-2" aria-label="Kolom arti">
        {rightsShuffled.map((right, i) => (
          <button
            key={`${right}-${i}`}
            type="button"
            disabled={disabled || selectedLeft === null}
            onClick={() => handleRight(right)}
            className={cn(
              "tile-duo w-full rounded-xl border-2 border-border bg-card p-3 text-sm transition-all duration-150 ease-out hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
              // Crossfade: kolom kanan menegaskan status tunggu vs siap dipasangkan.
              selectedLeft === null ? "opacity-60" : "opacity-100",
            )}
            aria-label={`Arti ${right}`}
          >
            {right}
          </button>
        ))}
      </div>
      {selectedLeft && (
        <div className="col-span-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setSelectedLeft(null)}
            disabled={disabled}
          >
            <Check className="size-4" /> Urutkan, pilih pasangan yang cocok
          </Button>
        </div>
      )}
    </div>
  );
}
