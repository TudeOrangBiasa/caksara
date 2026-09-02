#!/usr/bin/env node
// Check max LOC < 1000 per file (CODING_STANDARDS §1)
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const MAX_LOC = 1000;
const IGNORE = new Set(["node_modules", ".git", "dist", "build", ".husky", "bun.lock"]);
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
for (const f of files) {
  const loc = readFileSync(f, "utf8").split("\n").length;
  if (loc > MAX_LOC) {
    console.error(`✖ ${f}: ${loc} LOC > ${MAX_LOC} (split by feature/seam)`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`✓ LOC check: ${files.length} files < ${MAX_LOC}`);
