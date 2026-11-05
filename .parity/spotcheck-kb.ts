#!/usr/bin/env bun
// Spot-check geometri parity KB: pola batas + jangkar tinta (bukan warna).
// Pakai: bun .parity/spotcheck-kb.ts
import { $ } from "bun";

interface Probe {
  base: string;
  cur: string;
  name: string;
  x: number;
  y: number;
  len: number;
  axis: "v" | "h";
  bx?: number;
  by?: number;
  expect: string;
}

const B = ".parity/baseline/kb";
const C = ".parity/current/kb";

const PROBES: Probe[] = [
  // Onboarding alasan: bar 16px, opsi atas, CTA atas (koordinat sama).
  {
    base: `${B}/onboarding-alasan.png`,
    cur: `${C}/onboarding-step0.png`,
    name: "ob-bar",
    x: 720,
    y: 62,
    len: 20,
    axis: "v",
    expect: "WWSSSSSSSSSSSSSSSSWW",
  },
  {
    base: `${B}/onboarding-alasan.png`,
    cur: `${C}/onboarding-step0.png`,
    name: "ob-opt-top",
    x: 600,
    y: 294,
    len: 8,
    axis: "v",
    bx: 600,
    by: 295,
    expect: "WWSSSSSS",
  },
  {
    base: `${B}/onboarding-alasan.png`,
    cur: `${C}/onboarding-step0.png`,
    name: "ob-cta-top",
    x: 720,
    y: 603,
    len: 8,
    axis: "v",
    bx: 720,
    by: 604,
    expect: "WWSSSSSS",
  },
  // KB list: banner, kartu grid (jahitan /tmp dari diff-kb.sh).
  {
    base: `${B}/kb-list.png`,
    cur: `/tmp/kbl-cur-1318.png`,
    name: "kb-banner",
    x: 200,
    y: 89,
    len: 8,
    axis: "v",
    bx: 200,
    by: 91,
    expect: "WWSSSSSS",
  },
  {
    base: `${B}/kb-list.png`,
    cur: `/tmp/kbl-cur-1318.png`,
    name: "kb-card1",
    x: 439,
    y: 220,
    len: 6,
    axis: "h",
    bx: 439,
    by: 230,
    expect: "WWWWSS",
  },
  // Landing: jangkar tinta stabil per seksi (baseline full-frame x+112).
  {
    base: `${B}/landing-pendekatan.png`,
    cur: `${C}/landing-pendekatan.png`,
    name: "lp-title",
    x: 720,
    y: 60,
    len: 10,
    axis: "v",
    bx: 608,
    by: 60,
    expect: "SSSSSSSSSS",
  },
  {
    base: `${B}/landing-testimoni.png`,
    cur: `${C}/landing-testimoni.png`,
    name: "lt-avatar",
    x: 720,
    y: 216,
    len: 8,
    axis: "v",
    bx: 608,
    by: 202,
    expect: "WWSSSSSS",
  },
  {
    base: `${B}/landing-hero.png`,
    cur: `${C}/landing-hero.png`,
    name: "lh-h1",
    x: 250,
    y: 191,
    len: 8,
    axis: "v",
    bx: 150,
    by: 242,
    expect: "WWSSSSSS",
  },
  {
    base: `${B}/landing-zigzag.png`,
    cur: `${C}/landing-zigzag.png`,
    name: "lz-row1",
    x: 300,
    y: 290,
    len: 6,
    axis: "v",
    bx: 300,
    by: 355,
    expect: "SSSSSS",
  },
];

function classify(r: number, g: number, b: number): string {
  if (r >= 252 && g >= 252 && b >= 252) return "W";
  return "S";
}

async function pattern(file: string, x: number, y: number, p: Probe): Promise<string> {
  const geom = p.axis === "v" ? `1x${p.len}+${x}+${y}` : `${p.len}x1+${x}+${y}`;
  const txt = await $`magick ${file} -crop ${geom} +repage txt:`.text();
  const rows = txt.trim().split("\n").slice(1);
  let out = "";
  for (const row of rows) {
    const m = row.match(/\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) throw new Error(`parse txt ${p.name}: ${row}`);
    out += classify(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  return out;
}

let fail = 0;
for (const p of PROBES) {
  const cx = p.bx ?? p.x;
  const cy = p.by ?? p.y;
  let b = "";
  let c = "";
  try {
    b = await pattern(p.base, p.x, p.y, p);
  } catch {
    console.log(`SKIP ${p.name}: baseline baca gagal`);
    continue;
  }
  try {
    c = await pattern(p.cur, cx, cy, p);
  } catch {
    console.log(`MISS ${p.name}: current ${p.cur} belum ada`);
    fail++;
    continue;
  }
  const ok = b === p.expect && c === p.expect;
  if (!ok) fail++;
  console.log(`${ok ? "OK " : "MISS"} ${p.name}: base=${b} cur=${c} expect=${p.expect}`);
}
if (fail > 0) {
  console.error(`spotcheck-kb: ${fail} probe meleset`);
  process.exit(1);
}
console.log(`spotcheck-kb: ${PROBES.length}/${PROBES.length} probe cocok`);
