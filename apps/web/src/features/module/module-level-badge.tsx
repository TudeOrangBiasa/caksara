import { getAdaptiveLevel } from "../quiz/quiz-data";

/** Badge level adaptif per Modul (#33 V11a), level target sesi berikut. */
export function ModuleLevelBadge({ moduleId }: { moduleId: string }) {
  const level = getAdaptiveLevel(moduleId);
  return (
    <p
      role="status"
      aria-label={`Level adaptif modul: Level ${level}`}
      className="inline-flex items-center gap-2.5 rounded-2xl bg-muted px-4 py-3 text-[13px] font-bold lg:leading-[14px]"
    >
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
      >
        {level}
      </span>
      Level {level} · Sesi berikut menyesuaikan hasilmu
    </p>
  );
}
