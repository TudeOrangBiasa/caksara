#!/usr/bin/env bun
// Tracer parity Leaderboard t8BaKT: ProfilPage diisi fixture 8 baris,
// scroll ke kartu leaderboard, screenshot 1440x1024.
// Pakai: bun .parity/shoot-leaderboard.ts [port]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

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
  await context.addInitScript(() => {
    localStorage.setItem("vite-ui-theme", "light");
  });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Lewati" }).waitFor();
  await page.getByRole("button", { name: "Lewati" }).click();
  await page.getByRole("button", { name: /Mulai Petualangan/u }).click();
  await page.waitForTimeout(1500);
  const skipSave = page.getByRole("button", { name: "Lewati dulu" });
  if ((await skipSave.count()) > 0) await skipSave.click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Profil", exact: true }).first().click();
  await page.waitForSelector("text=Koleksi Lencana");
  await page.waitForTimeout(1200);
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}",
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT });
  await context.close();
  await browser.close();
  console.log(`shot: ${OUT}`);
}

await main();
