import { Check, Heart } from "lucide-react";

import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";

/** Ilustrasi prosedural untuk kartu Pendekatan Kami: relevan, offline, tanpa foto stok. */

function Frame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      {children}
    </div>
  );
}

/** Terstruktur: 4 simpul modul menyala berurutan + glyph raksasa. */
export function ArtPath({ className }: { className?: string }) {
  return (
    <Frame label="Alur empat modul" className={className}>
      <div className="absolute inset-0 bg-primary/10" aria-hidden />
      <span
        aria-hidden
        className="font-balinese absolute -right-4 -bottom-10 text-[11rem] leading-none text-primary/15"
      >
        ᬳ
      </span>
      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2" aria-hidden>
        <div className="relative flex items-center">
          <span className="absolute right-0 left-0 h-1.5 rounded-full bg-muted" />
          <span className="absolute right-1/2 left-0 h-1.5 rounded-full bg-primary" />
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className="relative z-10 flex flex-1 items-center justify-center">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full text-xs font-extrabold",
                  n === 1 && "bg-primary text-primary-foreground",
                  n === 2 && "bg-accent text-stone-900 ring-4 ring-accent/30",
                  n > 2 && "bg-card text-muted-foreground ring-1 ring-border",
                )}
              >
                {n === 1 ? <Check className="size-4" strokeWidth={3} /> : n}
              </span>
            </span>
          ))}
        </div>
        <div className="mt-2 flex">
          {["Sapaan", "Wresastra", "Andap", "Tradisi"].map((t) => (
            <span
              key={t}
              className="flex-1 text-center text-[10px] font-semibold text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/** Menyenangkan: kartu kuis mini + hati melayang. */
export function ArtQuiz({ className }: { className?: string }) {
  return (
    <Frame label="Kuis seru dan interaktif" className={className}>
      <div className="absolute inset-0 bg-accent/15" aria-hidden />
      <Heart
        aria-hidden
        className="absolute top-5 left-6 size-5 fill-destructive text-destructive"
      />
      <Heart
        aria-hidden
        className="absolute right-8 bottom-8 size-4 fill-destructive text-destructive opacity-70"
      />
      <span aria-hidden className="absolute top-8 right-10 size-2 rounded-full bg-primary" />
      <span aria-hidden className="absolute bottom-6 left-10 size-2.5 rounded-full bg-accent" />
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-2xl bg-card p-3 shadow-sm">
        <div className="h-2.5 w-3/4 rounded-full bg-muted" aria-hidden />
        <div className="mt-2 h-2.5 w-1/2 rounded-full bg-muted" aria-hidden />
        <div className="mt-3 space-y-1.5" aria-hidden>
          <div className="flex h-7 items-center gap-2 rounded-full bg-primary px-3 text-[11px] font-bold text-primary-foreground">
            <Check className="size-3.5" strokeWidth={3} /> Om Swastiastu
          </div>
          <div className="flex h-7 items-center rounded-full bg-muted px-3 text-[11px] font-semibold text-muted-foreground">
            Matur suksma
          </div>
          <div className="flex h-7 items-center rounded-full bg-muted px-3 text-[11px] font-semibold text-muted-foreground">
            Rahajeng semeng
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Kamus Lengkap: lontar + glyph + kaca pembesar. */
export function ArtLontar({ className }: { className?: string }) {
  return (
    <Frame label="Lontar kamus aksara Bali" className={className}>
      <div className="absolute inset-0 bg-success/10" aria-hidden />
      <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full" aria-hidden>
        {[56, 92, 128].map((y, i) => (
          <g key={y}>
            <rect
              x="40"
              y={y}
              width="220"
              height="30"
              rx="9"
              fill="var(--card-cream)"
              stroke="var(--card-ink)"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              transform={`rotate(${i === 1 ? 0 : i === 0 ? -3 : 3} 150 ${y + 15})`}
            />
            <circle cx="150" cy={y + 15} r="4" fill="var(--background)" />
          </g>
        ))}
        <text
          x="70"
          y="80"
          fontFamily="'Noto Sans Balinese', sans-serif"
          fontSize="22"
          fill="var(--card-ink)"
          opacity="0.75"
        >
          ᬳᬓ᭄ᬱᬭᬩᬮᬶ
        </text>
        <text
          x="70"
          y="116"
          fontFamily="'Noto Sans Balinese', sans-serif"
          fontSize="22"
          fill="var(--card-ink)"
          opacity="0.75"
        >
          ᬕᬸᬭᬸ
        </text>
        <circle cx="216" cy="132" r="26" fill="none" stroke="var(--primary)" strokeWidth="7" />
        <line
          x1="235"
          y1="151"
          x2="254"
          y2="170"
          stroke="var(--primary)"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
    </Frame>
  );
}

/** Pendamping: Bedawang berudeng menyapa. */
export function ArtGuru({ className }: { className?: string }) {
  return (
    <Frame label="Guru virtual Bedawang" className={className}>
      <div className="absolute inset-0 bg-primary text-primary-foreground" aria-hidden />
      <span
        aria-hidden
        className="font-balinese absolute -top-4 -left-2 text-[8rem] leading-none text-white/10"
      >
        ᬕᬸᬭᬸ
      </span>
      <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-xs font-bold whitespace-nowrap text-stone-900 shadow-sm">
        Om Swastiastu!
      </div>
      <Bedawang
        mood="semangat"
        accessory="udeng"
        className="absolute bottom-2 left-1/2 size-40 -translate-x-1/2"
      />
    </Frame>
  );
}
