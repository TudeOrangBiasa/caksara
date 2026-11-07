#!/usr/bin/env node
// Lint body PR — LOKAL PENUH, tanpa CI (node saja, tanpa Deno tanpa runner).
// Pemakaian: node scripts/lint-pr-body.js [file-body.md | nomor-PR | -]
//   - tanpa arg / "-": baca body dari stdin
//   - nomor PR: ambil body + daftar file via `gh` (butuh gh auth)
//   - path file: lint file itu; ui-touch dari working tree vs origin/main
// Aturan (dulu di .github/workflows/pr-lint.yml, kini mati — sumber tunggal di sini):
//   1. body tak kosong, tanpa placeholder url-gambar-*
//   2. ada ## Test plan berisi perintah (bun/bunx/npm)
//   3. ada ## Screenshots; PR UI wajib gambar; non-UI boleh backend-only
//   4. tiap URL gambar wajib absolut (https). Reachability hanya warn (offline-safe).
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PLACEHOLDER_RE = /url-gambar-(before|after)/i;
const SECTION_TEST = /## Test plan/i;
const SECTION_SHOTS = /## Screenshots/i;
const CMD_RE = /(bun|bunx|npm|node)( run| test|x | scripts\/)/i;
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
  let uiTouched = null;

  if (arg === "--ci") {
    // CI: body + ui-touch dari env workflow, tanpa `gh`/git.
    body = process.env.PR_BODY ?? "";
    uiTouched = process.env.UI_TOUCHED === "true";
    console.log(`  CI mode: ui-touched=${uiTouched}`);
  } else if (!arg || arg === "-") {
    body = readFileSync(0, "utf8");
  } else if (/^\d+$/.test(arg)) {
    const json = JSON.parse(sh(`gh pr view ${arg} --json body,files`));
    body = json.body ?? "";
    const paths = (json.files ?? []).map((f) => f.path);
    uiTouched = paths.some((p) => UI_PATH_RE.test(p));
    console.log(`  PR #${arg}: ${paths.length} file, ui-touched=${uiTouched}`);
  } else {
    body = readFileSync(arg, "utf8");
    try {
      const files = sh("git diff --name-only origin/main...HEAD").split("\n").filter(Boolean);
      uiTouched = files.some((p) => UI_PATH_RE.test(p));
      console.log(`  ${files.length} file vs origin/main, ui-touched=${uiTouched}`);
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
    // backend-only hanya untuk non-UI: PR visual wajib gambar.
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
      const ok = await reachable(u);
      console.log(`  ${ok ? "✓" : "~ warn (offline?)"} ${u}`);
      if (!ok) warned += 1;
    }),
  );
  if (bad > 0) fail(`${bad} gambar ber-URL relatif — pakai URL absolut (upload via proof)`);
  if (warned > 0) {
    console.log(`  ~ ${warned} gambar tak terjangkau dari sini — pastikan tampil di PR GitHub`);
  }

  if (uiTouched === false && !backendOnly) {
    console.log("  note: non-UI tanpa backend-only tapi ada gambar — OK");
  }
  console.log(`✓ pr-body: ${urls.size} gambar terdaftar`);
}

main();
