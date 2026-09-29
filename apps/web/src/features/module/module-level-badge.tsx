import { getAdaptiveLevel } from "../quiz/quiz-data";

/** Badge level adaptif per Modul (#33 V11a) — KB Entry level target sesi berikut. */
export function ModuleLevelBadge({ moduleId }: { moduleId: string }) {
  const level = getAdaptiveLevel(moduleId);
  return (
    <p
      role="status"
      aria-label={`Level adaptif modul: Level ${level}`}
      className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm font-bold shadow-sm"
    >
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        {level}
      </span>
      Level {level} · Sesi berikut menyesuaikan hasilmu
    </p>
  );
}
