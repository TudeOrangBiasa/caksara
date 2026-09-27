import { cn } from "@caksara/ui/lib/utils";

import type { BedawangMood } from "../lib/zod/profile";

const MOOD_SRC: Record<BedawangMood, string> = {
  senang: "/assets/bedawang-happy.png",
  semangat: "/assets/bedawang-waving.png",
  sedih: "/assets/bedawang-standing.png",
};

export interface BedawangProps {
  mood?: BedawangMood;
  className?: string;
  interactive?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

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
        src={MOOD_SRC[mood]}
        alt="Maskot Bedawang Nala"
        className={cn("h-full w-full object-cover", animate && "animate-pulse")}
      />
    </div>
  );
}
