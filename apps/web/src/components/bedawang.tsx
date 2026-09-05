import { cn } from "@caksara/ui/lib/utils";

export type BedawangMood = "senang" | "semangat" | "sedih";

const SHELL = "#b85c32";
const SHELL_EDGE = "#d98a52";
const SHELL_DARK = "#8f4526";
const HEAD = "#e59a6b";
const HEAD_DARK = "#b76a3d";
const LEG = "#d9824f";
const BELLY = "#f6e7c9";
const INK = "#3a2417";

interface BedawangProps {
  mood?: BedawangMood;
  className?: string;
  animate?: boolean;
}

export function Bedawang({ mood = "senang", className, animate = true }: BedawangProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      role="img"
      aria-label="Bedawang, kura-kura kosmis penopang dunia"
      className={cn("overflow-visible", animate && "animate-bedawang-bob", className)}
    >
      <g>
        <path
          d="M8 42v3.5c0 4.4 3.1 7.5 7.5 7.5h41c4.4 0 7.5-3.1 7.5-7.5V42a2 2 0 0 0-2.8-1.9c-1.6.7-3.5.8-5.4 0a7.6 7.6 0 0 0-6.6 0 7.4 7.4 0 0 1-6.6 0 7.4 7.4 0 0 0-6.6 0 7.4 7.4 0 0 1-6.6 0 7.4 7.4 0 0 0-6.6 0c-1.9 0.8-3.8 0.7-5.4 0A2 2 0 0 0 8 42z"
          fill={BELLY}
        />
        <path
          d="M36 13c9.7 0 17.6 7.9 17.6 17.6V42a2 2 0 0 1-2 2H20.4a2 2 0 0 1-2-2V30.6C18.4 20.9 26.3 13 36 13z"
          fill={SHELL}
        />
        <path
          d="M36 15.4c8.4 0 15.2 6.8 15.2 15.2v3a4.9 4.9 0 0 1-4.9 4.9H25.7a4.9 4.9 0 0 1-4.9-4.9v-3c0-8.4 6.8-15.2 15.2-15.2z"
          fill={SHELL_EDGE}
        />
        <path
          d="M36 18.5c6.9 0 12.5 5.6 12.5 12.5v1.6c0 1.7-1.4 3-3 3h-19c-1.7 0-3-1.3-3-3V31c0-6.9 5.6-12.5 12.5-12.5z"
          fill={SHELL}
        />
        <path
          d="M36 20.5c5.6 0 10 4.5 10 10v1c0 .8-.6 1.5-1.4 1.5h-17.2c-.8 0-1.4-.7-1.4-1.5v-1c0-5.5 4.4-10 10-10z"
          fill="none"
          stroke={SHELL_DARK}
          strokeWidth="1.6"
        />
        <path
          d="M36 21.5l0 12 M26 21.5l0 12 M46 21.5l0 12 M21.5 28l10 -2 M49.5 28l-10 -2"
          stroke={SHELL_DARK}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="36" cy="33" r="3.4" fill={SHELL_DARK} opacity="0.35" />
        <path
          d="M24 30a12 12 0 0 1 24 0l-2.4 6.5a7 7 0 0 1-6.6 4.5h-6c-2.9 0-5.6-1.8-6.6-4.5z"
          fill={HEAD}
        />
        <path
          d="M25 31a10 10 0 0 1 20 0c.6 1.8-.4 3.8-2 4.5-3 1.3-13 1.3-16 0-1.6-.7-2.6-2.7-2-4.5z"
          fill={HEAD_DARK}
          opacity="0.9"
        />
        {mood === "semangat" ? (
          <>
            <path d="M16 44l8 -7 M56 44l-8 -7" stroke={LEG} strokeWidth="6" strokeLinecap="round" />
          </>
        ) : (
          <path d="M18 55l6 -3 M54 55l-6 -3" stroke={LEG} strokeWidth="6" strokeLinecap="round" />
        )}
        <circle cx="29" cy="34.2" r="3.6" fill={INK} />
        <circle cx="42" cy="34.2" r="3.6" fill={INK} />
        {mood === "semangat" ? (
          <>
            <path
              d="M27 32.5 M42 32.5 M28.2 31a5.5 5.5 0 0 1 .8 0 M43.2 31a5.5 5.5 0 0 1-.8 0"
              stroke={INK}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="27.4" cy="32.4" r="1.3" fill="#fff" />
            <circle cx="40.4" cy="32.4" r="1.3" fill="#fff" />
          </>
        ) : mood === "senang" ? (
          <>
            <circle cx="27.4" cy="32.4" r="1.3" fill="#fff" />
            <circle cx="40.4" cy="32.4" r="1.3" fill="#fff" />
          </>
        ) : (
          <>
            <path
              d="M26.8 36.6 a2.4 2.4 0 0 1 4 0 M42.8 36.6 a2.4 2.4 0 0 0 -4 0"
              stroke={INK}
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
        <circle cx="26.6" cy="38" r="2" fill="#e58a74" opacity="0.85" />
        <circle cx="44.4" cy="38" r="2" fill="#e58a74" opacity="0.85" />
        {mood === "sedih" ? (
          <>
            <circle cx="20.5" cy="40" r="1.2" fill="#8ecae6" opacity="0.9" />
            <circle cx="53.5" cy="40" r="1.2" fill="#8ecae6" opacity="0.9" />
            <path
              d="M33 36.5 q3 -1.7 6 0"
              stroke={INK}
              strokeWidth="1.7"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : mood === "semangat" ? (
          <path
            d="M32.5 34.5 q3.5 3 7 0"
            stroke={INK}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M33 35.5 q3 2.3 6 0"
            stroke={INK}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );
}
