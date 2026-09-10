import React from "react";

export function TempleIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 400"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="300" height="400" className="fill-primary/5" />
      <circle cx="220" cy="100" r="45" className="fill-warning/40" />
      {/* Clouds */}
      <path d="M 30 120 Q 50 90 80 110 Q 110 90 130 120 Z" className="fill-card" />
      <path d="M 180 160 Q 200 140 220 150 Q 240 140 260 160 Z" className="fill-card" />

      {/* Mountains */}
      <polygon points="-20,300 80,180 180,300" className="fill-foreground/10" />
      <polygon points="100,300 200,200 320,300" className="fill-foreground/5" />

      {/* Temple Base */}
      <rect x="75" y="320" width="150" height="30" className="fill-primary" />
      <rect x="100" y="290" width="100" height="30" className="fill-foreground/90" />

      {/* Meru Tiers (Roofs) */}
      <polygon points="80,290 220,290 200,250 100,250" className="fill-foreground/90" />
      <polygon points="90,240 210,240 190,200 110,200" className="fill-foreground/90" />
      <polygon points="105,190 195,190 180,150 120,150" className="fill-foreground/90" />
      <polygon points="120,140 180,140 170,110 130,110" className="fill-foreground/90" />
      <polygon points="135,100 165,100 155,70 145,70" className="fill-foreground/90" />

      {/* Wood pillars / Spacers */}
      <rect x="135" y="250" width="30" height="40" className="fill-primary/80" />
      <rect x="140" y="200" width="20" height="40" className="fill-primary/80" />
      <rect x="142" y="150" width="16" height="40" className="fill-primary/80" />
      <rect x="145" y="110" width="10" height="30" className="fill-primary/80" />

      {/* Water/Ground reflection */}
      <rect x="0" y="350" width="300" height="50" className="fill-success/20" />
      <line
        x1="80"
        y1="370"
        x2="220"
        y2="370"
        className="stroke-white/50"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="385"
        x2="200"
        y2="385"
        className="stroke-white/50"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PenjorIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" className="fill-success/15" />
      <circle cx="160" cy="40" r="30" className="fill-warning/30" />

      {/* Ground */}
      <rect x="0" y="170" width="200" height="30" className="fill-success/30" />

      {/* Bamboo arch */}
      <path
        d="M 40 180 Q 30 40 150 70"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        className="stroke-foreground/80"
      />

      {/* Hanging ornaments (Sampian) */}
      <polygon points="150,70 135,115 165,115" className="fill-card shadow-sm" />
      <polygon points="120,55 110,95 130,95" className="fill-primary" />
      <polygon points="90,45 85,80 95,80" className="fill-warning" />
      <polygon points="65,45 62,75 68,75" className="fill-destructive" />

      {/* Base shrine (Sanggah) */}
      <rect
        x="25"
        y="140"
        width="30"
        height="40"
        rx="4"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <rect x="20" y="130" width="40" height="10" rx="2" className="fill-primary" />
    </svg>
  );
}

export function LontarIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" className="fill-accent/15" />

      <circle cx="100" cy="100" r="60" className="fill-white/40" />

      {/* Lontar Leaves */}
      <g transform="translate(45, 65) rotate(-15)">
        <rect width="110" height="26" rx="4" className="fill-card stroke-border" strokeWidth="2" />
        <line
          x1="20"
          y1="10"
          x2="90"
          y2="10"
          className="stroke-foreground/40"
          strokeWidth="2"
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="18"
          x2="70"
          y2="18"
          className="stroke-foreground/40"
          strokeWidth="2"
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
        <circle cx="55" cy="14" r="3" className="fill-primary" />
      </g>

      <g transform="translate(35, 95) rotate(5)">
        <rect width="120" height="26" rx="4" className="fill-card stroke-border" strokeWidth="2" />
        <line
          x1="20"
          y1="10"
          x2="100"
          y2="10"
          className="stroke-foreground/40"
          strokeWidth="2"
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="18"
          x2="80"
          y2="18"
          className="stroke-foreground/40"
          strokeWidth="2"
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
        <circle cx="60" cy="14" r="3" className="fill-primary" />
      </g>

      {/* String binding */}
      <path
        d="M 90 70 Q 110 100 100 130"
        fill="none"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AksaraBlockIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" className="fill-primary" />

      {/* Big Balinese character representation */}
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-balinese fill-white"
        style={{ fontSize: "100px" }}
      >
        ᬳ
      </text>

      <text
        x="50%"
        y="85%"
        textAnchor="middle"
        className="font-sans font-bold fill-white/80"
        style={{ fontSize: "14px", letterSpacing: "2px" }}
      >
        AKSARA
      </text>

      {/* Decorative dots */}
      <circle cx="30" cy="170" r="4" className="fill-white/30" />
      <circle cx="170" cy="170" r="4" className="fill-white/30" />
      <line x1="40" y1="170" x2="160" y2="170" className="stroke-white/20" strokeWidth="2" />
    </svg>
  );
}

export function StudyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="800" height="500" className="fill-secondary/20" />

      {/* Window */}
      <rect x="250" y="80" width="300" height="180" rx="20" className="fill-white/60" />
      <line x1="400" y1="80" x2="400" y2="260" className="stroke-white" strokeWidth="8" />
      <line x1="250" y1="170" x2="550" y2="170" className="stroke-white" strokeWidth="8" />

      {/* Cloud outside */}
      <path d="M 280 140 Q 300 110 330 130 Q 360 110 380 140 Z" className="fill-white/90" />

      {/* Desk */}
      <rect x="100" y="380" width="600" height="30" rx="15" className="fill-primary/20" />
      <rect x="160" y="410" width="30" height="90" rx="10" className="fill-primary/20" />
      <rect x="610" y="410" width="30" height="90" rx="10" className="fill-primary/20" />

      {/* Laptop */}
      <rect
        x="300"
        y="280"
        width="200"
        height="100"
        rx="10"
        className="fill-card stroke-border"
        strokeWidth="4"
      />
      <polygon
        points="270,380 530,380 500,340 300,340"
        className="fill-muted stroke-border"
        strokeWidth="4"
      />

      {/* Abstract Person 1 */}
      <circle cx="200" cy="230" r="45" className="fill-primary" />
      <path d="M 130 380 Q 200 270 270 380" className="fill-primary" />

      {/* Abstract Person 2 */}
      <circle cx="600" cy="250" r="40" className="fill-warning" />
      <path d="M 540 380 Q 600 290 660 380" className="fill-warning" />

      {/* Books */}
      <rect x="650" y="350" width="60" height="30" rx="4" className="fill-destructive/80" />
      <rect x="660" y="320" width="50" height="30" rx="4" className="fill-success/80" />
    </svg>
  );
}

export function QuizIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" className="fill-warning/15" />
      <rect
        x="40"
        y="40"
        width="120"
        height="120"
        rx="16"
        className="fill-card stroke-border"
        strokeWidth="4"
      />

      {/* Checkmarks */}
      <circle cx="100" cy="85" r="25" className="fill-success/20" />
      <path
        d="M 88 85 L 96 93 L 112 77"
        fill="none"
        className="stroke-success"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Progress bar */}
      <rect x="60" y="130" width="80" height="10" rx="5" className="fill-muted" />
      <rect x="60" y="130" width="50" height="10" rx="5" className="fill-primary" />

      {/* Floating particles */}
      <circle cx="30" cy="60" r="4" className="fill-warning" />
      <circle cx="160" cy="120" r="6" className="fill-destructive" />
      <circle cx="150" cy="40" r="3" className="fill-primary" />
    </svg>
  );
}

export function TeacherIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" className="fill-primary/10" />

      {/* Blackboard background */}
      <rect x="30" y="30" width="140" height="100" rx="8" className="fill-foreground/80" />
      <line
        x1="50"
        y1="60"
        x2="150"
        y2="60"
        className="stroke-white/20"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="20 10"
      />
      <line
        x1="50"
        y1="80"
        x2="120"
        y2="80"
        className="stroke-white/20"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="15 15"
      />

      {/* Owl Teacher */}
      <ellipse cx="100" cy="140" rx="40" ry="45" className="fill-primary" />
      <circle cx="100" cy="100" r="35" className="fill-primary" />

      {/* Eyes */}
      <circle cx="85" cy="95" r="12" className="fill-white" />
      <circle cx="115" cy="95" r="12" className="fill-white" />
      <circle cx="85" cy="95" r="4" className="fill-foreground" />
      <circle cx="115" cy="95" r="4" className="fill-foreground" />

      {/* Glasses */}
      <circle cx="85" cy="95" r="16" fill="none" className="stroke-foreground" strokeWidth="4" />
      <circle cx="115" cy="95" r="16" fill="none" className="stroke-foreground" strokeWidth="4" />
      <line x1="101" y1="95" x2="99" y2="95" className="stroke-foreground" strokeWidth="4" />

      {/* Beak */}
      <polygon points="95,108 105,108 100,118" className="fill-warning" />

      {/* Pointer */}
      <line
        x1="130"
        y1="130"
        x2="170"
        y2="50"
        className="stroke-destructive"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DictIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" className="fill-success/15" />

      {/* Book */}
      <path
        d="M 40 140 Q 100 160 100 140 Q 100 160 160 140 L 160 70 Q 100 90 100 70 Q 100 90 40 70 Z"
        className="fill-card stroke-border"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M 100 70 L 100 140" fill="none" className="stroke-border" strokeWidth="4" />

      {/* Lines on pages */}
      <line
        x1="55"
        y1="90"
        x2="85"
        y2="85"
        className="stroke-muted-foreground/30"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="55"
        y1="105"
        x2="80"
        y2="100"
        className="stroke-muted-foreground/30"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Magical symbols popping out */}
      <text x="130" y="100" className="font-balinese fill-primary text-3xl">
        ᬓ
      </text>
      <text x="120" y="120" className="font-balinese fill-warning text-xl">
        ᬫ
      </text>

      <circle cx="100" cy="40" r="15" className="fill-destructive/80" />
      <polygon
        points="100,20 105,30 115,30 107,38 110,48 100,42 90,48 93,38 85,30 95,30"
        className="fill-warning"
      />
    </svg>
  );
}

export function ReviewFamilyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="800" height="300" className="fill-accent/15" />

      {/* Sofa */}
      <rect x="150" y="180" width="500" height="60" rx="20" className="fill-primary/20" />
      <rect x="120" y="150" width="60" height="90" rx="20" className="fill-primary/30" />
      <rect x="620" y="150" width="60" height="90" rx="20" className="fill-primary/30" />

      {/* People (Abstract rounded geometric shapes) */}

      {/* Person 1 (Dad) */}
      <rect x="250" y="100" width="80" height="100" rx="40" className="fill-primary" />
      <circle cx="290" cy="70" r="35" className="fill-foreground/80" />

      {/* Person 2 (Mom) */}
      <rect x="450" y="110" width="70" height="90" rx="35" className="fill-warning" />
      <circle cx="485" cy="80" r="30" className="fill-foreground/80" />

      {/* Kid */}
      <rect x="360" y="140" width="50" height="60" rx="25" className="fill-destructive" />
      <circle cx="385" cy="115" r="25" className="fill-foreground/80" />

      {/* Tablet */}
      <rect
        x="330"
        y="150"
        width="70"
        height="40"
        rx="5"
        className="fill-card stroke-border"
        strokeWidth="4"
      />
      <rect x="340" y="155" width="50" height="30" rx="2" className="fill-success/20" />
    </svg>
  );
}
