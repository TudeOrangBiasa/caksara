import { cn } from "@caksara/ui/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  tone?: "cta" | "complete";
}

export function Progress({ value, className, tone = "cta" }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, Math.max(0, value))}
      className={cn(
        "h-4 w-full overflow-hidden rounded-full border-2 border-border bg-border",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full shadow-highlight transition-all duration-150 ease-out",
          tone === "complete" ? "bg-accent" : "bg-cta",
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
