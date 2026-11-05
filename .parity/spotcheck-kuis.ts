#!/usr/bin/env bun
// Spot-check posisi geometri kuis #157: bandingkan POLA batas
// (bukan warna) antara baseline Pencil dan screenshot implementasi.
// Keluar 1 bila ada probe meleset.
// Pakai: bun .parity/spotcheck-kuis.ts
import { $ } from "bun";

interface Probe {
  name: string;
  base: string;
  cur: string;
  x: number;
  y: number;
  len: number;
  axis: "v" | "h";
  /** Pola baseline sebagai string klasifikasi per piksel. */
  expect: string;
}

const B = ".parity/baseline/kuis";
const C = ".parity/current";
const BASE_SOAL = `${B}/rjbif-kuis-soal2.png`;
const CUR_SOAL = `${C}/kuis-soal1.png`;
const BASE_MATCH = `${B}/g6deu-kuis-pasangan.png`;
const CUR_MATCH = `${C}/kuis-soal2.png`;

const W = "W"; // putih terang (>=252 semua)
const S = "S"; // lain (stroke/teks/segmen terisi)

function classify(r: number, g: number, b: number): string {
  if (r >= 252 && g >= 252 && b >= 252) return W;
  return S;
}

// Semua probe di kolom bersih glyph (x800 soal, x560/x850 cocokkan)
// agar yang diuji murni batas geometri, bukan bentuk font.
const PROBES: Probe[] = [
  {
    name: "seg1",
    base: BASE_SOAL,
    cur: CUR_SOAL,
    x: 570,
    y: 28,
    len: 16,
    axis: "v",
    expect: "SSSSSSSSSSSSSSSS",
  },
  {
    name: "segGapW",
    base: BASE_SOAL,
    cur: CUR_SOAL,
    x: 636,
    y: 20,
    len: 10,
    axis: "v",
    expect: "WWWWWWWWWW",
  },
  {
    name: "optATop",
    base: BASE_SOAL,
    cur: CUR_SOAL,
    x: 800,
    y: 128,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
  {
    name: "optBTop",
    base: BASE_SOAL,
    cur: CUR_SOAL,
    x: 800,
    y: 200,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
  {
    name: "optCTop",
    base: BASE_SOAL,
    cur: CUR_SOAL,
    x: 800,
    y: 272,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
  {
    name: "optDTop",
    base: BASE_SOAL,
    cur: CUR_SOAL,
    x: 800,
    y: 344,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
  {
    name: "rowGapAB",
    base: BASE_SOAL,
    cur: CUR_SOAL,
    x: 800,
    y: 196,
    len: 4,
    axis: "v",
    expect: "WWWW",
  },
  {
    name: "mLTop",
    base: BASE_MATCH,
    cur: CUR_MATCH,
    x: 560,
    y: 128,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
  {
    name: "mLMid",
    base: BASE_MATCH,
    cur: CUR_MATCH,
    x: 560,
    y: 200,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
  {
    name: "mLBot",
    base: BASE_MATCH,
    cur: CUR_MATCH,
    x: 560,
    y: 272,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
  {
    name: "mRTop",
    base: BASE_MATCH,
    cur: CUR_MATCH,
    x: 850,
    y: 128,
    len: 6,
    axis: "v",
    expect: "WWSSWW",
  },
];

async function pattern(file: string, p: Probe): Promise<string> {
  const geom = p.axis === "v" ? `1x${p.len}+${p.x}+${p.y}` : `${p.len}x1+${p.x}+${p.y}`;
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
  const b = await pattern(p.base, p);
  const c = await pattern(p.cur, p);
  const okBase = b === p.expect;
  const okCur = c === p.expect;
  const status = okBase && okCur ? "OK " : "MISS";
  if (!okBase || !okCur) fail++;
  console.log(`${status} ${p.name}: base=${b} cur=${c} expect=${p.expect}`);
}
if (fail > 0) {
  console.error(`spotcheck-kuis: ${fail} probe meleset`);
  process.exit(1);
}
console.log(`spotcheck-kuis: ${PROBES.length}/${PROBES.length} probe cocok`);
