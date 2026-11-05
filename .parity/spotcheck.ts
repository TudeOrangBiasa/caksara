#!/usr/bin/env bun
// Spot-check posisi geometri: bandingkan POLA batas (bukan warna) antara
// baseline Pencil dan screenshot implementasi. Keluar 1 bila ada probe meleset.
// Pakai: bun .parity/spotcheck.ts [current.png]
import { $ } from "bun";

const BASE = ".parity/baseline/modul-detail/gd8af-modul-detail.png";
const CUR = process.argv[2] ?? ".parity/current/modul-detail.png";

interface Probe {
  name: string;
  x: number;
  y: number;
  len: number;
  axis: "v" | "h";
  /** Pola baseline sebagai string klasifikasi per piksel. */
  expect: string;
}

const W = "W"; // putih terang (>=252 semua)
const K = "K"; // krem Pencil (hanya baseline)
const S = "S"; // lain (stroke/teks/foto/hijau/muted)

function classify(r: number, g: number, b: number): string {
  if (r >= 252 && g >= 252 && b >= 252) return W;
  if (r >= 245 && g >= 238 && b >= 228) return K;
  return S;
}

const PROBES: Probe[] = [
  { name: "heroL", x: 108, y: 100, len: 9, axis: "h", expect: "WWWWSSSSS" },
  { name: "row1top", x: 400, y: 340, len: 9, axis: "v", expect: "WWWSSWWWW" },
  { name: "row1bot", x: 400, y: 403, len: 11, axis: "v", expect: "WWWSSSSWWWW" },
  { name: "rowL", x: 131, y: 370, len: 9, axis: "h", expect: "WWWWSSWWW" },
  { name: "rowR", x: 907, y: 370, len: 9, axis: "h", expect: "WWWWSSWWW" },
  { name: "cardB", x: 400, y: 596, len: 9, axis: "v", expect: "WWSSSSKKK" },
  { name: "ctaAbove", x: 1270, y: 268, len: 3, axis: "v", expect: "WWW" },
  { name: "ctaFull", x: 1270, y: 272, len: 7, axis: "v", expect: "SSSSSSS" },
  { name: "badge", x: 1148, y: 40, len: 9, axis: "v", expect: "WWWWKKKKK" },
  { name: "pill1", x: 1148, y: 116, len: 9, axis: "v", expect: "WWWWKKKKK" },
  { name: "sideB", x: 1148, y: 379, len: 9, axis: "v", expect: "WWSSSSKKK" },
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

/** Samakan K (krem baseline) dengan W/S current: K diperlakukan sebagai W. */
function norm(s: string): string {
  return s.replaceAll(K, W);
}

let fail = 0;
for (const p of PROBES) {
  const b = await pattern(BASE, p);
  const c = await pattern(CUR, p);
  const okBase = norm(b) === norm(p.expect);
  const okCur = norm(c) === norm(p.expect);
  const status = okBase && okCur ? "OK " : "MISS";
  if (!okBase || !okCur) fail++;
  console.log(`${status} ${p.name}: base=${b} cur=${c} expect=${p.expect}`);
}
if (fail > 0) {
  console.error(`spotcheck: ${fail} probe meleset`);
  process.exit(1);
}
console.log(`spotcheck: ${PROBES.length}/${PROBES.length} probe cocok`);
