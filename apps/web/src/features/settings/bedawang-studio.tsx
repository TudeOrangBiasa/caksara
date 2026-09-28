import { useState } from "react";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";

import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import type { BedawangConfig, BedawangMood } from "../../lib/zod/profile";
import { DEFAULT_BEDAWANG } from "../../lib/zod/profile";
import { setAvatar } from "../../lib/profile-store";

const MOODS: { id: BedawangMood; label: string }[] = [
  { id: "senang", label: "Senang" },
  { id: "semangat", label: "Semangat" },
  { id: "sedih", label: "Sedih" },
];

function OptionRow<T extends string>({
  label,
  options,
  value,
  onPick,
  renderSwatch,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onPick: (id: T) => void;
  renderSwatch?: (id: T) => CSSProperties | undefined;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={o.label}
              onClick={() => onPick(o.id)}
              style={renderSwatch?.(o.id)}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95",
                renderSwatch ? "text-transparent" : "bg-muted text-muted-foreground",
                active &&
                  "bg-cta/10 text-foreground ring-2 ring-cta ring-offset-2 ring-offset-card",
              )}
              aria-label={active ? `${o.label}, terpilih` : o.label}
            >
              {o.label}
              {active && <Check className="size-3.5" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Studio mini: pilih mood Bedawang lalu simpan jadi avatar. */
export function BedawangStudio({ current }: { current: BedawangConfig | null }) {
  const [draft, setDraft] = useState<BedawangConfig>(current ?? DEFAULT_BEDAWANG);
  const [justSaved, setJustSaved] = useState(false);
  const isActive = current !== null && current.mood === draft.mood;

  function pickMood(mood: BedawangMood) {
    setDraft({ mood });
    setJustSaved(false);
  }

  function handleSave() {
    setAvatar({ kind: "bedawang", value: draft });
    setJustSaved(true);
  }

  return (
    <div className="mt-4 rounded-3xl bg-card p-5">
      <div className="flex items-center gap-4">
        <Bedawang mood={draft.mood} interactive className="size-24 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">Studio Bedawang</p>
          <p className="text-xs text-muted-foreground">
            Ketuk Bedawang untuk reaksi. Pilih mood sesukamu.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <OptionRow label="Mood" options={MOODS} value={draft.mood} onPick={pickMood} />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        {isActive ? "Bedawang ini sedang dipakai" : justSaved ? "Tersimpan!" : "Pakai Bedawang ini"}
      </button>
    </div>
  );
}
