import { cn } from "@caksara/ui/lib/utils";
import type { BedawangAccessory, BedawangHead, BedawangShell } from "../lib/zod/profile";

export type BedawangMood = "senang" | "semangat" | "sedih";

export interface BedawangProps {
  mood?: BedawangMood;
  className?: string;
  interactive?: boolean;
  blink?: boolean;
  animate?: boolean;
  shell?: BedawangShell;
  head?: BedawangHead;
  acc?: BedawangAccessory;
  // allow onClick if interactive is true
  onClick?: () => void;
}

export function Bedawang({ className, animate, interactive, onClick }: BedawangProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      onClick={interactive ? onClick : undefined}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      <img
        src="/assets/new-hero-mascot.jpg"
        alt="Maskot Caksara"
        className={cn("h-full w-full object-cover", animate && "animate-pulse")}
      />
    </div>
  );
}
