import { Construction } from "lucide-react";

export function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Construction className="size-6 text-muted-foreground" />
      </span>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <p className="max-w-[28ch] text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
