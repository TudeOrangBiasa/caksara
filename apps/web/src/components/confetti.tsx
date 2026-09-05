import { useEffect, useState } from "react";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
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

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) return;
    const newParticles: ConfettiParticle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.8,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 1500);
    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-[confetti-fall_1.4s_ease-out_forwards]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${8 * p.scale}px`,
            height: `${8 * p.scale}px`,
            backgroundColor: p.color,
            borderRadius: "2px",
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}
