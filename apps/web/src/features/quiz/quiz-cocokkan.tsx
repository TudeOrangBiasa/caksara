import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";
import { playCue } from "../../lib/sound";
import type { MatchPair } from "../../lib/zod/question";

interface CocokkanProps {
  pairs: MatchPair[];
  /** Dipanggil tepat sekali per soal: saat SEMUA pasangan terkunci (lengkap).
   *  Jawaban membawa { matches, cocokkanSalah }: cocokkanSalah > 0 → soal dinilai
   *  gagal (hati berkurang 1 saat submit akhir), tapi user tetap bisa selesaikan sisa pasangan. */
  onAnswer: (answer: { matches: Record<string, string>; cocokkanSalah: number }) => void;
  disabled?: boolean;
}

export function Cocokkan({ pairs, onAnswer, disabled }: CocokkanProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  /** Pasangan yang sudah terkunci benar ({kiri: kanan}). Soal tetap jalan sampai semua terkunci. */
  const [matched, setMatched] = useState<Record<string, string>>({});
  /** Jumlah klik pasangan salah; diteruskan ke onAnswer agar shell mengurangi 1 hati saat submit akhir. */
  const [salah, setSalah] = useState(0);
  /** Tanda salah sementara: "kiri→kanan", hilang otomatis setelah cue. */
  const [salahCue, setSalahCue] = useState<string | null>(null);

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
        onAnswer({ matches: next, cocokkanSalah: salah });
      } else {
        setMatched(next);
        setSelectedLeft(null);
        playCue("press");
      }
    } else {
      // Pasangan salah: error cue + tanda salah sementara, soal tetap jalan;
      // hati dikurangi shell SEKALI saat submit akhir (bukan di sini).
      setSalah((n) => n + 1);
      const key = `${pair.left}→${right}`;
      setSalahCue(key);
      playCue("error");
      window.setTimeout(() => {
        setSalahCue((cur) => (cur === key ? null : cur));
      }, 900);
      setSelectedLeft(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <p className="col-span-2 text-xs text-muted-foreground" role="status" aria-live="polite">
        {doneCount} dari {pairs.length} pasangan cocok
      </p>
      {salahCue !== null && (
        <p className="col-span-2 text-xs font-semibold text-destructive" role="alert">
          Belum cocok — coba lagi.
        </p>
      )}
      <div className="space-y-2" aria-label="Kolom aksara">
        {pairs.map((p) => {
          const locked = matched[p.left] !== undefined;
          const label = p.leftLabel ?? p.left;
          const wrongFlash = salahCue !== null && salahCue.startsWith(`${p.left}→`);
          return (
            <button
              key={p.left}
              type="button"
              disabled={disabled || locked}
              onClick={() => setSelectedLeft(p.left)}
              className={cn(
                "tile-duo font-balinese w-full rounded-xl border-2 p-3 text-2xl transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
                locked
                  ? "border-cta/60 bg-cta/10 opacity-60"
                  : wrongFlash
                    ? "border-destructive bg-destructive/10 ring-2 ring-destructive/50"
                    : selectedLeft === p.left
                      ? "border-cta bg-cta/10 ring-2 ring-cta/60 shadow-duo"
                      : "border-border bg-card hover:bg-muted/50",
              )}
              aria-pressed={selectedLeft === p.left}
              aria-label={`Aksara ${label}${locked ? " (sudah cocok)" : ""}${wrongFlash ? " (belum cocok, coba lagi)" : ""}`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {locked && <Check className="size-4 shrink-0 text-cta" aria-hidden />}
                {p.left}
              </span>
            </button>
          );
        })}
      </div>
      <div className="space-y-2" aria-label="Kolom arti">
        {rightsShuffled.map((right, i) => {
          const taken = matchedRightTaken[right] === true;
          return (
            <button
              key={`${right}-${i}`}
              type="button"
              disabled={disabled || selectedLeft === null || taken}
              onClick={() => handleRight(right)}
              className={cn(
                "tile-duo w-full rounded-xl border-2 border-border bg-card p-3 text-sm transition-all duration-150 ease-out hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
                // Crossfade: kolom kanan menegaskan status tunggu vs siap dipasangkan.
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
