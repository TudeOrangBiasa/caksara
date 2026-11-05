import { useEffect, useState } from "react";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  duration: number;
  sway: number;
  round: boolean;
}

// Emas konfeti dari token global (ADR-0011): var(--confetti-*), bukan hex.
const COLORS = [
  "var(--confetti-1)",
  "var(--confetti-2)",
  "var(--confetti-3)",
  "var(--confetti-4)",
  "var(--confetti-5)",
  "var(--confetti-6)",
];

/** Perayaan 3 gelombang: 45 partikel tiap 450ms, hidup total ~4,5 detik. */
const WAVES = 3;
const PER_WAVE = 45;
const WAVE_GAP_MS = 450;
const CLEAR_MS = 4500;

function makeWave(wave: number): ConfettiParticle[] {
  return Array.from({ length: PER_WAVE }, (_, i) => ({
    id: wave * PER_WAVE + i,
    x: Math.random() * 100,
    y: -6 - Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    scale: 0.6 + Math.random() * 1.1,
    duration: 2.2 + Math.random() * 1.2,
    sway: (Math.random() - 0.5) * 90,
    round: Math.random() < 0.35,
  }));
}

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) return;
    const timers: number[] = [];
    for (let w = 0; w < WAVES; w += 1) {
      timers.push(
        window.setTimeout(() => {
          setParticles((prev) => [...prev, ...makeWave(w)]);
        }, w * WAVE_GAP_MS),
      );
    }
    timers.push(window.setTimeout(() => setParticles([]), CLEAR_MS));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div data-slot="confetti" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-[confetti-fall_ease-out_forwards]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${9 * p.scale}px`,
            height: `${9 * p.scale}px`,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "2px",
            ["--sway" as string]: `${p.sway}px`,
            transform: `rotate(${p.rotation}deg)`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
