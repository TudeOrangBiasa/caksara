#!/usr/bin/env bun
// Tracer parity Kuis #157: drive ke sesi kuis mod_01 attempt 0
// (checkpoint, cocokkan, dengar), screenshot viewport 1440x1024
// (sama dengan frame Pencil u78JLW/RJBIf/g6deu), simpan ke
// .parity/current/kuis-{soal1,soal1fb,soal2,soal2fb,soal3}.png.
// Pakai: bun .parity/shoot-kuis.ts [port]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const port = process.argv[2] ?? "5196";
const BASE = `http://localhost:${port}`;
const DIR = new URL("./current/", import.meta.url).pathname;

async function main(): Promise<void> {
  mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
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
  await page.getByRole("button", { name: "Lewati" }).waitFor({ timeout: 60000 });
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
  await page.getByRole("button", { name: "Mulai belajar" }).first().click();
  await page.waitForTimeout(1500);
  // Lewati materi sampai tombol "Kerjakan 3 soal" muncul.
  for (let i = 0; i < 8; i++) {
    const kerja = page.getByRole("button", { name: /Kerjakan/u });
    if ((await kerja.count()) > 0) break;
    const lanjut = page.getByRole("button", { name: /Lanjut/u });
    if ((await lanjut.count()) === 0) break;
    await lanjut.first().click();
    await page.waitForTimeout(1000);
  }
  await page.getByRole("button", { name: /Kerjakan/u }).click();
  await page.getByRole("progressbar").first().waitFor();
  await page.waitForTimeout(1200);
  // Matikan animasi + toast agar screenshot deterministik (toast sonner
  // bukan bagian kanvas Pencil; XP 600ms juga dibekukan final).
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}[data-sonner-toaster],[data-sonner-toast]{display:none!important}",
  });
  const q1 = await page.locator("h2").first().textContent();
  console.log(`soal1: ${q1}`);
  await page.screenshot({ path: `${DIR}kuis-soal1.png` });
  // Soal 1: checkpoint (jawab benar index 1).
  await page.getByRole("button", { name: /Pilihan 2/u }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}kuis-soal1fb.png` });
  // Lanjut ke soal 2 (cocokkan).
  await page.getByRole("button", { name: /Lanjut ke soal/u }).click();
  await page.waitForTimeout(600);
  const q2 = await page.locator("h2").first().textContent();
  console.log(`soal2: ${q2}`);
  await page.screenshot({ path: `${DIR}kuis-soal2.png` });
  // Cocokkan: pasang 3 pasang l/r agar kunci jawaban + feedback.
  const pairs: [string, string][] = [
    ["Aksara Om Swastiastu", "Arti Salam sejahtera"],
    ["Aksara Matur suksma", "Arti Terima kasih"],
    ["Aksara Ampura", "Arti Mohon maaf"],
  ];
  for (const [l, r] of pairs) {
    await page.getByRole("button", { name: l, exact: true }).click();
    await page.getByRole("button", { name: r, exact: true }).click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${DIR}kuis-soal2fb.png` });
  // Lanjut ke soal 3 (dengar).
  await page.getByRole("button", { name: /Lanjut ke soal/u }).click();
  await page.waitForTimeout(600);
  const q3 = await page.locator("h2").first().textContent();
  console.log(`soal3: ${q3}`);
  await page.screenshot({ path: `${DIR}kuis-soal3.png` });
  await context.close();
  await browser.close();
  console.log(`shot: ${DIR}kuis-soal{1,1fb,2,2fb,3}.png`);
  process.exit(0);
}

await main();
