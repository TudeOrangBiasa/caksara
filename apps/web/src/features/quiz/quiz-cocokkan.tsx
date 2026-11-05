import { Check, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";
import { playCue } from "../../lib/sound";
import type { MatchPair } from "../../lib/zod/question";

interface CocokkanProps {
  pairs: MatchPair[];
  /** Dipanggil tepat sekali per soal: saat SEMUA pasangan terpasang (benar semua),
   *  atau saat ADA pasangan salah (dinilai gagal). Satu pasangan benar TIDAK memanggil ini. */
  onAnswer: (matches: Record<string, string>) => void;
  disabled?: boolean;
}

export function Cocokkan({ pairs, onAnswer, disabled }: CocokkanProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  /** Pasangan yang sudah terkunci benar ({kiri: kanan}). Soal tetap jalan sampai semua terkunci. */
  const [matched, setMatched] = useState<Record<string, string>>({});

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

  const matchedRightTaken: Record<string, true> = {};
  for (const right of Object.values(matched)) matchedRightTaken[right] = true;
  const doneCount = Object.keys(matched).length;

  function handleRight(right: string) {
    const pair = pairs.find((p) => p.left === selectedLeft);
    if (!pair || disabled) return;
    if (matched[pair.left] !== undefined) return;
    if (right === pair.right) {
      const next = { ...matched, [pair.left]: right };
      if (Object.keys(next).length === pairs.length) {
        onAnswer(next);
      } else {
        setMatched(next);
        playCue("press");
      }
    } else {
      // Satu pasangan salah → soal dinilai gagal (tidak lanjut ke pasangan berikut).
      onAnswer({ ...matched, [pair.left]: right });
      setSelectedLeft(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <p
        className="col-span-2 text-xs font-medium text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {doneCount} dari {pairs.length} pasangan cocok
      </p>
      <div className="flex flex-col gap-2" aria-label="Kolom aksara">
        {pairs.map((p) => {
          const locked = matched[p.left] !== undefined;
          return (
            <button
              key={p.left}
              type="button"
              disabled={disabled || locked}
              onClick={() => setSelectedLeft(p.left)}
              className={cn(
                "tile-duo font-balinese w-full rounded-2xl border-2 p-3 text-base font-bold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
                locked
                  ? "border-success/60 bg-success/10 text-success opacity-70"
                  : selectedLeft === p.left
                    ? "border-cta bg-cta/10 ring-2 ring-cta/60 shadow-duo"
                    : "border-border bg-card hover:bg-muted/50",
              )}
              aria-pressed={selectedLeft === p.left}
              aria-label={`Aksara ${p.left}${locked ? " (sudah cocok)" : ""}`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {locked && <Check className="size-4 shrink-0 text-success" aria-hidden />}
                {p.left}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2" aria-label="Kolom arti">
        {rightsShuffled.map((right, i) => {
          const taken = matchedRightTaken[right] === true;
          return (
            <button
              key={`${right}-${i}`}
              type="button"
              disabled={disabled || selectedLeft === null || taken}
              onClick={() => handleRight(right)}
              className={cn(
                "tile-duo w-full rounded-2xl border-2 border-border bg-card p-3 text-sm transition-all duration-150 ease-out hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
                selectedLeft === null || taken ? "opacity-60" : "opacity-100",
              )}
              aria-label={`Arti ${right}${taken ? " (sudah terpasang)" : ""}`}
            >
              {right}
            </button>
          );
        })}
      </div>
      {selectedLeft && (
        <div className="col-span-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full font-bold"
            onClick={() => setSelectedLeft(null)}
            disabled={disabled}
          >
            <X className="size-4" /> Batalkan pilihan
          </Button>
        </div>
      )}
    </div>
  );
}
