import { cn } from "@caksara/ui/lib/utils";
import type { BedawangAccessory, BedawangHead, BedawangShell } from "../lib/zod/profile";

export type BedawangMood = "senang" | "semangat" | "sedih";

// HACK(debt): pakai SATU set nama saja (bedawang-*). Varian mascot-* identik
// byte-for-byte (md5 sama) — duplikasi ~1,1MB, lihat debt issue. JPG lama
// (new-hero-mascot.jpg) tak lagi dirujuk kode; dibiarkan agar tidak break
// pemakai tak terduga, hapus terpisah.

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

const MOOD_SRC: Record<BedawangMood, string> = {
  senang: "/assets/bedawang-happy.png",
  semangat: "/assets/bedawang-waving.png",
  sedih: "/assets/bedawang-standing.png",
};

const DEFAULT_SRC = "/assets/bedawang-standing.png";

export function Bedawang({ mood, className, animate, interactive, onClick }: BedawangProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      onClick={interactive ? onClick : undefined}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      <img
        src={mood ? MOOD_SRC[mood] : DEFAULT_SRC}
        alt="Maskot Bedawang Nala"
        className={cn("h-full w-full object-cover", animate && "animate-pulse")}
      />
    </div>
  );
}
