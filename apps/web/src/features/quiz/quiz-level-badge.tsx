import { cn } from "@caksara/ui/lib/utils";

/** Badge level adaptif Sesi Kuis (#33 V11a) — token SSOT, tanpa hex literal. */
export function SessionLevelBadge({ level }: { level?: number }) {
  // Latihan campuran tak punya level adaptif: sembunyikan badge seluruhnya
  // agar tak tampil label fallback "Level –" yang menyesatkan.
  if (level === undefined) return null;
  const valid = level === 1 || level === 2 || level === 3;
  if (!valid) return null;
  return (
    <span
      role="status"
      aria-label={`Level ${level}`}
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium lg:px-2 lg:py-0.5 lg:leading-[18px] lg:font-normal",
        level === 1 && "bg-primary/10 text-primary",
        level === 2 && "bg-accent/15 text-accent-foreground dark:text-accent",
        level === 3 && "bg-secondary text-secondary-foreground",
      )}
    >
      {`Level ${level}`}
    </span>
  );
}
