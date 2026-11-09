// Solver Sesi Kuis untuk verifier empiris: jawab SEMUA soal benar atau salah
// dengan lookup bank (QUIZ_BANK) via prompt yang tampil — bukan probing.
// Alasan: rightsShuffled (cocokkan) diacak per render; satu pasangan salah =
// soal langsung dinilai gagal (handleRight). Probing jawaban dilarang.
import type { Page } from "playwright-core";
import { QUIZ_BANK } from "../../apps/web/src/features/quiz/quiz-data";
import type { Question } from "../../apps/web/src/lib/zod/question";

async function currentPrompt(
  page: Page,
): Promise<{ kind: "text"; prompt: string } | { kind: "dengar"; latin: string | null }> {
  // Label "Soal N" sudah tampil sementara React belum mount soal baru
  // (stale soal lama → unmount → mount). Retry baca sampai non-kosong.
  for (let i = 0; i < 40; i++) {
    if ((await page.getByText("Dengar, lalu pilih jawaban", { exact: false }).count()) > 0) {
      const latinBtn = page.getByRole("button", { name: /^Dengarkan: /u });
      const latin =
        (await latinBtn.count()) > 0
          ? ((await latinBtn.first().getAttribute("aria-label")) ?? "").replace(/^Dengarkan: /u, "")
          : null;
      return { kind: "dengar", latin: latin || null };
    }
    const h2 = await page
      .locator("h2")
      .first()
      .textContent({ timeout: 2000 })
      .catch(() => null);
    if (h2?.trim()) return { kind: "text", prompt: h2.trim() };
    const bubble = await page
      .locator("p[lang='ban']")
      .first()
      .textContent({ timeout: 2000 })
      .catch(() => null);
    if (bubble?.trim()) return { kind: "text", prompt: bubble.trim() };
    await page.waitForTimeout(200);
  }
  // Dengar tanpa showLatin: tak ada h2/p[ban] — samakan ke satu-satunya
  // dengar non-latin bank sesi ini via latin=null.
  if ((await page.getByRole("button", { name: "Putar audio" }).count()) > 0)
    return { kind: "dengar", latin: null };
  throw new Error("prompt tak muncul 60s (h2/p-ban/dengar kosong)");
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
async function waitToastGone(page: Page): Promise<void> {
  // Toast Sonner (li.cn-toast, ~4s, headless bisa molor 20s+) menutupi tombol
  // Lanjut/pilihan: klik Playwright auto-wait (stabil/hit-target) ikut molor
  // per soal hingga run tampak "hang". Tunggu hilang dulu, klik tetap nyata.
  await page
    .locator("li.cn-toast")
    .waitFor({ state: "detached", timeout: 30000 })
    .catch(() => {});
}
async function next(page: Page, isLast: boolean): Promise<void> {
  await waitToastGone(page);
  if (isLast) await page.getByRole("button", { name: "Lihat hasil" }).click();
  else await page.getByRole("button", { name: /Lanjut/u }).click();
}

export async function answerCurrentQuestion(page: Page, wantCorrect: boolean): Promise<void> {
  const got = await currentPrompt(page);
  // Dengar: prompt diamankan. Cocokkan via latin (aria-label tombol audio);
  // satu dengar latinText bank per sesi tamu (fallback offline, seed 0).
  let q: Question | undefined;
  if (got.kind === "dengar") {
    const dengars = Object.values(QUIZ_BANK)
      .flat()
      .filter((x) => x.type === "dengar_pilih");
    if (got.latin != null) {
      q = dengars.find((x) => "latinText" in x && x.latinText === got.latin);
    } else {
      // Tanpa latin terungkap (tombol audio null di headless): identifikasi
      // via himpunan teks choices yang dirender — unik per soal dengar.
      const shown = new Set<string>();
      for (let i = 0; i < 4; i++) {
        const t = await page
          .getByRole("button", { name: new RegExp(`^Pilihan ${i + 1}\\b`, "u") })
          .first()
          .textContent({ timeout: 5000 })
          .catch(() => null);
        // Teks tombol = "AOm Swastiastu" (huruf opsi + teks tanpa spasi).
        const clean = (t ?? "").trim().replace(/^[A-D]/u, "");
        if (clean) shown.add(clean);
      }
      const cands = dengars.filter(
        (x) =>
          "choices" in x &&
          x.choices &&
          x.choices.length === shown.size &&
          x.choices.every((c) => shown.has(c.text)),
      );
      if (cands.length !== 1)
        throw new Error(`dengar ambigu: ${cands.length} kandidat untuk [${[...shown].join("|")}]`);
      q = cands[0];
    }
  } else {
    q = findQuestion(got.prompt);
  }
  if (!q) {
    const shown =
      got.kind === "dengar" ? `dengar latin=${got.latin ?? "?"}` : got.prompt.slice(0, 60);
    throw new Error(`soal tak dikenal: ${shown}`);
  }
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
  const trace =
    process.env.CAKSARA_TRACE === "1"
      ? (s: string) => console.log(`    [${new Date().toISOString().slice(14, 23)}] ${s}`)
      : () => {};
  for (let i = 0; i < 8; i++) {
    trace(`soal ${i + 1}/8 mulai (${wantCorrect ? "lulus" : "gagal"})`);
    console.log(`    soal ${i + 1}/8 (${wantCorrect ? "lulus" : "gagal"})`);
    // Salah beruntun: hearts habis → overlay GameOver, hentikan loop.
    if (!wantCorrect && (await page.getByRole("dialog").count()) > 0) {
      return "Hati kamu habis";
    }
    trace(`soal ${i + 1}: tunggu selector`);
    await page.waitForSelector(`text=/Soal ${i + 1} \\//`);
    trace(`soal ${i + 1}: jawab`);
    await answerCurrentQuestion(page, wantCorrect);
    trace(`soal ${i + 1}: terjawab, cek gameover`);
    if (!wantCorrect && (await page.getByRole("button", { name: "Coba Lagi" }).count()) > 0) {
      return "Hati kamu habis";
    }
    trace(`soal ${i + 1}: next`);
    await next(page, i === 7);
    trace(`soal ${i + 1}: next ok`);
  }
  await page.waitForTimeout(1200);
  return ((await page.textContent("h1")) ?? "").trim();
}
