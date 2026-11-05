#!/usr/bin/env bun
// Parity KB: screenshot kb-list, 5 onboarding, 6 seksi landing.
// Pakai: bun .parity/shoot-kb.ts [port]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const port = process.argv[2] ?? "5198";
const BASE = `http://localhost:${port}`;
const DIR = new URL("./current/kb/", import.meta.url).pathname;
const KILL_ANIM =
  "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}";

async function main(): Promise<void> {
  mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1027 },
    deviceScaleFactor: 1,
    locale: "id-ID",
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    localStorage.setItem("vite-ui-theme", "light");
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // Onboarding: 4 langkah + sukses (fresh profile).
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Lewati" }).waitFor();
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "Lewati" }).first().focus();
    await page.addStyleTag({ content: KILL_ANIM });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${DIR}onboarding-step${i}.png` });
    if (i === 3) {
      await page.getByPlaceholder("Misal: Putu, Wayan, Made...").fill("Made");
    }
    await page.getByRole("button", { name: i === 3 ? "Selesai" : "Lanjut" }).click();
    await page.waitForTimeout(800);
  }
  await page.addStyleTag({ content: KILL_ANIM });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}onboarding-ready.png` });
  await page.getByRole("button", { name: /Mulai Petualangan/u }).click();
  await page.waitForTimeout(1500);
  const skipSave = page.getByRole("button", { name: "Lewati dulu" });
  if ((await skipSave.count()) > 0) await skipSave.click();
  await page.waitForTimeout(1200);

  // KB list: full page (baseline 1440x1318).
  await page.getByRole("button", { name: "KB", exact: true }).click();
  await page.waitForSelector("text=Basis Pengetahuan");
  await page.waitForTimeout(1200);
  await page.addStyleTag({ content: KILL_ANIM });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}kb-list.png`, fullPage: true });

  // Landing sections: scroll tiap seksi ke atas viewport lalu crop.
  await page.getByRole("button", { name: "Beranda", exact: true }).click();
  await page.waitForTimeout(1200);
  await page.addStyleTag({ content: KILL_ANIM });
  await page.waitForTimeout(300);
  const sections = ["hero", "pendekatan", "zigzag", "testimoni", "faq", "cta-footer"];
  for (const s of sections) {
    const el = page.locator(`[data-parity="${s}"]`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await el.screenshot({ path: `${DIR}landing-${s}.png` });
  }

  await context.close();
  await browser.close();
  console.log(`shot: ${DIR}`);
}

await main();
