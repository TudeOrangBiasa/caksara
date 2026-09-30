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

describe("edge keys: dict plural baru — outcome nyata, bukan kunci teks", () => {
  // Helper tinggal di secret-keys.ts (modul tanpa impor) sehingga bun
  // mengujinya LANGSUNG sebagai outcome: dict valid → kunci keluar,
  // hilang/rusak/salah bentuk → string kosong (handler balas 500 eksplisit).
  // Debt kecil: path 500 handler tak dieksekusi di sini — index.ts butuh
  // runtime Deno (Deno.serve + Deno.env); pesan 500 diverifikasi terpisah
  // via deno eval satu-perintah di bawah bila Deno ada, dilewati bila tidak.
  test("secretFromJsonPlural: dict valid → default; hilang/rusak → kosong", async () => {
    const { secretFromJsonPlural } =
      await import("../../../../supabase/functions/generate-quiz/secret-keys.ts");
    assert.equal(secretFromJsonPlural('{"default":"sb_publishable_x"}', "L"), "sb_publishable_x");
    assert.equal(secretFromJsonPlural(undefined, "L"), "");
    assert.equal(secretFromJsonPlural("bukan-json", "L"), "");
    assert.equal(secretFromJsonPlural('{"other":1}', "L"), "");
    assert.equal(secretFromJsonPlural('{"default":42}', "L"), "");
  });

  test("handler tanpa env → 500 menyebut kunci plural baru (Deno; skip bila tak ada)", async () => {
    // Outcome path-500 butuh runtime Deno (index.ts pakai Deno.serve/env).
    // Guard import.meta.main di index.ts membuat impor handler tak menyalakan
    // server, sehingga deno eval satu-perintah ini selesai <1 dtk. Bun tak bisa
    // mengeksekusi modul Deno — ini satu-satunya pengecualian test lintas-runtime.
    // which via shell: Bun.spawnSync tak mewarisi nix PATH di semua env CI.
    const candidates = [
      "/root/.nix-profile/bin/deno",
      `${process.env.HOME}/.nix-profile/bin/deno`,
      "deno",
    ];
    let deno: string | null = null;
    for (const c of candidates) {
      const p = Bun.spawnSync(["sh", "-c", `command -v ${c} 2>/dev/null`]);
      const found = new TextDecoder().decode(p.stdout).trim();
      if (found) {
        deno = found;
        break;
      }
    }
    if (!deno) {
      console.warn("[skip] deno tak ada di PATH — lewati outcome 500 handler");
      return;
    }
    const script = `import { handler } from ${JSON.stringify(join(root, "supabase", "functions", "generate-quiz", "index.ts"))}; const r = await handler(new Request("http://x/", { method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({ moduleId: "mod_01" }) })); console.log(JSON.stringify([r.status, await r.text()]));`;
    const proc = Bun.spawnSync([deno, "eval", "--no-check", script], {
      env: { ...process.env, NO_COLOR: "1", DENO_NO_UPDATE_CHECK: "1" },
    });
    assert.equal(proc.exitCode, 0, new TextDecoder().decode(proc.stderr).slice(0, 300));
    const [status, text] = JSON.parse(new TextDecoder().decode(proc.stdout)) as [number, string];
    assert.equal(status, 500);
    assert.ok(text.includes("SUPABASE_PUBLISHABLE_KEYS"));
    assert.ok(text.includes("SUPABASE_SECRET_KEYS"));
  });
});
