import { BEDAWANG_MOOD_SRC } from "../../components/bedawang";
import { defaultAvatarUri, ipAvatarUriForName } from "../../lib/default-avatar";
import type { ProfileAvatar } from "../../lib/zod/profile";
import { WRESASTRA_AKSARA } from "../module/aksara-data";

export interface AchievementCardData {
  name: string;
  avatar: ProfileAvatar | undefined;
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
/** Batas ukuran PNG kartu agar lolos kriteria <500kb dengan margin aman. */
export const CARD_PNG_MAX_BYTES = 450_000;

/**
 * Palet kartu dari token global (ADR-0011). Canvas tidak bisa memakai
 * `var()` langsung di fillStyle, jadi resolve sekali dari CSSOM dengan
 * fallback HEX (kartu PNG selalu desain terang; SSR pakai fallback).
 */
function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return (
    window.getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  );
}

const PALETTE = {
  bg: cssVar("--card-bg", "#faf1e2"),
  bgDeep: cssVar("--card-bg-deep", "#f1dfc2"),
  ink: cssVar("--card-ink", "#3a2a1c"),
  muted: cssVar("--card-muted", "#7a6350"),
  line: cssVar("--card-line", "#e3cdab"),
  primary: cssVar("--card-primary", "#b05a30"),
  primaryDark: cssVar("--card-primary-dark", "#873f1e"),
  gold: cssVar("--card-gold", "#d9a441"),
  cream: cssVar("--card-cream", "#fff8ec"),
  white: cssVar("--card-white", "#ffffff"),
  mastery: {
    belum: cssVar("--card-mastery-belum", "#d6c8b6"),
    dipahami: cssVar("--card-mastery-dipahami", "#e0b24f"),
    ahli: cssVar("--card-mastery-ahli", "#b05a30"),
  },
  statusText: {
    belum: cssVar("--card-status-belum", "#7a6350"),
    dipahami: cssVar("--card-status-dipahami", "#6b4b12"),
    ahli: cssVar("--card-status-ahli", "#fff8ec"),
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

/**
 * Sumber gambar avatar untuk kartu, mengikuti prioritas ProfileAvatar:
 * foto upload (data:image) / IP webp lokal / Bedawang PNG / SVG default.
 * Kembalikan null bila hanya inisial yang tersedia (kantong color).
 */
export function resolveAvatarSrc(avatar: ProfileAvatar | undefined, name: string): string | null {
  if (avatar?.kind === "photo" && avatar.value.startsWith("data:image")) return avatar.value;
  if (avatar?.kind === "photo" && avatar.value.startsWith("/assets/avatar-")) return avatar.value;
  if (avatar?.kind === "bedawang") return BEDAWANG_MOOD_SRC[avatar.value.mood];
  if (avatar?.kind === "color") return null;
  const seed = name.trim() || "C";
  try {
    return ipAvatarUriForName(seed);
  } catch {
    return defaultAvatarUri(seed);
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img), { once: true });
    img.addEventListener("error", () => resolve(null), { once: true });
    img.src = src;
  });
}

function drawAvatarImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const side = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height) || 1;
  const sx = ((img.naturalWidth || img.width) - side) / 2;
  const sy = ((img.naturalHeight || img.height) - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 8;
  ctx.strokeStyle = PALETTE.gold;
  ctx.stroke();
  ctx.restore();
}
export function renderAchievementCard(
  canvas: HTMLCanvasElement,
  data: AchievementCardData,
): HTMLCanvasElement {
  renderCardScene(canvas.getContext("2d"), canvas, data, null);
  return canvas;
}

/**
 * Render kartu + avatar nyata (IP/Bedawang/foto). Async hanya menunggu
 * gambar avatar; seluruh scene digambar ulang setelah gambar siap agar
 * tidak ada lingkaran inisial tertinggal di bawah foto.
 */
export async function renderAchievementCardWithAvatar(
  canvas: HTMLCanvasElement,
  data: AchievementCardData,
): Promise<HTMLCanvasElement> {
  renderCardScene(canvas.getContext("2d"), canvas, data, null);
  const src = resolveAvatarSrc(data.avatar, data.name);
  if (!src) return canvas;
  const img = await loadImage(src).catch(() => null);
  if (img) renderCardScene(canvas.getContext("2d"), canvas, data, img);
  return canvas;
}

/**
 * Ekspor PNG 1080x1350 dari kanvas kartu. Paksa dimensi standar lalu
 * kembalikan dataURL hanya bila ukurannya di bawah batas; null bila
 * kanvas kosong atau PNG melebihi batas (pemanggil tampilkan error).
 */
export function exportPng(canvas: HTMLCanvasElement): string | null {
  if (canvas.width !== CARD_W || canvas.height !== CARD_H) return null;
  const url = canvas.toDataURL("image/png");
  const bytes = Math.ceil(((url.length - "data:image/png;base64,".length) * 3) / 4);
  if (bytes <= 0 || bytes > CARD_PNG_MAX_BYTES) return null;
  return url;
}

interface SceneGeom {
  pad: number;
  w: number;
}

function drawHeader(ctx: CanvasRenderingContext2D, g: SceneGeom, data: AchievementCardData): void {
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
  ctx.fillText("CAKSARA", g.pad, 96);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = PALETTE.primary;
  ctx.font = "600 24px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(`${data.modulSelesai}/${data.modulTotal} modul selesai`, CARD_W - g.pad, 66);
  ctx.restore();
}

function renderCardScene(
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement,
  data: AchievementCardData,
  avatarImg: HTMLImageElement | null,
): void {
  if (!ctx) return;
  canvas.width = CARD_W;
  canvas.height = CARD_H;

  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const g: SceneGeom = { pad: 64, w: CARD_W - 64 * 2 };
  drawHeader(ctx, g, data);
  drawProfileRow(ctx, g, data, avatarImg);
  drawTidbit(ctx, g, data, drawMastery(ctx, g, data, drawStats(ctx, g, data)));
  drawFooter(ctx);
}

function drawProfileRow(
  ctx: CanvasRenderingContext2D,
  g: SceneGeom,
  data: AchievementCardData,
  avatarImg: HTMLImageElement | null,
): void {
  const avatarR = 76;
  const avatarCX = g.pad + avatarR;
  const avatarCY = 200;
  if (avatarImg) {
    drawAvatarImage(ctx, avatarImg, avatarCX, avatarCY, avatarR);
  } else {
    drawCircleAvatar(ctx, avatarCX, avatarCY, avatarR, data.name.charAt(0) || "?");
  }
  ctx.save();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 54px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(data.name, g.pad + avatarR * 2 + 28, avatarCY - 32);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = PALETTE.muted;
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText("Petualang Aksara Bali", g.pad + avatarR * 2 + 28, avatarCY + 18);
  ctx.restore();
}

function drawStats(ctx: CanvasRenderingContext2D, g: SceneGeom, data: AchievementCardData): number {
  const stats = [
    { label: "XP", value: String(data.xp) },
    { label: "Streak", value: data.streak > 0 ? `${data.streak} hari` : "0" },
    { label: "Hati", value: `${data.hearts}/5` },
  ];
  const statY = 350;
  const statCardH = 150;
  const gap = 24;
  const statW = (g.w - gap * 2) / 3;
  stats.forEach((s, i) => {
    const sx = g.pad + i * (statW + gap);
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
  return statY + statCardH;
}

function drawMastery(
  ctx: CanvasRenderingContext2D,
  g: SceneGeom,
  data: AchievementCardData,
  statsBottom: number,
): number {
  const sectionTop = statsBottom + 48;
  ctx.save();
  ctx.font = "700 30px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText("Mastery 18 Wresastra", g.pad, sectionTop);
  ctx.restore();

  const legend = [
    { label: "Belum", color: PALETTE.mastery.belum },
    { label: "Dipahami", color: PALETTE.mastery.dipahami },
    { label: "Ahli", color: PALETTE.mastery.ahli },
  ];
  let lx = g.pad;
  legend.forEach((l) => {
    const lw = ctx.measureText(l.label.toUpperCase()).width + 60;
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
  const cellW = (g.w - cellGap * (cols - 1)) / cols;
  const cellH = 118;

  WRESASTRA_AKSARA.forEach((a, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const status = data.mastery?.[a.id] ?? "belum";
    const cx2 = g.pad + col * (cellW + cellGap);
    const cy2 = gridTop + row * (cellH + cellGap);

    ctx.save();
    rr(ctx, cx2, cy2, cellW, cellH, 20);
    ctx.fillStyle = PALETTE.mastery[status];
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.statusText[status];
    ctx.font = `48px "Noto Sans Balinese", sans-serif`;
    ctx.fillText(a.glyph, cx2 + cellW / 2, cy2 + 52);
    ctx.font = "700 17px Inter, sans-serif";
    ctx.fillText(status.toUpperCase(), cx2 + cellW / 2, cy2 + cellH - 18);
    ctx.restore();
  });
  return gridTop + rows * (cellH + cellGap);
}

function drawTidbit(
  ctx: CanvasRenderingContext2D,
  g: SceneGeom,
  data: AchievementCardData,
  gridBottom: number,
): void {
  const tidbitTop = gridBottom + 36;
  ctx.save();
  rr(ctx, g.pad, tidbitTop, g.w, 132, 28);
  ctx.fillStyle = PALETTE.bgDeep;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(g.pad + 40, tidbitTop + 66);
  ctx.lineTo(g.pad + 60, tidbitTop + 40);
  ctx.lineTo(g.pad + 60, tidbitTop + 92);
  ctx.closePath();
  ctx.fillStyle = PALETTE.gold;
  ctx.fill();

  ctx.font = "500 24px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.ink;

  const maxTextW = g.w - 128;
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
  // Maks 2 baris muat di kotak 132px: gabung luapan ke baris 2 + elipsis.
  if (lines.length > 2) {
    let merged = lines.slice(1).join(" ");
    while (merged.length > 1 && ctx.measureText(`${merged}…`).width > maxTextW) {
      merged = merged.slice(
        0,
        merged.lastIndexOf(" ") > 0 ? merged.lastIndexOf(" ") : merged.length - 1,
      );
    }
    lines.splice(1, lines.length - 1, `${merged}…`);
  }
  ctx.fillStyle = PALETTE.muted;
  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillText("TAHUKAH KAMU?", g.pad + 76, tidbitTop + 34);
  ctx.font = "500 24px Inter, sans-serif";
  ctx.fillStyle = PALETTE.ink;
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, g.pad + 76, tidbitTop + 72 + i * 32);
  });
  ctx.restore();
}

function drawFooter(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.font = "500 26px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText("CAKSARA • Web Edukasi Aksara Bali", CARD_W / 2, CARD_H - 60);
  ctx.restore();
}

export function pickTidbit(): string {
  return TIDBITS[Math.floor(Math.random() * TIDBITS.length)];
}
