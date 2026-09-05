import type { ReactNode } from "react";

import { cn } from "@caksara/ui/lib/utils";

/**
 * State sistem: ilustrasi + judul + deskripsi + CTA primer.
 * Dipakai untuk empty, no-results, 404, offline — bukan div custom per halaman.
 */
export function EmptyState({
  illustration,
  title,
  body,
  action,
  tone = "default",
  className,
}: {
  illustration: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  tone?: "default" | "danger";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-sm flex-col items-center px-6 py-10 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-3xl",
          tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-card text-primary",
        )}
      >
        {illustration}
      </span>
      <h2 className="mt-4 text-base font-bold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-[36ch] text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5 w-full">{action}</div>}
    </div>
  );
}
