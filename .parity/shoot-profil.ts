#!/usr/bin/env bun
// Tracer parity Profil tXwUy: seed profil Putu deterministik, drive ke
// Profil, screenshot 1440x1250. Onboarding dilewati otomatis karena
// profil sudah ada (hadProfile). Leaderboard kosong (mode lokal tanpa
// Supabase) karena profil shot fokus kartu atas.
// Pakai: bun .parity/shoot-profil.ts [port]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

import { profilSeed } from "./fixture-profil";

const port = process.argv[2] ?? "5291";
const BASE = `http://127.0.0.1:${port}`;
const OUT = new URL("./current/profil.png", import.meta.url).pathname;

async function main(): Promise<void> {
  mkdirSync(new URL("./current/", import.meta.url).pathname, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1250 },
    deviceScaleFactor: 1,
    locale: "id-ID",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  await context.addInitScript((seed: Record<string, string>) => {
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
  }, profilSeed());
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Profil", exact: true }).first().click();
  await page.waitForSelector("text=Koleksi Lencana");
  await page.waitForTimeout(1500);
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" +
      "[data-sonner-toaster],[data-sonner-toast]{display:none!important}",
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT });
  await context.close();
  await browser.close();
  console.log(`shot: ${OUT}`);
}

await main();
