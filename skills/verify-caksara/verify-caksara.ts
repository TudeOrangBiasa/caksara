import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import type { Browser, Page } from "playwright-core";

// Verifikator tamu Caksara: mainkan kuis Modul 1 di 3 viewport,
// assert tanpa horizontal overflow, simpan screenshot sebagai bukti.
// Jalan tanpa Supabase/Gemini (.env kosong OK): sesi kuis jatuh ke
// bank soal lokal (fetchGeneratedQuiz -> buildFallback("offline")).
const BASE_URL = process.env.CAKSARA_URL ?? "http://localhost:5173";
const DEV_PORT = 5173;

interface Viewport {
  name: "mobile" | "tablet" | "desktop";
  width: number;
  height: number;
  dsf: number;
}

const VIEWPORTS: Viewport[] = [
  { name: "mobile", width: 390, height: 844, dsf: 2 },
  { name: "tablet", width: 820, height: 1180, dsf: 2 },
  { name: "desktop", width: 1440, height: 900, dsf: 1 },
];

interface OverflowSample {
  step: string;
  doc: number;
  body: number;
}

interface ViewportReport {
  viewport: string;
  soal: string;
  ariaValuemax: number | null;
  overflow: OverflowSample[];
  ok: boolean;
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function http200(url: string, tries: number, gapMs: number): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // server belum naik, coba lagi
    }
    await Bun.sleep(gapMs);
  }
  return false;
}

async function sampleOverflow(page: Page, step: string): Promise<OverflowSample> {
  const { doc, body } = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  return { step, doc, body };
}

interface DriveCtx {
  page: Page;
  vp: Viewport;
  evidenceDir: string;
  samples: OverflowSample[];
}

async function shot(ctx: DriveCtx, name: string): Promise<void> {
  await ctx.page.screenshot({ path: join(ctx.evidenceDir, `${ctx.vp.name}-${name}`) });
}

async function passOnboarding(ctx: DriveCtx): Promise<void> {
  const { page } = ctx;
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Lewati" }).waitFor();
  await shot(ctx, "00-onboarding.png");
  await page.getByRole("button", { name: "Lewati" }).click();
  await page.getByRole("button", { name: /Mulai Petualangan/u }).click();
  await page.waitForTimeout(1500);
  // Post-nickname Google-save offer (#89) is non-blocking: dismiss when shown.
  const skipSave = page.getByRole("button", { name: "Lewati dulu" });
  if ((await skipSave.count()) > 0) await skipSave.click();
  await page.waitForTimeout(1200);
  ctx.samples.push(await sampleOverflow(page, "home"));
  await shot(ctx, "01-home.png");
}

async function passMateri(ctx: DriveCtx): Promise<void> {
  const { page } = ctx;
  await page.getByRole("button", { name: "Belajar", exact: true }).click();
  await page.waitForSelector("text=Daftar modul");
  await page.locator("ol button").first().click();
  await page.getByRole("button", { name: "Mulai belajar" }).first().click();
  await page.waitForTimeout(1000);
  for (let i = 0; i < 8; i++) {
    if ((await page.getByRole("button", { name: /Kerjakan/u }).count()) > 0) break;
    await page.getByRole("button", { name: /Lanjut/u }).click();
    await page.waitForTimeout(500);
  }
  ctx.samples.push(await sampleOverflow(page, "materi"));
}

async function passQuiz(ctx: DriveCtx): Promise<{ soal: string; ariaValuemax: number | null }> {
  const { page } = ctx;
  await page.getByRole("button", { name: /Kerjakan/u }).click();
  await page.waitForSelector("text=/Soal 1 \\//");
  const soal = (await page.textContent("p:has-text('Soal 1 /')"))?.trim() ?? "";
  const progress = page.getByRole("progressbar", { name: /Soal 1/u });
  const maxRaw = await progress.first().getAttribute("aria-valuemax");
  ctx.samples.push(await sampleOverflow(page, "quiz"));
  await shot(ctx, "02-quiz.png");
  return { soal, ariaValuemax: maxRaw ? Number(maxRaw) : null };
}

async function passKb(ctx: DriveCtx): Promise<void> {
  const { page } = ctx;
  // Keluar kuis -> Detail Modul (overlay, tanpa nav) -> Kembali -> pohon.
  await page.getByRole("button", { name: "Keluar dari kuis" }).click();
  await page.getByRole("button", { name: "Kembali" }).first().click();
  await page.waitForSelector("text=Daftar modul");
  await page.getByRole("button", { name: "KB", exact: true }).click();
  await page.waitForTimeout(1500);
  ctx.samples.push(await sampleOverflow(page, "kb"));
  await page.locator("section button").first().click();
  await page.waitForTimeout(1000);
  ctx.samples.push(await sampleOverflow(page, "kb-detail"));
  await shot(ctx, "03-kb.png");
}

/// Drive satu viewport: splash -> Lewati -> siap -> Belajar -> Modul 1 ->
/// materi -> kuis -> KB detail. Screenshot tiap tonggak ke dir bukti.
async function driveViewport(
  browser: Browser,
  vp: Viewport,
  evidenceDir: string,
): Promise<ViewportReport> {
  const samples: OverflowSample[] = [];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dsf,
    locale: "id-ID",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const ctx: DriveCtx = { page, vp, evidenceDir, samples };
  await passOnboarding(ctx);
  await passMateri(ctx);
  const { soal, ariaValuemax } = await passQuiz(ctx);
  await passKb(ctx);
  await context.close();
  const ok = samples.every((s) => s.doc <= 0 && s.body <= 0);
  return { viewport: vp.name, soal, ariaValuemax, overflow: samples, ok };
}

/// Doctor: HTTP 200 + selector onboarding. Luncurkan dev:web sendiri bila
/// port kosong; jangan sentuh server milik orang.
async function launch(): Promise<ChildProcess | null> {
  const portBusy = await http200(`http://localhost:${DEV_PORT}/`, 2, 500);
  let ownProc: ChildProcess | null = null;
  if (!portBusy) {
    ownProc = spawn("bun", ["run", "dev:web"], { stdio: "ignore", detached: true });
    ownProc.unref();
    const up = await http200(`http://localhost:${DEV_PORT}/`, 60, 2000);
    if (!up) throw new Error("dev:web tidak menjawab 200 dalam ~120 dtk");
  }
  const doctor = await chromium.launch({ timeout: 30000 });
  const dctx = await doctor.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const dpage = await dctx.newPage();
    await dpage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await dpage.getByRole("button", { name: "Lewati" }).waitFor({ timeout: 20000 });
  } finally {
    await dctx.close();
    await doctor.close();
  }
  return ownProc;
}

function stopOwn(ownProc: ChildProcess | null): void {
  if (!ownProc?.pid) return;
  try {
    process.kill(-ownProc.pid, "SIGTERM");
  } catch {
    ownProc.kill("SIGTERM");
  }
}

async function driveAll(browser: Browser, evidenceDir: string): Promise<ViewportReport[]> {
  const reports: ViewportReport[] = [];
  for (const vp of VIEWPORTS) {
    const rep = await driveViewport(browser, vp, evidenceDir);
    reports.push(rep);
    console.log(
      `  ${vp.name} ${vp.width}x${vp.height}: ${rep.soal} max=${rep.ariaValuemax} overflow=${rep.ok ? "ok" : "FAIL"}`,
    );
    for (const s of rep.overflow) {
      if (s.doc > 0 || s.body > 0) console.log(`    FAIL ${s.step}: doc=${s.doc} body=${s.body}`);
    }
  }
  return reports;
}

async function main(): Promise<void> {
  const startedAt = stamp();
  const evidenceDir = join(process.cwd(), ".verify", "caksara", startedAt);
  mkdirSync(evidenceDir, { recursive: true });
  const ownProc = await launch();
  const browser = await chromium.launch({ timeout: 30000 });
  let failed: string | null = null;
  let reports: ViewportReport[] = [];
  try {
    reports = await driveAll(browser, evidenceDir);
  } catch (err) {
    failed = err instanceof Error ? err.message : String(err);
  } finally {
    await browser.close();
    stopOwn(ownProc);
  }
  const overflowJson: Record<string, string> = {};
  for (const r of reports) overflowJson[r.viewport] = r.ok ? "ok" : "FAIL";
  writeFileSync(join(evidenceDir, "overflow.json"), `${JSON.stringify(overflowJson, null, 2)}\n`);
  writeFileSync(join(evidenceDir, "report.json"), `${JSON.stringify(reports, null, 2)}\n`);
  console.log(`evidence: .verify/caksara/${startedAt}/`);
  if (failed) throw new Error(failed);
  if (!reports.every((r) => r.ok))
    throw new Error("horizontal overflow terdeteksi (lihat overflow.json)");
  console.log("verify:caksara: all viewports passed");
}

await main();
