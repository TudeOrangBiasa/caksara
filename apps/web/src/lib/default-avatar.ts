import { illustrationTokens as T } from "@caksara/ui/lib/tokens";

const INK = T.bedawangInk;
const PAPER = T.cardWhite;

const cache = new Map<string, string>();

function svg(inner: string, bg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="${bg}"/>${inner}</svg>`;
}

function eyes(x1: number, x2: number, y: number, r: number): string {
  return (
    `<circle cx="${x1}" cy="${y}" r="${r}" fill="${INK}"/>` +
    `<circle cx="${x2}" cy="${y}" r="${r}" fill="${INK}"/>`
  );
}

function sparkles(x1: number, x2: number, y: number): string {
  return (
    `<circle cx="${x1 + 1.2}" cy="${y - 1.2}" r="1.3" fill="${PAPER}"/>` +
    `<circle cx="${x2 + 1.2}" cy="${y - 1.2}" r="1.3" fill="${PAPER}"/>`
  );
}

function blush(x1: number, x2: number, y: number, color: string): string {
  return (
    `<ellipse cx="${x1}" cy="${y}" rx="4" ry="2.8" fill="${color}" opacity="0.8"/>` +
    `<ellipse cx="${x2}" cy="${y}" rx="4" ry="2.8" fill="${color}" opacity="0.8"/>`
  );
}

/**
 * 6 wajah satwa gaya IP-as-logo: siluet dominan, mata besar, pipi merona,
 * 3 warna per wajah. Semua warna dari token global.
 */
const SATWA: { bg: string; draw: string }[] = [
  {
    // Penyu Bedawang mini
    bg: T.cardBgDeep,
    draw:
      `<circle cx="50" cy="57" r="33" fill="${T.bedawangShell}"/>` +
      `<ellipse cx="50" cy="70" rx="20" ry="14" fill="${T.bedawangBelly}"/>` +
      eyes(38, 62, 51, 5) +
      sparkles(38, 62, 51) +
      blush(30, 70, 61, T.bedawangBelly),
  },
  {
    // Kucing
    bg: T.bedawangBlush,
    draw:
      `<path d="M26 44 L19 14 L48 30 Z" fill="${T.bedawangBelly}"/>` +
      `<path d="M74 44 L81 14 L52 30 Z" fill="${T.bedawangBelly}"/>` +
      `<path d="M30 37 L26 21 L41 30 Z" fill="${T.bedawangHeadDark}"/>` +
      `<path d="M70 37 L74 21 L59 30 Z" fill="${T.bedawangHeadDark}"/>` +
      `<circle cx="50" cy="60" r="30" fill="${T.bedawangBelly}"/>` +
      eyes(39, 61, 58, 4.5) +
      sparkles(39, 61, 58) +
      `<path d="M47 68 L53 68 L50 72 Z" fill="${T.bedawangHeadDark}"/>` +
      `<path d="M50 72 q0 4 -5 4 M50 72 q0 4 5 4" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      blush(31, 69, 66, T.bedawangBlush),
  },
  {
    // Burung hantu
    bg: T.confetti3,
    draw:
      `<path d="M27 36 L22 16 L41 28 Z" fill="${T.bedawangShell}"/>` +
      `<path d="M73 36 L78 16 L59 28 Z" fill="${T.bedawangShell}"/>` +
      `<circle cx="50" cy="59" r="31" fill="${T.bedawangShell}"/>` +
      `<ellipse cx="50" cy="72" rx="17" ry="13" fill="${T.bedawangBelly}"/>` +
      `<circle cx="38" cy="52" r="9" fill="${PAPER}"/>` +
      `<circle cx="62" cy="52" r="9" fill="${PAPER}"/>` +
      `<circle cx="38" cy="52" r="4" fill="${INK}"/>` +
      `<circle cx="62" cy="52" r="4" fill="${INK}"/>` +
      `<circle cx="39.5" cy="50.5" r="1.3" fill="${PAPER}"/>` +
      `<circle cx="63.5" cy="50.5" r="1.3" fill="${PAPER}"/>` +
      `<path d="M44 62 L56 62 L50 69 Z" fill="${T.confetti5}"/>` +
      blush(30, 70, 62, T.bedawangBelly),
  },
  {
    // Beruang madu
    bg: T.cardGold,
    draw:
      `<circle cx="27" cy="31" r="11" fill="${T.cardPrimaryDark}"/>` +
      `<circle cx="73" cy="31" r="11" fill="${T.cardPrimaryDark}"/>` +
      `<circle cx="27" cy="31" r="5" fill="${T.bedawangBelly}"/>` +
      `<circle cx="73" cy="31" r="5" fill="${T.bedawangBelly}"/>` +
      `<circle cx="50" cy="60" r="30" fill="${T.cardPrimary}"/>` +
      `<ellipse cx="50" cy="71" rx="14" ry="11" fill="${T.bedawangBelly}"/>` +
      `<ellipse cx="50" cy="67" rx="5.5" ry="4.5" fill="${INK}"/>` +
      eyes(38, 62, 55, 4.5) +
      sparkles(38, 62, 55) +
      blush(30, 70, 63, T.bedawangBelly),
  },
  {
    // Kelinci
    bg: T.bedawangShellEdge,
    draw:
      `<ellipse cx="36" cy="23" rx="9" ry="20" fill="${PAPER}"/>` +
      `<ellipse cx="64" cy="23" rx="9" ry="20" fill="${PAPER}"/>` +
      `<ellipse cx="36" cy="25" rx="4" ry="13" fill="${T.bedawangBlush}"/>` +
      `<ellipse cx="64" cy="25" rx="4" ry="13" fill="${T.bedawangBlush}"/>` +
      `<circle cx="50" cy="66" r="25" fill="${PAPER}"/>` +
      eyes(41, 59, 64, 4) +
      sparkles(41, 59, 64) +
      `<circle cx="50" cy="70" r="3" fill="${T.bedawangBlush}"/>` +
      `<rect x="47" y="74" width="6" height="5" rx="2" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>` +
      blush(33, 67, 71, T.bedawangBlush),
  },
  {
    // Jalak Bali
    bg: T.bedawangGem,
    draw:
      `<path d="M36 36 L40 14 L47 32 L53 12 L57 32 L64 36 Z" fill="${PAPER}"/>` +
      `<circle cx="50" cy="61" r="27" fill="${PAPER}"/>` +
      eyes(40, 60, 59, 4) +
      sparkles(40, 60, 59) +
      `<path d="M43 65 L57 65 L50 73 Z" fill="${T.confetti5}"/>` +
      blush(32, 68, 67, T.bedawangBlush),
  },
];

export const SATWA_NAMES = ["Penyu", "Kucing", "Hantu", "Beruang", "Kelinci", "Jalak"] as const;

export function satwaAvatarUri(index: number): string {
  const satwa = SATWA[((index % SATWA.length) + SATWA.length) % SATWA.length];
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg(satwa.draw, satwa.bg))}`;
}

function hashSeed(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Avatar default prosedural gaya IP-as-logo: wajah satwa di kotak solid,
 * stabil per nama, digenerate lokal tanpa jaringan. Pengganti inisial huruf.
 */
export function defaultAvatarUri(seed: string): string {
  const key = seed.trim() || "C";
  const hit = cache.get(key);
  if (hit) return hit;
  const uri = satwaAvatarUri(hashSeed(key));
  cache.set(key, uri);
  return uri;
}
