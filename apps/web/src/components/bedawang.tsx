import { cn } from "@caksara/ui/lib/utils";

import type { BedawangMood } from "../lib/zod/profile";

export const BEDAWANG_MOOD_SRC: Record<BedawangMood, string> = {
  senang: "/assets/bedawang-happy.png",
  semangat: "/assets/bedawang-waving.png",
  sedih: "/assets/bedawang-standing.png",
};

// Maskot memakai SATU set aset saja (bedawang-*).

export interface BedawangProps {
  mood?: BedawangMood;
  className?: string;
  interactive?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

const DEFAULT_SRC = "/assets/bedawang-standing.png";

export function Bedawang({
  mood = "senang",
  className,
  animate,
  interactive,
  onClick,
}: BedawangProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      onClick={interactive ? onClick : undefined}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      <img
        src={mood ? BEDAWANG_MOOD_SRC[mood] : DEFAULT_SRC}
        alt="Maskot Bedawang Nala"
        className={cn("h-full w-full object-cover", animate && "animate-pulse")}
      />
    </div>
  );
}
