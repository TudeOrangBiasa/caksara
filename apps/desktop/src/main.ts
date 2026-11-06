// Shell desktop CAKSARA (#101, ADR-0014): Electron memuat hasil build
// SPA apps/web. Tanpa server, tanpa loader/action — murni file lokal.
import { createServer } from "node:http";
import type { AddressInfo, Server } from "node:net";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { BrowserWindow, app, shell } from "electron";

const here = import.meta.dirname;

export const AUTH_PROTOCOL = "caksara";
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const DEV_SERVER_URL = "http://localhost:5173/";

interface AuthResult {
  url: URL;
  source: "loopback" | "protocol";
}

let mainWindow: BrowserWindow | null = null;
let loopbackServer: Server | null = null;
let pendingDeepLink: string | null = null;

export function distIndexPath(): string {
  // dist/main.js -> apps/desktop/dist -> repo/apps/web/build/client/index.html
  return join(app.getAppPath(), "..", "web", "build", "client", "index.html");
}

export function isDev(): boolean {
  return !app.isPackaged && process.env.CAKSARA_DESKTOP_PROD !== "1";
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: "#fff8ed",
    webPreferences: {
      preload: join(here, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  if (isDev()) {
    void win.loadURL(DEV_SERVER_URL);
  } else {
    void win.loadFile(distIndexPath());
  }
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  return win;
}

/** Teruskan hasil callback OAuth ke renderer; renderer menukar kode via Supabase JS. */
function deliverAuth(result: AuthResult): void {
  mainWindow?.webContents.send("caksara:auth-callback", {
    href: result.url.href,
    source: result.source,
  });
}

function handleCallbackUrl(href: string, source: AuthResult["source"]): void {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return;
  }
  deliverAuth({ url, source });
}

/** Opsi A: loopback 127.0.0.1 port acak — parse callback lalu tutup. */
export function startLoopback(onAuth: (href: string) => void): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const server = createServer((req, res) => {
    const rawUrl = req.url ?? "/";
    if (req.method === "GET" && rawUrl.startsWith(AUTH_CALLBACK_PATH)) {
      const address = server.address() as AddressInfo;
      const href = `http://127.0.0.1:${address.port}${rawUrl}`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<!doctype html><html lang=id><meta charset=utf-8><title>CAKSARA</title>" +
          "<body style='font-family:sans-serif;text-align:center;padding-top:20vh'>" +
          "<h1>Masuk berhasil</h1><p>Kembali ke aplikasi CAKSARA.</p></body></html>",
      );
      onAuth(href);
      server.close();
      loopbackServer = null;
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  });
  server.on("error", reject);
  server.listen(0, "127.0.0.1", () => {
    loopbackServer = server;
    const address = server.address() as AddressInfo;
    resolve(`http://127.0.0.1:${address.port}${AUTH_CALLBACK_PATH}`);
  });
  return promise;
}

/** Opsi B: protokol kustom caksara://auth/callback (fallback bila loopback diblokir). */
function registerProtocol(): void {
  if (process.defaultApp && process.argv.length >= 2) {
    const exe = process.argv[0];
    const devEntry = process.argv[1];
    if (exe && devEntry) app.setAsDefaultProtocolClient(AUTH_PROTOCOL, exe, [devEntry]);
    return;
  }
  app.setAsDefaultProtocolClient(AUTH_PROTOCOL);
}

function handleDeepLink(argv: string[]): void {
  const found = argv.find((a) => a.startsWith(`${AUTH_PROTOCOL}://`));
  if (!found) return;
  if (mainWindow) handleCallbackUrl(found, "protocol");
  else pendingDeepLink = found;
}

function bootLoopback(): void {
  startLoopback((href) => handleCallbackUrl(href, "loopback")).then(
    (redirectTo) => {
      mainWindow?.webContents.send("caksara:auth-redirect", { redirectTo });
    },
    (error: unknown) => {
      if (!app.isPackaged) console.warn("[desktop] loopback gagal:", error);
    },
  );
}

const gotLock = app.requestSingleInstanceLock();
if (gotLock) {
  app.on("second-instance", (_event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    handleDeepLink(argv);
  });
  app.on("open-url", (event, url) => {
    event.preventDefault();
    if (mainWindow) handleCallbackUrl(url, "protocol");
    else pendingDeepLink = url;
  });

  await app.whenReady();
  registerProtocol();
  handleDeepLink(process.argv);
  mainWindow = createWindow();
  bootLoopback();
  if (pendingDeepLink) {
    handleCallbackUrl(pendingDeepLink, "protocol");
    pendingDeepLink = null;
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });

  app.on("window-all-closed", () => {
    loopbackServer?.close();
    loopbackServer = null;
    if (process.platform !== "darwin") app.quit();
  });
} else {
  app.quit();
}

export function preloadBridgePath(): string {
  return pathToFileURL(join(here, "preload.js")).href;
}
