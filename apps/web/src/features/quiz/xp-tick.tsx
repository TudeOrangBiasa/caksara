import { useCountUp } from "../../lib/use-count-up";

/** XP yang baru didapat: count-up 600ms ke `to` (reduced-motion → final langsung). */
export function XpTick({ from, to }: { from: number; to: number }) {
  const display = useCountUp(to - from > 0 ? to - from : 0);
  return <span className="tabular-nums">+{display} XP</span>;
}
