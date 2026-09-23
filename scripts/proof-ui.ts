#!/usr/bin/env bun
// Screenshot/recording bukti visual PR via agent-browser (FE wajib).
// Pakai: bun run proof:ui -- <url> [outDir]
//   contoh: bun run proof:ui -- http://localhost:5173 docs/proof/contoh
// Butuh: agent-browser terinstall (lihat docs/agents/ui-proof.md).
//   belum ada? npm i -g agent-browser && agent-browser install
// Keluar: onboarding 390px + desktop 1280px (light/dark) + dashboard + rekaman webm.

import { mkdirSync, statSync } from "node:fs";
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

await $`agent-browser close --all`.quiet();
await $`agent-browser wait 1000`.quiet();
await $`agent-browser open ${url}`.quiet();
await $`agent-browser wait 3000`.quiet();
// Sesi zombie bisa about:blank — retry open sekali bila URL masih kosong.
const blankCheck = (await $`agent-browser get url`.text()).trim();
if (blankCheck === "about:blank" || blankCheck === "") {
  await $`agent-browser open ${url}`.quiet();
  await $`agent-browser wait 3000`.quiet();
}
const tabList = await $`agent-browser tab list`.text();
const tabLines = tabList.split("\n").filter((l) => l.includes("http"));
for (const line of tabLines) {
  const id = line.match(/\[(t\d+)\]/)?.[1];
  if (id && !line.includes("localhost:5173") && !line.includes("127.0.0.1:5173")) {
    await $`agent-browser tab close ${id}`.quiet();
  }
}
const curUrl = (await $`agent-browser get url`.text()).trim();
const curTitle = (await $`agent-browser get title`.text()).trim();
if (!curUrl.includes("5173") || !curTitle.includes("CAKSARA")) {
  console.error(`✖ Tab asing terdeteksi (url=${curUrl} title=${curTitle}). Hentikan proof.`);
  await $`agent-browser close --all`.quiet();
  process.exit(1);
}
// Splash ~1.5s: dialog onboarding muncul setelah wait di atas.
await $`agent-browser set viewport 390 844`.quiet();
await shot("onboarding-mobile-390.png");
await $`agent-browser set viewport 1280 800`.quiet();
await shot("onboarding-desktop-1280.png");
// App pakai next-themes attribute="class" (root.tsx): `set media` tidak ganti
// tema. Shot desktop di atas = light; paksa dark eksplisit untuk shot dark.
await $`agent-browser eval "localStorage.setItem('vite-ui-theme','dark'); document.documentElement.classList.add('dark')"`.quiet();
await $`agent-browser wait 600`.quiet();
await shot("onboarding-dark-1280.png");
await $`agent-browser record start ${outDir}/flow.webm`.quiet();
// tapi ref kadaluarsa antar-snapshot. Klik "Lewati" sekali ke layar Siap Mulai,
// lalu "Mulai Petualangan" ke dashboard. Log tiap iterasi untuk debug.
for (let i = 0; i < 4; i++) {
  const snap = await $`agent-browser snapshot`.text();
  const step = snap.match(/Langkah \d dari \d/)?.[0] ?? "no-langkah";
  if (snap.includes('button "Beranda"') && !snap.includes("Pemandu Mulai Belajar")) {
    console.log(`  walk iter${i}: dashboard tercapai`);
    break;
  }
  // find terbukti no-op di flow ini — klik via @ref langsung.
  const raw =
    snap.match(/button "Mulai Petualangan[^"]*" \[ref=(@?e\d+)\]/)?.[1] ??
    snap.match(/button "Lewati" \[ref=(@?e\d+)\]/)?.[1];
  const ref = raw?.startsWith("@") ? raw : raw ? `@${raw}` : undefined;
  console.log(`  walk iter${i}: ${step} ref=${ref ?? "none"}`);
  if (!ref) break;
  await $`agent-browser click ${ref}`.quiet();
  await $`agent-browser wait 700`.quiet();
}
await shot("dashboard-desktop-1280.png");
// Assert: dashboard harus beda file dari dark-shot (kalau sama = walk gagal,
// masih onboarding). Bandingkan ukuran file.
const darkSize = statSync(`${outDir}/onboarding-dark-1280.png`).size;
const dashSize = statSync(`${outDir}/dashboard-desktop-1280.png`).size;
console.log(`  ukuran: dark=${darkSize} dashboard=${dashSize}`);
if (darkSize === dashSize) {
  console.error("✖ Dashboard identik dengan dark-shot — walk gagal, hentikan proof.");
  await $`agent-browser close --all`.quiet();
  process.exit(1);
}
await $`agent-browser record stop`.quiet();
console.log(`✓ ${outDir}/flow.webm`);

await $`agent-browser close --all`.quiet();
console.log(`\nBukti tersimpan di ${outDir}/ — lampirkan ke PR body (## Screenshots).`);
