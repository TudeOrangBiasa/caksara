import { describe, test } from "node:test";
import assert from "node:assert/strict";

// Kontrak deploy V11b #34 (audio CC BY + tofu + Edge, ADR-0005/0009):
// verifikasi FILE (bukan live) supaya jalan di CI tanpa kredensial —
// pola sama seperti rls-policy.test.ts. Verifikasi live: lihat PR body
// (proof screenshots + Dashboard + Edge log).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { WRESASTRA_AKSARA } from "../features/module/aksara-data";

const root = join(import.meta.dirname, "..", "..", "..", "..");
const css = readFileSync(join(root, "apps", "web", "src", "styles", "aksara.css"), "utf8");
const edge = readFileSync(join(root, "supabase", "functions", "generate-quiz", "index.ts"), "utf8");

describe("v11b font: Noto Sans Balinese self-host tanpa tofu (ADR-0009)", () => {
  test("18 Wresastra terdaftar, semua glyph di blok U+1B00–U+1B7F", () => {
    assert.equal(WRESASTRA_AKSARA.length, 18);
    for (const a of WRESASTRA_AKSARA) {
      assert.match(a.glyph, /^[\u1B00-\u1B7F]+$/u, `${a.id} di luar blok Bali`);
    }
  });

  test("aksara.css: woff2 Regular+Bold, swap, unicode-range Bali, switch [lang=ban]", () => {
    for (const s of [
      "NotoSansBalinese-Regular.woff2",
      "NotoSansBalinese-Bold.woff2",
      "font-display: swap",
      "U+1B00-1B7F",
      '[lang="ban"]',
      ".font-balinese",
    ]) {
      assert.ok(css.includes(s), `aksara.css tanpa: ${s}`);
    }
  });

  test("file woff2 ada di public/fonts (self-host, bukan CDN)", () => {
    for (const f of ["NotoSansBalinese-Regular.woff2", "NotoSansBalinese-Bold.woff2"]) {
      assert.ok(existsSync(join(root, "apps", "web", "public", "fonts", f)), `${f} hilang`);
    }
  });
});

describe("v11b edge: 429 sebelum Gemini, bulk 3-8 Zod, kunci server-only", () => {
  test("rate-limit 429 early-return sebelum efek samping (record/query/Gemini)", () => {
    // Kontrak perilaku: limit terlampaui → 429 tanpa recordCall/queryKb/callGemini.
    // Diverifikasi di level sumber (pola rls-policy.test.ts, jalan di CI tanpa
    // kredensial); harness mock-fetch Deno penuh = debt (Edge pakai Deno.serve +
    // Deno.env, CI hanya bun — jangan over-engineer di sini).
    const guard = edge.indexOf("if (await checkRateLimit(");
    assert.ok(guard >= 0, "tanpa guard checkRateLimit");
    const ret429 = edge.indexOf("return json(429", guard);
    assert.ok(ret429 > guard, "guard tanpa early-return 429");
    for (const sideEffect of ["await recordCall(", "await queryKb(", "await callGemini("]) {
      const at = edge.indexOf(sideEffect);
      assert.ok(at > ret429, `${sideEffect} sebelum early-return 429`);
    }
    assert.ok(edge.includes("429"));
  });

  test("bulk dijepit 3-8 soal (FE + Edge + Zod selaras)", () => {
    assert.ok(edge.includes("Math.min(8, Math.max(3"));
    assert.ok(edge.includes("minItems: 3"));
    assert.ok(edge.includes("maxItems: 8"));
    assert.ok(edge.includes("quizSchema"));
  });

  test("GEMINI_API_KEY hanya via Deno.env (Edge), tak ada VITE_ di Edge", () => {
    assert.ok(edge.includes('Deno.env.get("GEMINI_API_KEY")'));
    assert.ok(!edge.includes("VITE_"));
  });

  test("sumber kuis transparan via header x-quiz-source", () => {
    assert.ok(edge.includes("x-quiz-source"));
  });
});

describe("edge keys: plural JSON dicts baru, tanpa singular legacy", () => {
  test('parse SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS via ["default"] + try/catch', () => {
    // Runtime baru menginjeksi dict PLURAL JSON {"default": "sb_..."} —
    // Deno.env.get singular return null → 500 setiap quiz bila rename naif.
    // Guard file-level (pola rls-policy.test.ts, jalan di CI tanpa Deno):
    // helper secretFromJsonPlural ada, dipakai untuk kedua dict, aman JSON rusak.
    assert.ok(edge.includes("secretFromJsonPlural"));
    assert.ok(edge.includes('Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")'));
    assert.ok(edge.includes('Deno.env.get("SUPABASE_SECRET_KEYS")'));
    assert.ok(edge.includes('["default"]') || edge.includes(".default"));
    assert.ok(edge.includes("try {"));
  });

  test("tanpa kunci singular legacy di Edge", () => {
    assert.ok(!edge.includes('Deno.env.get("SUPABASE_ANON'));
    assert.ok(!edge.includes("SUPABASE_SERVICE_ROLE"));
  });
});
