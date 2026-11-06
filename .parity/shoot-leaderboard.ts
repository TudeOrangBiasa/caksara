#!/usr/bin/env bun
// Tracer parity Leaderboard t8BaKT: seed profil Putu + fixture 8 baris,
// drive ke Profil, scroll kartu leaderboard ke atas viewport (soal gate:
// kartu di dalam halaman Profil, bukan halaman penuh), screenshot 1440x1024.
// Pakai: bun .parity/shoot-leaderboard.ts [port]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

import { LEAGUE_FIXTURE, profilSeed } from "./fixture-profil";

const port = process.argv[2] ?? "5291";
const BASE = `http://127.0.0.1:${port}`;
const OUT = new URL("./current/leaderboard.png", import.meta.url).pathname;

async function main(): Promise<void> {
  mkdirSync(new URL("./current/", import.meta.url).pathname, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
    locale: "id-ID",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  await context.addInitScript(
    ({ seed, league }: { seed: Record<string, string>; league: string }) => {
      for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
      localStorage.setItem("caksara.parity-league.v1", league);
    },
    { seed: profilSeed(), league: JSON.stringify(LEAGUE_FIXTURE) },
  );
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Profil", exact: true }).first().click();
  await page.waitForSelector("text=Koleksi Lencana");
  await page.getByText("Putu 777", { exact: false }).first().waitFor();
  await page.waitForTimeout(1200);
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" +
      "[data-sonner-toaster],[data-sonner-toast]{display:none!important}",
  });
  await page.waitForTimeout(400);
  await page
    .getByRole("region", { name: "Papan peringkat" })
    .or(page.locator("section[aria-label='Papan peringkat']"))
    .first()
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT });
  await context.close();
  await browser.close();
  console.log(`shot: ${OUT}`);
}

await main();
