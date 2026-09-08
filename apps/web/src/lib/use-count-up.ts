import { useEffect, useState } from "react";

const DURATION_MS = 600;

/** Animasikan angka dari 0 ke target selama 600ms. Reduced-motion langsung ke final. */
export function useCountUp(target: number, durationMs: number = DURATION_MS): number {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    let rafId = 0;
    const startedAt = performance.now();
    const tick = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return display;
}
