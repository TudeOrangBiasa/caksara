#!/usr/bin/env node
// Check no hardcoded fallback for env/API keys
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

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
const envFallbackRe = /process\.env\.\w+\s*\|\|\s*["'`]https?:\/\/[^"'`]+["'`]/u;
const keyFallbackRe = /process\.env\.\w+\s*\|\|\s*["'`][A-Za-z0-9_-]{20,}["'`]/u;
const hardcodedUrlRe = /["'`]https:\/\/[a-z0-9-]+\.supabase\.co["'`]/u;

for (const f of files) {
  if (f.endsWith("check-secrets.js")) continue;
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.trim().startsWith("//")) continue;
    const hasEnvFallback =
      line.includes("process.env") &&
      line.includes("||") &&
      line.includes("://") &&
      envFallbackRe.test(line);
    const hasKeyFallback = keyFallbackRe.test(line);
    const hasHardcodedUrl =
      hardcodedUrlRe.test(line) &&
      !line.includes("process.env") &&
      !line.trim().startsWith("//") &&
      !line.includes("example.com");
    if (hasEnvFallback) {
      console.error(
        `✖ ${f}:${idx + 1}: hardcoded fallback URL for env — throw if missing, don't use OR fallback`,
      );
      console.error(`  ${line.trim().slice(0, 120)}`);
      failed = true;
    } else if (hasKeyFallback) {
      console.error(`✖ ${f}:${idx + 1}: hardcoded fallback API key for env — throw if missing`);
      console.error(`  ${line.trim().slice(0, 120)}`);
      failed = true;
    } else if (hasHardcodedUrl) {
      console.error(`✖ ${f}:${idx + 1}: hardcoded Supabase URL — use VITE_SUPABASE_URL env`);
      console.error(`  ${line.trim().slice(0, 120)}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\nFix: if (!process.env.X) throw new Error("X missing"); — don\'t use fallback');
  process.exit(1);
}
console.log(`✓ Secrets check: ${files.length} files, no hardcoded env fallback`);
