#!/usr/bin/env bun
// Screenshot/recording bukti visual PR via agent-browser (FE wajib).
// Pakai: bun run proof:ui -- <url> [outDir]
//   contoh: bun run proof:ui -- http://localhost:5173 docs/proof/contoh
// Butuh: agent-browser terinstall (lihat docs/agents/ui-proof.md).
//   belum ada? npm i -g agent-browser && agent-browser install
// Keluar: onboarding 390px + desktop 1280px (light/dark) + dashboard + rekaman webm.

import { mkdirSync } from "node:fs";
import { $ } from "bun";

const url = process.argv[2] ?? "http://localhost:5173";
const outDir = process.argv[3] ?? "docs/proof/manual";

try {
  await $`agent-browser --version`.quiet();
} catch {
  console.error("✖ agent-browser belum terinstall.");
  console.error("  npm i -g agent-browser && agent-browser install");
  console.error("  Panduan: docs/agents/ui-proof.md");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const shot = async (name: string) => {
  await $`agent-browser screenshot ${outDir}/${name}`.quiet();
  console.log(`✓ ${outDir}/${name}`);
};

await $`agent-browser open ${url}`.quiet();
await $`agent-browser set viewport 390 844`.quiet();
await shot("onboarding-mobile-390.png");
await $`agent-browser set viewport 1280 800`.quiet();
await shot("onboarding-desktop-1280.png");
await $`agent-browser set media dark`.quiet();
await shot("onboarding-dark-1280.png");
await $`agent-browser set media light`.quiet();

await $`agent-browser record start ${outDir}/flow.webm`.quiet();
const snap = await $`agent-browser snapshot`.text();
const nextRef = snap.match(/button "Lanjut" \[ref=(@e\d+)\]/)?.[1];
if (nextRef) await $`agent-browser click ${nextRef}`.quiet();
await shot("dashboard-desktop-1280.png");
await $`agent-browser record stop`.quiet();
console.log(`✓ ${outDir}/flow.webm`);

await $`agent-browser close --all`.quiet();
console.log(`\nBukti tersimpan di ${outDir}/ — lampirkan ke PR body (## Screenshots).`);
