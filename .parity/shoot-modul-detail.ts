#!/usr/bin/env bun
// Tracer parity Modul Detail Gd8Af: drive ke Detail Modul 1, screenshot
// viewport 1440x1016 (sama dengan frame Pencil), simpan ke .parity/current/.
// Pakai: bun .parity/shoot-modul-detail.ts [port]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const port = process.argv[2] ?? "5195";
const BASE = `http://localhost:${port}`;
const OUT = new URL("./current/modul-detail.png", import.meta.url).pathname;

async function main(): Promise<void> {
  mkdirSync(new URL("./current/", import.meta.url).pathname, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1016 },
    deviceScaleFactor: 1,
    locale: "id-ID",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  // Baseline Pencil adalah light; paksa light agar parity apple-to-apple.
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
  await page.getByRole("button", { name: "Belajar", exact: true }).click();
  await page.waitForSelector("text=Daftar modul");
  await page.locator("ol button").first().click();
  await page.getByRole("button", { name: "Mulai belajar" }).first().waitFor();
  await page.waitForTimeout(1500);
  // Matikan animasi agar screenshot deterministik.
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
