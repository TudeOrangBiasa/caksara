#!/usr/bin/env bun
// Tracer parity Hasil Z8nXI/HK0rs/A8B2n: screenshot 3 layar (lulus, gagal,
// resume) viewport 1440x1024 sama dengan frame Pencil.
// Pakai: bun .parity/shoot-hasil.ts [port]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";
import type { Browser, BrowserContext, Page } from "playwright-core";
import { QUIZ_BANK } from "../apps/web/src/features/quiz/quiz-data";
import type { Question } from "../apps/web/src/lib/zod/question";

const port = process.argv[2] ?? "5197";
const BASE = `http://localhost:${port}`;
const OUT = (n: string) => new URL(`./current/hasil-${n}.png`, import.meta.url).pathname;

async function boot(page: Page): Promise<void> {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "Lewati" }).waitFor();
  await page.getByRole("button", { name: "Lewati" }).click();
  await page.getByRole("button", { name: /Mulai Petualangan/u }).click();
  await page.waitForTimeout(1500);
  const skipSave = page.getByRole("button", { name: "Lewati dulu" });
  if ((await skipSave.count()) > 0) await skipSave.click();
  await page.waitForTimeout(1200);
}

async function toQuiz(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Belajar", exact: true }).click();
  await page.waitForSelector("text=Daftar modul");
  await page.locator("ol button").first().click();
  await page.getByRole("button", { name: "Mulai belajar" }).first().click();
  await page.waitForTimeout(1000);
  for (let i = 0; i < 8; i++) {
    if ((await page.getByRole("button", { name: /Kerjakan/u }).count()) > 0) break;
    await page.getByRole("button", { name: /Lanjut/u }).click();
    await page.waitForTimeout(400);
  }
  await page.getByRole("button", { name: /Kerjakan/u }).click();
  // Resume seed: dialog lanjut muncul sebagai ganti Soal 1.
  await Promise.race([
    page.waitForSelector("text=/Soal 1 \\//"),
    page.getByRole("dialog", { name: "Lanjutkan kuis" }).waitFor(),
  ]);
}

/** Latihan Campuran via pohon modul (HK0rs: 6 soal, sub Latihan Campuran). */
async function toLatihan(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Belajar", exact: true }).click();
  await page.waitForSelector("text=Daftar modul");
  await page.getByRole("button", { name: /Latihan campuran/u }).click();
  await page.waitForSelector("text=/Soal 1 \\//");
}

async function freeze(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;caret-color:transparent!important}" +
      "[data-sonner-toaster],[data-sonner-toast],[data-slot=confetti]{display:none!important}",
  });
  await page.waitForTimeout(400);
}

function findBankQuestion(mainText: string): Question {
  const bank = Object.values(QUIZ_BANK).flat();
  const q = bank.find((c) => c.prompt.length > 8 && mainText.includes(c.prompt.slice(0, 40)));
  if (!q) throw new Error(`soal tak dikenal: ${mainText.slice(0, 120)}`);
  return q;
}

async function answerOne(page: Page, wantCorrect: boolean): Promise<void> {
  const mainText = (await page.textContent("main")) ?? "";
  const q = findBankQuestion(mainText);
  if ("choices" in q && q.choices) {
    const idx = wantCorrect
      ? q.choices.findIndex((c) => c.isCorrect)
      : q.choices.findIndex((c) => !c.isCorrect);
    await page.getByRole("button", { name: new RegExp(`^Pilihan ${idx + 1}:`, "u") }).click();
  } else if ("tiles" in q && q.tiles) {
    const order = wantCorrect ? q.tiles : [...q.tiles].toReversed();
    for (const tile of order) {
      await page
        .getByRole("button", { name: `Pilih ubin ${tile}` })
        .first()
        .click();
      await page.waitForTimeout(150);
    }
    await page.getByRole("button", { name: "Cek" }).click();
  } else if ("pairs" in q && q.pairs) {
    const first = q.pairs[0];
    if (!first) throw new Error("pairs kosong");
    if (wantCorrect) {
      for (const p of q.pairs) {
        await page.getByRole("button", { name: `Aksara ${p.left}` }).click();
        await page.waitForTimeout(150);
        await page.getByRole("button", { name: `Arti ${p.right}` }).click();
        await page.waitForTimeout(150);
      }
    } else {
      const wrong = q.pairs.find((p) => p.right !== first.right)?.right ?? "???";
      await page.getByRole("button", { name: `Aksara ${first.left}` }).click();
      await page.waitForTimeout(150);
      await page.getByRole("button", { name: `Arti ${wrong}` }).click();
    }
  } else {
    throw new Error(`tipe tak didukung: ${q.type}`);
  }
  await page.waitForTimeout(400);
  const next = page.getByRole("button", { name: /Lihat hasil|Lanjut ke soal berikutnya/u });
  await next.waitFor();
  await next.click();
  await page.waitForTimeout(600);
}

async function answerAll(page: Page, wantCorrect: boolean, total: number): Promise<void> {
  for (let n = 1; n <= total; n++) {
    await page.waitForSelector(`text=/Soal ${n} \\//`);
    await page.waitForTimeout(400);
    await answerOne(page, wantCorrect);
  }
}

/** Jawab benar soal 1,4,5,6 dan salah soal 2,3 agar skor 4/6 seperti HK0rs. */
async function answerMixed46(page: Page): Promise<void> {
  const plan = [true, false, false, true, true, true];
  for (let n = 1; n <= plan.length; n++) {
    await page.waitForSelector(`text=/Soal ${n} \\//`);
    await page.waitForTimeout(400);
    await answerOne(page, plan[n - 1] ?? true);
  }
}

async function freshPage(
  browser: Browser,
  seed?: Record<string, string>,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
    locale: "id-ID",
  });
  await context.addInitScript((extra: Record<string, string>) => {
    localStorage.setItem("vite-ui-theme", "light");
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
    // Tidbit deterministik: pickTidbit selalu indeks 0 (Penjor, sama dengan Z8nXI).
    Math.random = () => 0;
  }, seed ?? {});
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  return { context, page };
}

async function main(): Promise<void> {
  mkdirSync(new URL("./current/", import.meta.url).pathname, { recursive: true });
  const browser = await chromium.launch();

  // 1. Lulus (Z8nXI): sesi modul 3/3, sub Sapaan dan Adat, XP 30.
  {
    const { context, page } = await freshPage(browser);
    await boot(page);
    await toQuiz(page);
    await answerAll(page, true, 3);
    await page.getByText("Hasil Kuis").waitFor();
    await page.waitForTimeout(800);
    await freeze(page);
    await page.screenshot({ path: OUT("lulus") });
    console.log(`shot: ${OUT("lulus")}`);
    await context.close();
  }

  // 2. Gagal (HK0rs): Latihan Campuran 4/6 via tombol latihan modul.
  {
    const { context, page } = await freshPage(browser, {
      "caksara.module-selesai.v1": JSON.stringify(["mod_01"]),
    });
    await boot(page);
    await toLatihan(page);
    await answerMixed46(page);
    await page.getByText("Hasil Kuis").waitFor();
    await page.waitForTimeout(800);
    await freeze(page);
    await page.screenshot({ path: OUT("gagal") });
    console.log(`shot: ${OUT("gagal")}`);
    await context.close();
  }

  // 3. Resume: seed simpanan soal ke-2 lalu buka kuis.
  {
    const { context, page } = await freshPage(browser, {
      "caksara.quiz-resume.v1": JSON.stringify({
        mod_01: {
          moduleId: "mod_01",
          currentIndex: 1,
          answers: [[0, { selectedIndex: 0 }]],
          hearts: 5,
          updatedAt: Date.now(),
        },
      }),
    });
    await boot(page);
    await toQuiz(page);
    await page.getByRole("dialog", { name: "Lanjutkan kuis" }).waitFor();
    await page.waitForTimeout(600);
    await freeze(page);
    await page.screenshot({ path: OUT("resume") });
    console.log(`shot: ${OUT("resume")}`);
    await context.close();
  }

  await browser.close();
}

await main();
