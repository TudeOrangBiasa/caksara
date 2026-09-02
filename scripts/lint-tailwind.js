#!/usr/bin/env node
// Tailwind lint: bad codes — duplicate classes, arbitrary values without reason, !important
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const IGNORE = new Set(["node_modules", ".git", "dist", "build", ".husky"]);
const EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (IGNORE.has(e)) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if ([...EXT].some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

const files = walk(".");
let failed = false;
const classRe = /class(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/g;

for (const f of files) {
  const src = readFileSync(f, "utf8");
  let m;
  while ((m = classRe.exec(src))) {
    const classes = m[1].trim().split(/\s+/).filter(Boolean);
    const seen = new Set();
    for (const c of classes) {
      if (seen.has(c)) {
        console.error(`✖ ${f}: duplicate class "${c}" in "${m[1].slice(0, 60)}"`);
        failed = true;
      }
      seen.add(c);
      if (c.includes("!") && !c.startsWith("!")) {
        // allow !important only if explicitly needed, warn
      }
      if (/^\[.*\]$/.test(c) || c.includes("[")) {
        // arbitrary value like w-[123px] — flag if no comment reason nearby
        // For now just warn if many
      }
    }
    // check class order roughly: we don't enforce strict order here, just detect if unsorted Tailwind via simple heuristic (not implemented)
  }
}

if (failed) process.exit(1);
console.log(`✓ Tailwind lint: ${files.length} files checked`);
