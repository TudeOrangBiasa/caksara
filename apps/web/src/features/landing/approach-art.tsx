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

/** Meru saat fajar: panel tinggi hero. */
export function ArtMeru({ className }: { className?: string }) {
  const roofs = [150, 120, 92, 66, 44];
  let y = 356;
  const tiers = roofs.map((w) => {
    const tier = (
      <g key={w}>
        <path
          d={`M${150 - w / 2} ${y} L${150 + w / 2} ${y} L${150 + w / 2 - 12} ${y - 26} L${150 - w / 2 + 12} ${y - 26} Z`}
          fill="var(--card-ink)"
        />
        <rect x={150 - 5} y={y - 44} width={10} height={20} fill="var(--card-ink)" />
      </g>
    );
    y -= 44;
    return tier;
  });
  return (
    <svg
      viewBox="0 0 300 600"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Meru pura saat fajar"
      className={cn("h-full w-full", className)}
    >
      <rect width="300" height="400" fill="var(--card-bg)" />
      <circle cx="225" cy="120" r="42" fill="var(--accent)" />
      <ellipse cx="70" cy="100" rx="46" ry="16" fill="var(--card-white)" opacity="0.85" />
      <ellipse cx="110" cy="118" rx="30" ry="11" fill="var(--card-white)" opacity="0.7" />
      <path d="M0 330 L70 250 L140 330 Z" fill="var(--card-muted)" opacity="0.6" />
      <path d="M160 330 L240 240 L300 330 Z" fill="var(--card-muted)" opacity="0.45" />
      <rect x="60" y="356" width="180" height="44" rx="6" fill="var(--card-primary)" />
      {tiers}
      <rect x="147" y="118" width="6" height="22" fill="var(--card-ink)" />
      <path d="M153 118 l22 7 -22 7 z" fill="var(--card-gold)" />
      <path
        d="M40 300 q6 -6 12 0 M58 292 q6 -6 12 0"
        stroke="var(--card-ink)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect y="400" width="300" height="200" fill="var(--bedawang-gem)" opacity="0.4" />
      <rect x="128" y="410" width="44" height="150" fill="var(--card-white)" opacity="0.35" />
      {[430, 460, 495, 530].map((ry, i) => (
        <rect
          key={ry}
          x={40 + i * 18}
          y={ry}
          width={90 - i * 12}
          height="5"
          rx="2.5"
          fill="var(--card-white)"
          opacity="0.5"
        />
      ))}
      <rect y="556" width="300" height="44" fill="var(--success)" opacity="0.35" />
    </svg>
  );
}

/** Glyph raksasa + statistik: panel kanan atas hero. */
export function ArtGlyphTile({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 292"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Aksara Bali raksasa"
      className={cn("h-full w-full", className)}
    >
      <rect width="300" height="292" fill="var(--primary)" />
      <text
        x="150"
        y="138"
        textAnchor="middle"
        fontFamily="'Noto Sans Balinese', sans-serif"
        fontSize="82"
        fill="var(--primary-foreground)"
      >
        ᬳᬓ᭄ᬱᬭ
      </text>
      <text
        x="150"
        y="180"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="15"
        fontWeight="600"
        fill="var(--primary-foreground)"
        opacity="0.85"
      >
        aksara · tulisan · warisan
      </text>
      <g fontFamily="Inter, sans-serif" textAnchor="middle">
        {[
          ["18", "Aksara", 40],
          ["4", "Modul", 150],
          ["27", "Entri KB", 260],
        ].map(([num, label, cx]) => (
          <g key={label}>
            <rect
              x={cx - 48}
              y={214}
              width="96"
              height="58"
              rx="14"
              fill="var(--card-white)"
              opacity="0.18"
            />
            <text x={cx} y={240} fontSize="24" fontWeight="800" fill="var(--primary-foreground)">
              {num}
            </text>
            <text x={cx} y={259} fontSize="11" fill="var(--primary-foreground)" opacity="0.8">
              {label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Penjor + canang: panel kanan bawah hero. */
export function ArtPenjor({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 292"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Penjor dan canang sari"
      className={cn("h-full w-full", className)}
    >
      <rect width="300" height="292" fill="var(--card-bg-deep)" />
      <circle cx="248" cy="52" r="26" fill="var(--accent)" opacity="0.85" />
      <rect y="252" width="300" height="40" fill="var(--success)" opacity="0.3" />
      <path
        d="M80 268 C80 180 130 140 215 100"
        stroke="var(--card-ink)"
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M80 268 C80 180 130 140 215 100"
        stroke="var(--card-gold)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="2 14"
      />
      <path
        d="M215 100 l34 10 -34 10 z"
        fill="var(--card-white)"
        stroke="var(--card-ink)"
        strokeOpacity="0.25"
      />
      <path d="M215 100 l20 6 -20 6 z" fill="var(--destructive)" opacity="0.85" />
      {[
        [92, 218, 1],
        [112, 192, 0],
        [138, 168, 1],
        [168, 146, 0],
        [196, 126, 1],
      ].map(([x, yy, gold], i) => (
        <g key={i}>
          <line x1={x} y1={yy - 4} x2={x} y2={yy + 8} stroke="var(--card-ink)" strokeWidth="2.5" />
          <path
            d={`M${x} ${yy + 8} l-12 20 l24 0 z`}
            fill={gold ? "var(--card-gold)" : "var(--card-cream)"}
            stroke="var(--card-ink)"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
          <rect x={x - 15} y={yy + 26} width="30" height="7" rx="3.5" fill="var(--primary)" />
        </g>
      ))}
      <rect x="42" y="238" width="56" height="34" rx="8" fill="var(--success)" opacity="0.45" />
      <rect
        x="48"
        y="232"
        width="44"
        height="12"
        rx="4"
        fill="var(--card-cream)"
        stroke="var(--card-ink)"
        strokeOpacity="0.25"
      />
      <circle cx="68" cy="243" r="5" fill="var(--bedawang-blush)" />
      <circle
        cx="80"
        cy="243"
        r="5"
        fill="var(--card-white)"
        stroke="var(--card-ink)"
        strokeOpacity="0.2"
      />
      <circle cx="92" cy="243" r="5" fill="var(--card-gold)" />
    </svg>
  );
}

/** Modul runtut: kartu fitur besar (latar gelap, teks putih di atasnya). */
export function ArtModul({ className }: { className?: string }) {
  const steps = ["Sapaan", "Wresastra", "Andap", "Tradisi"];
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Alur modul aksara Bali"
      className={cn("h-full w-full", className)}
    >
      <rect width="800" height="500" fill="var(--card-ink)" />
      {[
        [640, 70],
        [700, 150],
        [600, 240],
        [700, 330],
        [640, 430],
        [90, 420],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 2 ? 5 : 8} fill="var(--card-gold)" opacity="0.25" />
      ))}
      <text
        x="70"
        y="300"
        fontFamily="'Noto Sans Balinese', sans-serif"
        fontSize="190"
        fill="var(--card-cream)"
      >
        ᬳᬓ᭄ᬱᬭ
      </text>
      <g fontFamily="Inter, sans-serif">
        {steps.map((s, i) => (
          <g key={s}>
            <rect
              x="430"
              y={110 + i * 72}
              width="290"
              height="56"
              rx="16"
              fill="var(--card-white)"
              opacity="0.09"
            />
            <circle
              cx="462"
              cy={138 + i * 72}
              r="17"
              fill={i < 2 ? "var(--card-gold)" : "none"}
              stroke="var(--card-gold)"
              strokeWidth="2.5"
            />
            <text
              x="462"
              y={138 + i * 72 + 6}
              textAnchor="middle"
              fontSize="17"
              fontWeight="800"
              fill={i < 2 ? "var(--card-ink)" : "var(--card-gold)"}
            >
              {i < 2 ? "✓" : `0${i + 1}`}
            </text>
            <text
              x="490"
              y={138 + i * 72 + 6}
              fontSize="19"
              fontWeight="700"
              fill="var(--card-cream)"
            >
              {s}
            </text>
          </g>
        ))}
      </g>
      <rect x="70" y="420" width="300" height="12" rx="6" fill="var(--card-white)" opacity="0.18" />
      <rect x="70" y="420" width="180" height="12" rx="6" fill="var(--card-gold)" />
    </svg>
  );
}

/** Papan tulis guru: panel testimoni unggulan. */
export function ArtPapan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 256"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Papan tulis aksara Bali"
      className={cn("h-full w-full", className)}
    >
      <rect width="400" height="256" fill="var(--card-ink)" />
      <rect
        x="18"
        y="14"
        width="364"
        height="200"
        rx="14"
        fill="none"
        stroke="var(--card-gold)"
        strokeOpacity="0.5"
        strokeWidth="3"
      />
      <text
        x="44"
        y="105"
        fontFamily="'Noto Sans Balinese', sans-serif"
        fontSize="64"
        fill="var(--card-cream)"
      >
        ᬳᬓ᭄ᬱᬭ
      </text>
      <text
        x="46"
        y="150"
        fontFamily="Inter, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="var(--card-cream)"
        opacity="0.75"
      >
        aksara = tulisan
      </text>
      <path
        d="M46 172 l14 14 l26 -30"
        stroke="var(--card-gold)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="96"
        y="190"
        fontFamily="Inter, sans-serif"
        fontSize="19"
        fontWeight="700"
        fill="var(--card-cream)"
      >
        Bagus!
      </text>
      <rect x="300" y="228" width="34" height="10" rx="3" fill="var(--card-cream)" opacity="0.9" />
      <rect x="262" y="226" width="26" height="14" rx="4" fill="var(--card-muted)" />
      <path
        d="M330 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z"
        fill="var(--card-gold)"
        opacity="0.9"
      />
      <path
        d="M52 200 l2.4 6.4 6.4 2.4 -6.4 2.4 -2.4 6.4 -2.4 -6.4 -6.4 -2.4 6.4 -2.4 z"
        fill="var(--card-gold)"
        opacity="0.7"
      />
    </svg>
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
      <Bedawang mood="semangat" className="absolute bottom-2 left-1/2 size-40 -translate-x-1/2" />
    </Frame>
  );
}
