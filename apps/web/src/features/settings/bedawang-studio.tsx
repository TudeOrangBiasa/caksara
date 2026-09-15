import { useState } from "react";
import type { CSSProperties } from "react";

import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import type {
  BedawangAccessory,
  BedawangConfig,
  BedawangHead,
  BedawangMood,
  BedawangShell,
} from "../../lib/zod/profile";
import { DEFAULT_BEDAWANG } from "../../lib/zod/profile";
import { setAvatar } from "../../lib/profile-store";

const SHELLS: { id: BedawangShell; label: string; style: CSSProperties }[] = [
  { id: "asli", label: "Asli", style: { backgroundColor: "var(--bedawang-shell)" } },
  { id: "terakota", label: "Terakota", style: { backgroundColor: "var(--primary)" } },
  { id: "emas", label: "Emas", style: { backgroundColor: "var(--accent)" } },
  { id: "daun", label: "Daun", style: { backgroundColor: "var(--success)" } },
];

const HEADS: { id: BedawangHead; label: string; style: CSSProperties }[] = [
  { id: "asli", label: "Asli", style: { backgroundColor: "var(--bedawang-head)" } },
  { id: "krim", label: "Krim", style: { backgroundColor: "var(--card-cream)" } },
  { id: "belly", label: "Pasir", style: { backgroundColor: "var(--bedawang-belly)" } },
];

const ACCESSORIES: { id: BedawangAccessory; label: string }[] = [
  { id: "none", label: "Polos" },
  { id: "bunga", label: "Bunga" },
  { id: "udeng", label: "Udeng" },
  { id: "kacamata", label: "Kacamata" },
];

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
                "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition-transform active:scale-95",
                renderSwatch ? "text-transparent" : "bg-muted text-muted-foreground",
                active && "ring-2 ring-foreground ring-offset-2 ring-offset-card",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Studio mini: utak-atik Bedawang lalu simpan jadi avatar. */
export function BedawangStudio({ current }: { current: BedawangConfig | null }) {
  const [draft, setDraft] = useState<BedawangConfig>(current ?? DEFAULT_BEDAWANG);
  const [justSaved, setJustSaved] = useState(false);
  const isActive = current !== null && JSON.stringify(current) === JSON.stringify(draft);

  function pick<K extends keyof BedawangConfig>(key: K, val: BedawangConfig[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
    setJustSaved(false);
  }

  function handleSave() {
    setAvatar({ kind: "bedawang", value: draft });
    setJustSaved(true);
  }

  return (
    <div className="mt-4 rounded-3xl bg-card p-5">
      <div className="flex items-center gap-4">
        <Bedawang
          shell={draft.shell}
          head={draft.head}
          acc={draft.accessory}
          mood={draft.mood}
          interactive
          blink
          className="size-24 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">Studio Bedawang</p>
          <p className="text-xs text-muted-foreground">
            Ketuk Bedawang untuk reaksi. Atur warna, hiasan, dan mood sesukamu.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <OptionRow
          label="Warna cangkang"
          options={SHELLS}
          value={draft.shell}
          onPick={(id) => pick("shell", id)}
          renderSwatch={(id) => SHELLS.find((s) => s.id === id)?.style}
        />
        <OptionRow
          label="Warna kepala"
          options={HEADS}
          value={draft.head}
          onPick={(id) => pick("head", id)}
          renderSwatch={(id) => HEADS.find((h) => h.id === id)?.style}
        />
        <OptionRow
          label="Hiasan"
          options={ACCESSORIES}
          value={draft.accessory}
          onPick={(id) => pick("accessory", id)}
        />
        <OptionRow
          label="Mood"
          options={MOODS}
          value={draft.mood}
          onPick={(id) => pick("mood", id)}
        />
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
