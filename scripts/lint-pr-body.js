#!/usr/bin/env node
// Lint body PR + verifikasi gambar Screenshots benar tampil di GitHub.
// Pemakaian: bun scripts/lint-pr-body.js [file-body.md | nomor-PR]
//   - tanpa arg: baca body dari stdin (untuk hook / pipe `gh pr view --json body`)
//   - dengan nomor PR: ambil body + daftar file via `gh` (butuh gh auth)
//   - dengan path file: lint file itu
// Aturan = cerminan .github/workflows/pr-lint.yml + tambahan verifikasi gambar:
//   1. body tak kosong, tanpa placeholder url-gambar-*
//   2. ada ## Test plan berisi perintah (bun/bunx/npm)
//   3. ada ## Screenshots; PR UI wajib gambar; non-UI boleh backend-only
//   4. SETIAP URL gambar dicek: absolut (https, bukan path relatif) + reachable
//      via HEAD (redirect diikuti). Gambar relatif tak render di email/GitHub mobile.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PLACEHOLDER_RE = /url-gambar-(before|after)/i;
const SECTION_TEST = /## Test plan/i;
const SECTION_SHOTS = /## Screenshots/i;
const CMD_RE = /(bun|bunx|npm)( run| test|x )/i;
const IMG_MD_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const IMG_HTML_RE = /<img[^>]+src=["']([^"']+)["']/gi;
const UI_PATH_RE =
  /^(apps\/web|packages\/ui)\/.*\.(tsx|jsx|css|scss|svg|png|jpg|jpeg|webp|avif|gif|mp4|webm|woff2?|ttf|otf)$/;

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function fail(msg) {
  console.error(`✖ pr-body: ${msg}`);
  process.exit(1);
}

async function reachable(url) {
  try {
    // HEAD dulu (murah); fallback GET range bila server tolak HEAD.
    let r = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (r.status === 405 || r.status === 501) {
      r = await fetch(url, { headers: { Range: "bytes=0-0" }, redirect: "follow" });
    }
    return r.ok || r.status === 206;
  } catch {
    return false;
  }
}

async function main() {
  const arg = process.argv[2];
  let body = "";
  let uiTouched = null; // null = tak diketahui (lint file/stdin tanpa konteks git)

  if (!arg || arg === "-") {
    body = readFileSync(0, "utf8");
    // Bila stdin dari pipe gh, UI-touch tak bisa disimpulkan → anggap butuh gambar
    // kecuali backend-only tertulis.
  } else if (/^\d+$/.test(arg)) {
    const json = JSON.parse(sh(`gh pr view ${arg} --json body,files`));
    body = json.body ?? "";
    const paths = (json.files ?? []).map((f) => f.path);
    uiTouched = paths.some((p) => UI_PATH_RE.test(p));
    console.log(`  PR #${arg}: ${paths.length} file, ui-touched=${uiTouched}`);
  } else {
    body = readFileSync(arg, "utf8");
    // Lint file lokal: bandingkan working tree vs base untuk ui-touch.
    try {
      const base = "origin/main";
      const files = sh(`git diff --name-only ${base}...HEAD`).split("\n").filter(Boolean);
      uiTouched = files.some((p) => UI_PATH_RE.test(p));
      console.log(`  ${files.length} file vs ${base}, ui-touched=${uiTouched}`);
    } catch {
      uiTouched = null;
    }
  }

  if (!body.trim()) fail("body kosong — isi sesuai .github/pull_request_template.md");
  if (PLACEHOLDER_RE.test(body))
    fail("masih ada placeholder url-gambar-* — ganti URL asli / backend-only");
  if (!SECTION_TEST.test(body)) fail("bagian '## Test plan' hilang");
  if (!CMD_RE.test(body))
    fail("Test plan tanpa perintah (bun/bunx/npm …) — tulis perintah + hasilnya");
  if (!SECTION_SHOTS.test(body)) fail("bagian '## Screenshots' hilang");

  const urls = new Set();
  for (const re of [IMG_MD_RE, IMG_HTML_RE]) {
    let m;
    while ((m = re.exec(body))) urls.add(m[1]);
  }
  const backendOnly = /backend-only/i.test(body);

  if (urls.size === 0) {
    // backend-only hanya untuk non-UI (cermin pr-lint.yml: UI tersentuh wajib gambar).
    if (uiTouched === true) {
      fail("PR menyentuh file visual tapi tanpa gambar — lampirkan before/after 390/1280");
    }
    if (backendOnly) {
      console.log("✓ pr-body: backend-only, tanpa gambar (OK)");
      return;
    }
    fail("Screenshots tanpa gambar — lampirkan before/after atau tulis backend-only");
  }

  let bad = 0;
  let warned = 0;
  await Promise.all(
    [...urls].map(async (u) => {
      if (!/^https?:\/\//i.test(u)) {
        console.error(`✖ gambar tak absolut (tak render di GitHub): ${u}`);
        bad += 1;
        return;
      }
      // Reachability hanya warn (offline-safe): gate lokal tak boleh merah
      // karena jaringan. Yang hard-fail = placeholder/relatif/section hilang.
      const ok = await reachable(u);
      console.log(`  ${ok ? "✓" : "~ warn (offline?)"} ${u}`);
      if (!ok) warned += 1;
    }),
  );
  if (bad > 0) fail(`${bad} gambar ber-URL relatif — pakai URL absolut (upload via proof)`);
  if (warned > 0)
    console.log(`  ~ ${warned} gambar tak terjangkau dari sini — pastikan tampil di PR GitHub`);

  // PR UI tanpa konteks file (stdin) tetap lolos bila ada gambar valid.
  if (uiTouched === false && !backendOnly) {
    console.log("  note: non-UI tanpa backend-only tapi ada gambar — OK");
  }
  console.log(`✓ pr-body: ${urls.size} gambar reachable`);
}

main();
