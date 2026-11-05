#!/usr/bin/env bun
// Spot-check geometri hasil: bandingkan POLA batas (bukan warna) antara
// baseline Pencil dan screenshot implementasi. Koordinat boleh berbeda
// base vs cur (offset tercatat, mis. pill V11a +26px di lulus); yang
// dibandingkan adalah bentuknya. Keluar 1 bila ada probe meleset.
// Pakai: bun .parity/spotcheck-hasil.ts
// Kalibrasi: bun .parity/spotcheck-hasil.ts --calibrate
import { $ } from "bun";

interface Probe {
  name: string;
  file: string;
  axis: "v" | "h";
  bx: number;
  by: number;
  cx: number;
  cy: number;
  len: number;
  expect: string;
}

const W = "W"; // putih terang (>=250 semua)
const S = "S"; // lain (teks/stroke/foto/warna)

function classify(r: number, g: number, b: number): string {
  if (r >= 250 && g >= 250 && b >= 250) return W;
  return S;
}
const BASE_DIR = ".parity/baseline/hasil";
const CUR_DIR = ".parity/current";

const PROBES: Probe[] = [
  // Lulus (Z8nXI): hero offset 0; tombol +29 (pill V11a, opsi B).
  {
    name: "lulus-statsTop",
    file: "lulus",
    axis: "v",
    bx: 712,
    by: 359,
    cx: 712,
    cy: 359,
    len: 9,
    expect: "WWWWWWWWS",
  },
  {
    name: "lulus-ringL",
    file: "lulus",
    axis: "h",
    bx: 648,
    by: 423,
    cx: 648,
    cy: 423,
    len: 9,
    expect: "WWWWSSSSS",
  },
  {
    name: "lulus-ringR",
    file: "lulus",
    axis: "h",
    bx: 768,
    by: 423,
    cx: 768,
    cy: 423,
    len: 9,
    expect: "SSSSWWWWW",
  },
  {
    name: "lulus-xpL",
    file: "lulus",
    axis: "h",
    bx: 784,
    by: 422,
    cx: 784,
    cy: 422,
    len: 9,
    expect: "WWWWSSSSS",
  },
  {
    name: "lulus-btnTop",
    file: "lulus",
    axis: "v",
    bx: 576,
    by: 700,
    cx: 576,
    cy: 730,
    len: 9,
    expect: "WWWSSWWWW",
  },
  // Gagal (HK0rs): stats -1; ring +2 tengah; tombol -10 (desc 1-vs-2 baris).
  {
    name: "gagal-statsTop",
    file: "gagal",
    axis: "v",
    bx: 700,
    by: 391,
    cx: 700,
    cy: 390,
    len: 9,
    expect: "WWWWWWSSS",
  },
  {
    name: "gagal-ringL",
    file: "gagal",
    axis: "h",
    bx: 632,
    by: 452,
    cx: 632,
    cy: 454,
    len: 9,
    expect: "WWWWWWWWS",
  },
  {
    name: "gagal-ringR",
    file: "gagal",
    axis: "h",
    bx: 752,
    by: 452,
    cx: 752,
    cy: 454,
    len: 9,
    expect: "SSSSSSSSW",
  },
  // Resume (A8B2n): CTA +4 (sub tanggal).
  {
    name: "resume-ctaTop",
    file: "resume",
    axis: "v",
    bx: 720,
    by: 582,
    cx: 720,
    cy: 586,
    len: 9,
    expect: "WWWWSSSSS",
  },
];

const BASE_FILE: Record<string, string> = {
  lulus: `${BASE_DIR}/Z8nXI.png`,
  gagal: `${BASE_DIR}/HK0rs.png`,
  resume: `${BASE_DIR}/A8B2n.png`,
};
const CUR_FILE: Record<string, string> = {
  lulus: `${CUR_DIR}/hasil-lulus.png`,
  gagal: `${CUR_DIR}/hasil-gagal.png`,
  resume: `${CUR_DIR}/hasil-resume.png`,
};

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
let fail = 0;
for (const p of PROBES) {
  const b = await pattern(BASE_FILE[p.file]!, p.bx, p.by, p.len, p.axis);
  const c = await pattern(CUR_FILE[p.file]!, p.cx, p.cy, p.len, p.axis);
  if (calibrate) {
    console.log(`${p.name}: base=${b} cur=${c} ${b === c ? "SAMA" : "BEDA"}`);
  } else {
    const ok = b === p.expect && c === p.expect;
    if (!ok) fail++;
    console.log(`${ok ? "OK " : "MISS"} ${p.name}: base=${b} cur=${c} expect=${p.expect}`);
  }
}
if (!calibrate) {
  if (fail > 0) {
    console.error(`spotcheck-hasil: ${fail} probe meleset`);
    process.exit(1);
  }
  console.log(`spotcheck-hasil: ${PROBES.length}/${PROBES.length} probe cocok`);
}
