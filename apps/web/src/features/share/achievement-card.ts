import { WRESASTRA_AKSARA } from "../module/aksara-data";

export interface AchievementCardData {
  name: string;
  xp: number;
  streak: number;
  hearts: number;
  mastery: Record<string, "belum" | "dipahami" | "ahli"> | undefined;
  modulSelesai: number;
  modulTotal: number;
  tidbit: string;
}

export const CARD_W = 1080;
export const CARD_H = 1350;

const PALETTE = {
  bg: "#faf1e2",
  bgDeep: "#f1dfc2",
  ink: "#3a2a1c",
  muted: "#7a6350",
  line: "#e3cdab",
  primary: "#b05a30",
  primaryDark: "#873f1e",
  gold: "#d9a441",
  cream: "#fff8ec",
  white: "#ffffff",
  mastery: {
    belum: "#d6c8b6",
    dipahami: "#e0b24f",
    ahli: "#b05a30",
  },
  statusText: {
    belum: "#7a6350",
    dipahami: "#6b4b12",
    ahli: "#fff8ec",
  },
};

export const TIDBITS = [
  "Penjor yang menjulang saat Galungan adalah lambang kesejahteraan dan rasa syukur.",
  "Aksara Bali ditulis dari kiri ke kanan, seperti huruf Latin pada umumnya.",
  "Nama 'Bedawang' merujuk pada kura-kura raksasa penopang bumi dalam mitologi Bali.",
  "Basa Alus dipakai untuk menghormati orang yang lebih tua atau lebih tinggi kedudukan.",
  "Canang sari dibuat setiap pagi sebagai ungkapan syukur atas kehidupan sehari-hari.",
  "Nyepi adalah hari hening: semua aktivitas dihentikan selama 24 jam sebagai refleksi.",
];

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCircleAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  initial: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.primary;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = PALETTE.gold;
  ctx.stroke();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = `700 ${Math.round(r * 1.1)}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial.toUpperCase(), cx, cy + 4);
  ctx.restore();
}

export function renderAchievementCard(
  canvas: HTMLCanvasElement,
  data: AchievementCardData,
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  canvas.width = CARD_W;
  canvas.height = CARD_H;

  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const pad = 64;
  const w = CARD_W - pad * 2;

  // Header
  ctx.save();
  ctx.fillStyle = PALETTE.primaryDark;
  ctx.globalAlpha = 0.08;
  ctx.beginPath();
  ctx.arc(CARD_W, 30, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 40px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("CAKSARA", pad, 96);
  ctx.restore();

  const tip = `${data.modulSelesai} modul selesai`;
  ctx.save();
  ctx.fillStyle = PALETTE.primary;
  ctx.font = "600 24px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(tip, CARD_W - pad, 66);
  ctx.restore();

  // Profile row
  const avatarR = 76;
  const avatarCX = pad + avatarR;
  const avatarCY = 200;
  drawCircleAvatar(ctx, avatarCX, avatarCY, avatarR, data.name.charAt(0) || "?");

  ctx.save();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 54px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(data.name, pad + avatarR * 2 + 28, avatarCY - 32);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = PALETTE.muted;
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText("Petualang Aksara Bali", pad + avatarR * 2 + 28, avatarCY + 18);
  ctx.restore();

  // Stat card
  const stats = [
    { label: "XP", value: String(data.xp) },
    { label: "Streak", value: data.streak > 0 ? `${data.streak} hari` : "0" },
    { label: "Hati", value: `${data.hearts}/5` },
  ];
  const statY = 350;
  const statCardH = 150;
  const gap = 24;
  const statW = (w - gap * 2) / 3;
  stats.forEach((s, i) => {
    const sx = pad + i * (statW + gap);
    ctx.save();
    rr(ctx, sx, statY, statW, statCardH, 28);
    ctx.fillStyle = i === 0 ? PALETTE.primary : PALETTE.bgDeep;
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = i === 0 ? PALETTE.cream : PALETTE.ink;
    ctx.font = "800 42px Inter, sans-serif";
    ctx.fillText(s.value, sx + statW / 2, statY + statCardH / 2 + 6);
    ctx.fillStyle = i === 0 ? PALETTE.cream : PALETTE.muted;
    ctx.font = "600 20px Inter, sans-serif";
    ctx.fillText(s.label, sx + statW / 2, statY + statCardH - 26);
    ctx.restore();
  });

  // Mastery section
  const sectionTop = statY + statCardH + 48;
  ctx.save();
  ctx.font = "700 30px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText("Mastery 18 Wresastra", pad, sectionTop);
  ctx.restore();

  const legend = [
    { label: "Belum", color: PALETTE.mastery.belum, text: PALETTE.mastery.belum },
    { label: "Dipahami", color: PALETTE.mastery.dipahami, text: PALETTE.mastery.dipahami },
    { label: "Ahli", color: PALETTE.mastery.ahli, text: PALETTE.mastery.ahli },
  ];
  let lx = pad;
  legend.forEach((l) => {
    const lw =
      ctx.measureText(l.label.toUpperCase()).width + 34 + (l.label === "Dipahami" ? 26 : 26);
    ctx.save();
    rr(ctx, lx, sectionTop + 12, lw, 34, 17);
    ctx.fillStyle = PALETTE.bgDeep;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx + 17, sectionTop + 29, 8, 0, Math.PI * 2);
    ctx.fillStyle = l.color;
    ctx.fill();
    ctx.font = "600 16px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(l.label.toUpperCase(), lx + 32, sectionTop + 36);
    ctx.restore();
    lx += lw + 12;
  });

  const gridTop = sectionTop + 84;
  const cols = 6;
  const rows = 3;
  const cellGap = 14;
  const gridW = w;
  const cellW = (gridW - cellGap * (cols - 1)) / cols;
  const cellH = 118;

  WRESASTRA_AKSARA.forEach((a, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const status = data.mastery?.[a.id] ?? "belum";
    const cx2 = pad + col * (cellW + cellGap);
    const cy2 = gridTop + row * (cellH + cellGap);
    const color = PALETTE.mastery[status];
    const tcolor = PALETTE.statusText[status];

    ctx.save();
    rr(ctx, cx2, cy2, cellW, cellH, 20);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = tcolor;
    ctx.font = `48px "Noto Sans Balinese", sans-serif`;
    ctx.fillText(a.glyph, cx2 + cellW / 2, cy2 + 52);
    ctx.font = "700 17px Inter, sans-serif";
    ctx.fillText(status.toUpperCase(), cx2 + cellW / 2, cy2 + cellH - 18);
    ctx.restore();
  });

  // Tidbit
  const tidbitTop = gridTop + rows * (cellH + cellGap) + 36;
  ctx.save();
  rr(ctx, pad, tidbitTop, w, 132, 28);
  ctx.fillStyle = PALETTE.bgDeep;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(pad + 40, tidbitTop + 66);
  ctx.lineTo(pad + 60, tidbitTop + 40);
  ctx.lineTo(pad + 60, tidbitTop + 92);
  ctx.closePath();
  ctx.fillStyle = PALETTE.gold;
  ctx.fill();

  ctx.font = "500 24px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.ink;

  const maxTextW = w - 96;
  const words = data.tidbit.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxTextW && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  const tidy = lines.slice(0, 2).join("\n");
  ctx.fillText(tidy, pad + 44, tidbitTop + 66);

  ctx.fillStyle = PALETTE.muted;
  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillText("TAHUKAH KAMU?", pad + 44, tidbitTop + 26);
  ctx.restore();

  // Footer
  const footY = CARD_H - 60;
  ctx.save();
  ctx.font = "500 26px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText("CAKSARA • Web Edukasi Aksara Bali", CARD_W / 2, footY);
  ctx.restore();

  return canvas;
}

export function pickTidbit(): string {
  return TIDBITS[Math.floor(Math.random() * TIDBITS.length)];
}
