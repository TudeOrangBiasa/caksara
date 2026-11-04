import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function snapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True bila user meminta gerak minimal — matikan pulse/shake/confetti/count-up. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
