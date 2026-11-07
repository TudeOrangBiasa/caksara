#!/usr/bin/env node
// Gate ukuran diff vs base (CODING_STANDARDS §11): PR normal < 800 baris total.
// Di atas itu wajib pecah atau minta pengecualian eksplisit (--allow-huge="alasan").
// WHY lokal: cegah diff raksasa (+39k/-230) yang tak bisa direview manusia.
// Binary (png/webm/dll) dihitung per file, bukan per baris.
import { execSync } from "node:child_process";

const MAX_TOTAL = Number(process.env.MAX_DIFF_LINES ?? 800);
const MAX_FILES = Number(process.env.MAX_DIFF_FILES ?? 25);
// Bukti visual (docs/proof, .verify) + lockfile/generated tak dihitung:
// PR visual wajar bawa png proof, dan bump dep wajar sentuh bun.lock.
// Yang dibatasi = kode reviewable manusia.
const EXCLUDE = ["docs/proof/**", ".verify/**", "bun.lock", "**/*.tsbuildinfo"];
const EX_ARGS = EXCLUDE.map((p) => `':!${p}'`).join(" ");

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

const allowHuge = process.argv.find((a) => a.startsWith("--allow-huge="));
if (allowHuge) {
  console.log(
    `✓ Diff gate dilewati eksplisit: ${allowHuge.slice("--allow-huge=".length).slice(0, 120)}`,
  );
  process.exit(0);
}

const rawArgs = process.argv.slice(2).filter((a) => !a.startsWith("--allow-huge"));
const base = rawArgs[0] ?? "origin/main";
let committed = "";
try {
  sh(`git rev-parse --verify ${base}`);
  committed = sh(`git diff --numstat ${base}...HEAD -- . ${EX_ARGS}`);
} catch {
  committed = ""; // tanpa base: lewati diff ter-commit
}
// Kerja belum commit tak terlihat di `base...HEAD` — gabungkan working tree
// + staged agar gate menangkap diff raksasa SEBELUM commit/push.
const uncommitted =
  sh(`git diff --numstat -- . ${EX_ARGS}`) +
  "\n" +
  sh(`git diff --cached --numstat -- . ${EX_ARGS}`);
const stat = [committed, uncommitted].join("\n");
let added = 0;
let deleted = 0;
let binaries = 0;
const files = stat.split("\n").filter(Boolean);
for (const line of files) {
  const [a, d] = line.split("\t");
  if (a === "-" || d === "-") binaries += 1;
  else {
    added += Number(a);
    deleted += Number(d);
  }
}
const total = added + deleted;

const summary = `+${added}/-${deleted} baris teks, ${binaries} file biner, ${files.length} file`;
if (files.length > MAX_FILES || total > MAX_TOTAL) {
  console.error(`✖ Diff terlalu besar: ${summary} (batas ${MAX_FILES} file / ${MAX_TOTAL} baris)`);
  console.error('  Pecah PR per tiket/seam, atau jalankan dengan --allow-huge="alasan jelas"');
  // Tampilkan 5 file terbesar agar pemecahan konkret.
  const bySize = files
    .map((line) => {
      const [a, d, f] = line.split("\t");
      return { f, n: a === "-" ? "biner" : Number(a) + Number(d) };
    })
    .sort((x, y) => (typeof y.n === "number" && typeof x.n === "number" ? y.n - x.n : 0))
    .slice(0, 5);
  for (const { f, n } of bySize) console.error(`    ${n}: ${f}`);
  process.exit(1);
}
console.log(`✓ Diff gate: ${summary}`);
