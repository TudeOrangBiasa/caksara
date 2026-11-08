#!/usr/bin/env node
// Smoke shell desktop (#101): validasi sumber + artefak tanpa packaging.
// Jujur soal batas: bukan launch Electron, bukan screenshot Playwright —
// itu gerbang manusia di mesin ber-GUI (lihat docs/desktop-oauth.md).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
let failed = false;

function check(name, ok, hint = "") {
  const mark = ok ? "✓" : "✖";
  console.log(`${mark} desktop:smoke ${name}${ok || !hint ? "" : ` — ${hint}`}`);
  if (!ok) failed = true;
}

const mainTs = join(root, "apps", "desktop", "src", "main.ts");
const preloadTs = join(root, "apps", "desktop", "src", "preload.ts");
const mainSrc = existsSync(mainTs) ? readFileSync(mainTs, "utf8") : "";
const preloadSrc = existsSync(preloadTs) ? readFileSync(preloadTs, "utf8") : "";

check("main.ts ada", mainSrc.length > 0);
check("preload.ts ada", preloadSrc.length > 0);
check("loadFile(dist/index.html)", mainSrc.includes("loadFile(distIndexPath())"));
check("contextIsolation: true", mainSrc.includes("contextIsolation: true"));
check("nodeIntegration: false", mainSrc.includes("nodeIntegration: false"));
check("sandbox: true", mainSrc.includes("sandbox: true"));
check(
  "loopback 127.0.0.1 /auth/callback",
  mainSrc.includes("127.0.0.1") && mainSrc.includes("/auth/callback"),
);
check("setAsDefaultProtocolClient", mainSrc.includes("setAsDefaultProtocolClient"));
check("preload contextBridge", preloadSrc.includes("contextBridge.exposeInMainWorld"));

const desktopEntry = join(root, "apps", "desktop", "caksara.desktop");
check("caksara.desktop ada", existsSync(desktopEntry));
if (existsSync(desktopEntry)) {
  const entry = readFileSync(desktopEntry, "utf8");
  check("MimeType x-scheme-handler/caksara", entry.includes("x-scheme-handler/caksara"));
}

const electronConfig = join(root, "apps", "desktop", "electron-builder.json");
check("electron-builder.json ada", existsSync(electronConfig));
if (existsSync(electronConfig)) {
  const cfg = JSON.parse(readFileSync(electronConfig, "utf8"));
  const linux = cfg.linux?.target ?? [];
  const win = cfg.win?.target ?? [];
  check("linux target = AppImage saja", linux.length === 1 && linux[0] === "AppImage");
  check("win target = portable (.exe, tanpa wine)", win.includes("portable"));
}

const webIndex = join(root, "apps", "web", "build", "client", "index.html");
if (existsSync(webIndex)) {
  const html = readFileSync(webIndex, "utf8");
  check("dist index.html ada + non-kosong", html.length > 100);
} else {
  console.log(
    "… desktop:smoke dist index.html belum ada — jalankan `bun run desktop:web` dulu (bukan gagal)",
  );
}

if (failed) {
  console.error("\ndesktop:smoke: GAGAL — perbaiki cek bertanda ✖ di atas");
  process.exit(1);
}
console.log("\ndesktop:smoke: OK (sumber + config valid; launch GUI = gerbang manusia)");
