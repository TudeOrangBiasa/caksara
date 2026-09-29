import { cn } from "@caksara/ui/lib/utils";

/** Badge level adaptif Sesi Kuis (#33 V11a) — token SSOT, tanpa hex literal. */
export function SessionLevelBadge({ level }: { level?: number }) {
  const valid = level === 1 || level === 2 || level === 3;
  return (
    <span
      role="status"
      aria-label={valid ? `Level ${level}` : "Level sesi"}
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
        level === 1 && "bg-primary/10 text-primary",
        level === 2 && "bg-accent/15 text-accent",
        level === 3 && "bg-secondary text-secondary-foreground",
        !valid && "bg-muted text-muted-foreground",
      )}
    >
      {valid ? `Level ${level}` : "Level –"}
    </span>
  );
}
