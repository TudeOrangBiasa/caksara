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

/** 6 wajah satwa gaya IP-as-logo: siluet bulat besar di kotak solid. Semua warna dari token global. */
const SATWA: { bg: string; draw: string }[] = [
  {
    // Penyu Bedawang mini
    bg: T.cardBgDeep,
    draw:
      `<circle cx="50" cy="56" r="30" fill="${T.bedawangShell}"/>` +
      `<ellipse cx="50" cy="65" rx="17" ry="13" fill="${T.bedawangBelly}"/>` +
      eyes(40, 60, 50, 4) +
      sparkles(40, 60, 50),
  },
  {
    // Kucing
    bg: T.bedawangBlush,
    draw:
      `<path d="M28 42 L21 15 L47 29 Z" fill="${T.bedawangBelly}"/>` +
      `<path d="M72 42 L79 15 L53 29 Z" fill="${T.bedawangBelly}"/>` +
      `<path d="M31 36 L27 22 L41 30 Z" fill="${T.bedawangHeadDark}"/>` +
      `<path d="M69 36 L73 22 L59 30 Z" fill="${T.bedawangHeadDark}"/>` +
      `<circle cx="50" cy="59" r="27" fill="${T.bedawangBelly}"/>` +
      eyes(40, 60, 57, 3.5) +
      `<path d="M45 69 q5 5 10 0" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  {
    // Burung hantu
    bg: T.confetti3,
    draw:
      `<path d="M28 34 L24 18 L40 28 Z" fill="${T.bedawangShell}"/>` +
      `<path d="M72 34 L76 18 L60 28 Z" fill="${T.bedawangShell}"/>` +
      `<circle cx="50" cy="58" r="28" fill="${T.bedawangShell}"/>` +
      `<ellipse cx="50" cy="66" rx="15" ry="12" fill="${T.bedawangBelly}"/>` +
      `<circle cx="39" cy="51" r="8" fill="${PAPER}"/>` +
      `<circle cx="61" cy="51" r="8" fill="${PAPER}"/>` +
      `<circle cx="39" cy="51" r="3.5" fill="${INK}"/>` +
      `<circle cx="61" cy="51" r="3.5" fill="${INK}"/>` +
      `<path d="M45 60 L55 60 L50 66 Z" fill="${T.confetti5}"/>`,
  },
  {
    // Beruang madu
    bg: T.cardGold,
    draw:
      `<circle cx="28" cy="32" r="10" fill="${T.cardPrimaryDark}"/>` +
      `<circle cx="72" cy="32" r="10" fill="${T.cardPrimaryDark}"/>` +
      `<circle cx="28" cy="32" r="4.5" fill="${T.bedawangBelly}"/>` +
      `<circle cx="72" cy="32" r="4.5" fill="${T.bedawangBelly}"/>` +
      `<circle cx="50" cy="59" r="27" fill="${T.cardPrimary}"/>` +
      `<ellipse cx="50" cy="67" rx="13" ry="10" fill="${T.bedawangBelly}"/>` +
      `<ellipse cx="50" cy="63" rx="5" ry="4" fill="${INK}"/>` +
      eyes(39, 61, 53, 3.5),
  },
  {
    // Kelinci
    bg: T.bedawangShellEdge,
    draw:
      `<ellipse cx="37" cy="24" rx="8" ry="18" fill="${PAPER}"/>` +
      `<ellipse cx="63" cy="24" rx="8" ry="18" fill="${PAPER}"/>` +
      `<ellipse cx="37" cy="26" rx="3.5" ry="12" fill="${T.bedawangBlush}"/>` +
      `<ellipse cx="63" cy="26" rx="3.5" ry="12" fill="${T.bedawangBlush}"/>` +
      `<circle cx="50" cy="65" r="23" fill="${PAPER}"/>` +
      eyes(41, 59, 63, 3.2) +
      `<circle cx="50" cy="68" r="2.5" fill="${T.bedawangBlush}"/>`,
  },
  {
    // Jalak Bali
    bg: T.bedawangGem,
    draw:
      `<path d="M38 34 L42 16 L48 32 L54 14 L57 32 L62 36 Z" fill="${PAPER}"/>` +
      `<circle cx="50" cy="60" r="25" fill="${PAPER}"/>` +
      eyes(41, 59, 58, 3.2) +
      `<path d="M44 64 L56 64 L50 71 Z" fill="${T.confetti5}"/>` +
      `<circle cx="33" cy="66" r="3" fill="${T.bedawangBlush}"/>` +
      `<circle cx="67" cy="66" r="3" fill="${T.bedawangBlush}"/>`,
  },
];

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
  const satwa = SATWA[hashSeed(key) % SATWA.length];
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg(satwa.draw, satwa.bg))}`;
  cache.set(key, uri);
  return uri;
}
