#!/usr/bin/env bun
// Ukur getBoundingClientRect elemen kunci halaman Detail Modul 1.
// Pakai: bun .parity/measure-modul-detail.ts 5195
import { chromium } from "playwright-core";

const port = process.argv[2] ?? "5195";
const BASE = `http://localhost:${port}`;

async function main(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1016 },
    deviceScaleFactor: 1,
    locale: "id-ID",
  });
  await context.addInitScript(() => {
    localStorage.setItem("vite-ui-theme", "light");
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
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

  const rects = await page.evaluate(() => {
    const fmt = (el: Element) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: Math.round(r.x * 10) / 10,
        y: Math.round(r.y * 10) / 10,
        w: Math.round(r.width * 10) / 10,
        h: Math.round(r.height * 10) / 10,
        lh: cs.lineHeight,
        fs: cs.fontSize,
        t: (el.textContent ?? "").trim().slice(0, 34),
      };
    };
    const q = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? fmt(el) : null;
    };
    const qa = (sel: string) => [...document.querySelectorAll(sel)].map(fmt);
    // Grid children: [1]=back(hidden desktop), [2]=left, [3]=side, [4]=sticky(hidden)
    const L = "main > div > div:nth-child(2)";
    const S = "main > div > div:nth-child(3)";
    return {
      font: getComputedStyle(document.body).fontFamily.slice(0, 80),
      hero: q(`${L} > div:first-child`),
      kicker: q(`${L} p`),
      title: q(`${L} h1`),
      desc: qa(`${L} > div:first-child p`),
      card: q(`${L} > div:nth-child(2)`),
      label: q(`${L} > div:nth-child(2) > p`),
      rows: qa(`${L} > div:nth-child(2) > div > div`),
      side: q(S),
      sideKids: qa(`${S} > *`),
    };
  });
  console.log(JSON.stringify(rects, null, 1));
  await context.close();
  await browser.close();
}

await main();
