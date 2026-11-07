// Solver Sesi Kuis untuk verifier empiris: jawab SEMUA soal benar atau salah
// dengan lookup bank (QUIZ_BANK) via prompt yang tampil — bukan probing.
// Alasan: rightsShuffled (cocokkan) diacak per render; satu pasangan salah =
// soal langsung dinilai gagal (handleRight). Probing jawaban dilarang.
import type { Page } from "playwright-core";
import { QUIZ_BANK } from "../../apps/web/src/features/quiz/quiz-data";
import type { Question } from "../../apps/web/src/lib/zod/question";

function currentPrompt(page: Page): Promise<string> {
  return (async () => {
    // kenali_visual tanpa h2: prompt dirender sebagai glyph di bubble.
    const h2 = await page
      .locator("h2")
      .first()
      .textContent()
      .catch(() => null);
    if (h2?.trim()) return h2.trim();
    const bubble = await page
      .locator("p[lang='ban']")
      .first()
      .textContent()
      .catch(() => null);
    return (bubble ?? "").trim();
  })();
}

function findQuestion(prompt: string): Question {
  for (const bank of Object.values(QUIZ_BANK)) {
    const q = bank.find((x) => x.prompt === prompt);
    if (q) return q;
  }
  throw new Error(`soal tak dikenal di bank: ${prompt.slice(0, 60)}`);
}

/**
 * Toast Sonner menutupi tombol bottom (durasi ≤5 dtk, timer headless
 * lambat). JANGAN hapus node-nya: Sonner mengelola ol>li sendiri; mutasi
 * luar + unmount cepat = crash insertBefore React. Sebagai ganti, suntik
 * pointer-events:none (style di head, di luar tree React) agar klik
 * tembus ke tombol, lalu tunggu toast hilang alami.
 */
export async function settleToasts(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (!document.querySelector("#caksara-toast-passthrough")) {
      const s = document.createElement("style");
      s.id = "caksara-toast-passthrough";
      s.textContent = "li.cn-toast { pointer-events: none !important; }";
      document.head.appendChild(s);
    }
  });
  await page.waitForTimeout(2000);
}
async function next(page: Page, isLast: boolean): Promise<void> {
  if (isLast) await page.getByRole("button", { name: "Lihat hasil" }).click();
  else await page.getByRole("button", { name: /Lanjut/u }).click();
}

export async function answerCurrentQuestion(page: Page, wantCorrect: boolean): Promise<void> {
  const prompt = await currentPrompt(page);
  // Dengar: prompt diamankan ("Dengar, lalu pilih jawaban yang benar…").
  // Cocokkan prompt ke bank via latinText/audio: satu-satunya dengar di
  // sesi tamu Modul 1 adalah latinText bank (fallback offline, seed 0).
  let q: Question | undefined;
  if (prompt.startsWith("Dengar, lalu pilih jawaban")) {
    q = Object.values(QUIZ_BANK)
      .flat()
      .find((x) => x.type === "dengar_pilih");
  } else {
    q = findQuestion(prompt);
  }
  if (!q) throw new Error(`soal tak dikenal: ${prompt.slice(0, 60)}`);
  if (q.type === "susun_aksara" && q.tiles) {
    // tiles = urutan benar bank; pool ter-shuffle, klik by text sesuai tiles.
    const order = wantCorrect ? q.tiles : q.tiles.toReversed();
    for (const tile of order) {
      await page.getByRole("button", { name: `Pilih ubin ${tile}` }).click();
      await page.waitForTimeout(150);
    }
    await page.getByRole("button", { name: "Cek" }).click();
  } else if (q.type === "cocokkan" && q.pairs) {
    // Kiri stabil (pairs order), kanan shuffle: klik kanan by text dari bank.
    for (const pair of q.pairs) {
      await page.getByRole("button", { name: `Aksara ${pair.left}` }).click();
      await page.waitForTimeout(200);
      const wrong = q.pairs.find((p) => p.right !== pair.right)?.right ?? pair.right;
      const target = wantCorrect ? pair.right : wrong;
      await page.getByRole("button", { name: `Arti ${target}` }).click();
      await page.waitForTimeout(250);
      if (!wantCorrect) return; // satu salah = soal dinilai gagal
    }
  } else if ("choices" in q && q.choices) {
    const idx = wantCorrect
      ? q.choices.findIndex((c) => c.isCorrect)
      : q.choices.findIndex((c) => !c.isCorrect);
    await page
      .getByRole("button", { name: /^Pilihan \d/u })
      .nth(idx)
      .click();
  }
  await page.waitForTimeout(400);
}

/**
 * Mainkan sesi penuh. wantCorrect=true → 8 soal → judul h1 hasil lulus.
 * wantCorrect=false → hearts (5) habis di tengah → return penanda gameOver
 * ("Hati kamu habis"), bukan layar hasil. Caller lanjut dari overlay.
 */
export async function playFullSession(page: Page, wantCorrect: boolean): Promise<string> {
  for (let i = 0; i < 8; i++) {
    // Salah beruntun: hearts habis → overlay GameOver, hentikan loop.
    if (!wantCorrect && (await page.getByRole("dialog").count()) > 0) {
      return "Hati kamu habis";
    }
    await page.waitForSelector(`text=/Soal ${i + 1} \\//`);
    await answerCurrentQuestion(page, wantCorrect);
    if (!wantCorrect && (await page.getByRole("button", { name: "Coba Lagi" }).count()) > 0) {
      return "Hati kamu habis";
    }
    await next(page, i === 7);
  }
  await page.waitForTimeout(1200);
  return ((await page.textContent("h1")) ?? "").trim();
}
