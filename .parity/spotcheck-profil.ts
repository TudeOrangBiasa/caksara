#!/usr/bin/env bun
// Spot-check geometri profil: bandingkan POLA batas (bukan warna) antara
// baseline Pencil dan screenshot implementasi. Profil: koordinat sama
// persis (offset 0). League-card: kartu di dalam halaman Profil sehingga
// tiap probe punya offset tercatat (+178/+34, toleransi 0).
// Pakai: bun .parity/spotcheck-profil.ts
// Kalibrasi: bun .parity/spotcheck-profil.ts --calibrate
import { $ } from "bun";

interface Probe {
  name: string;
  file: "profil" | "league";
  axis: "v" | "h";
  bx: number;
  by: number;
  cx: number;
  cy: number;
  len: number;
  expect: string;
}
const W = "W"; // putih terang (>=250 semua)
const K = "K"; // abu/latar terang Pencil (>=235 semua): body #F7F9FC, border #EDEFF3
const S = "S"; // lain (teks/stroke/foto/warna)

function classify(r: number, g: number, b: number): string {
  if (r >= 250 && g >= 250 && b >= 250) return W;
  if (r >= 235 && g >= 235 && b >= 235) return K;
  return S;
}

const BASE_FILE: Record<Probe["file"], string> = {
  profil: ".parity/baseline/profil/txwuy-profil.png",
  league: ".parity/baseline/profil/t8bakt-leaderboard.png",
};
const CUR_FILE: Record<Probe["file"], string> = {
  profil: ".parity/current/profil.png",
  league: ".parity/current/leaderboard.png",
};

const PROBES: Probe[] = [
  // Profil same-coord: tepi kiri hero foto (x 112, y 200). Latar base K
  // dinorm ke W (modul-detail pattern: krem Pencil vs putih SSOT).
  {
    name: "profil-heroL",
    file: "profil",
    axis: "h",
    bx: 108,
    by: 200,
    cx: 108,
    cy: 200,
    len: 9,
    expect: "WWWWSSSSS",
  },
  // Profil: atas kartu streak, offset cur +1px tercatat (kartu cur y93, base y92).
  {
    name: "profil-streakTop",
    file: "profil",
    axis: "v",
    bx: 900,
    by: 88,
    cx: 900,
    cy: 89,
    len: 9,
    expect: "WWWWSSSSS",
  },
  // League offset +179/+35: tepi kiri R1.
  {
    name: "league-r1L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 332,
    cx: 495,
    cy: 347,
    len: 9,
    expect: "WWWSSSSSS",
  },
  // League offset +179/+35: tepi kiri R7 (mine).
  {
    name: "league-r7L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 776,
    cx: 495,
    cy: 815,
    len: 9,
    expect: "WWWSSSSSS",
  },
  // League offset +179/+35: tepi kiri R2 (fill #F4F6F8 = K).
  {
    name: "league-r2L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 406,
    cx: 495,
    cy: 425,
    len: 9,
    expect: "WWWSSKKKK",
  },
  // League offset +179/+35: tepi kiri R3.
  {
    name: "league-r3L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 480,
    cx: 495,
    cy: 503,
    len: 9,
    expect: "WWWSSSSSS",
  },
  // League offset +179/+35: tepi kiri R4 (border #EDEFF3 = K).
  {
    name: "league-r4L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 554,
    cx: 495,
    cy: 581,
    len: 9,
    expect: "WWWKKWWWW",
  },
  // League offset +179/+35: tepi kiri R5.
  {
    name: "league-r5L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 628,
    cx: 495,
    cy: 659,
    len: 9,
    expect: "WWWKKWWWW",
  },
  // League offset +179/+35: tepi kiri R6.
  {
    name: "league-r6L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 702,
    cx: 495,
    cy: 737,
    len: 9,
    expect: "WWWKKWWWW",
  },
  // League offset +179/+35: tepi kiri R8.
  {
    name: "league-r8L",
    file: "league",
    axis: "h",
    bx: 316,
    by: 850,
    cx: 495,
    cy: 893,
    len: 9,
    expect: "WWWKKWWWW",
  },
];

async function pattern(
  file: string,
  x: number,
  y: number,
  len: number,
  axis: "v" | "h",
): Promise<string> {
  const geom = axis === "v" ? `1x${len}+${x}+${y}` : `${len}x1+${x}+${y}`;
  const txt = await $`magick ${file} -crop ${geom} +repage txt:`.text();
  const rows = txt.trim().split("\n").slice(1);
  let out = "";
  for (const row of rows) {
    const m = row.match(/\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) throw new Error(`parse txt: ${row}`);
    out += classify(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  return out;
}

const calibrate = process.argv.includes("--calibrate");

/** Samakan K (krem/latar Pencil) dengan W current: K diperlakukan sebagai W. */
function norm(s: string): string {
  return s.replaceAll(K, W);
}

let fail = 0;
for (const p of PROBES) {
  const b = await pattern(BASE_FILE[p.file], p.bx, p.by, p.len, p.axis);
  const c = await pattern(CUR_FILE[p.file], p.cx, p.cy, p.len, p.axis);
  if (calibrate) {
    console.log(`${p.name}: base=${b} cur=${c} ${norm(b) === norm(c) ? "SAMA" : "BEDA"}`);
  } else {
    const ok = norm(b) === norm(p.expect) && norm(c) === norm(p.expect);
    if (!ok) fail++;
    console.log(`${ok ? "OK " : "MISS"} ${p.name}: base=${b} cur=${c} expect=${p.expect}`);
  }
}
if (!calibrate) {
  if (fail > 0) {
    console.error(`spotcheck-profil: ${fail} probe meleset`);
    process.exit(1);
  }
  console.log(`spotcheck-profil: ${PROBES.length}/${PROBES.length} probe cocok`);
}
