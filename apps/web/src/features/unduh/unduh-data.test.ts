import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { UNDUH_ARTIFACTS } from "./unduh-data";

const webRoot = join(import.meta.dir, "..", "..", "..");
const repoRoot = join(webRoot, "..", "..");
const src = (p: string) => readFileSync(join(webRoot, "src", p), "utf8");

describe("Unduh — matriks 3 artefak (CONTEXT.md + ADR-0014)", () => {
  test("tepat 3 artefak: android apk, windows exe, linux appimage", () => {
    expect(UNDUH_ARTIFACTS.map((a) => a.id)).toEqual(["android", "windows", "linux"]);
    expect(UNDUH_ARTIFACTS.find((a) => a.id === "android")?.filePattern).toContain(".apk");
    expect(UNDUH_ARTIFACTS.find((a) => a.id === "windows")?.filePattern).toContain(".exe");
    expect(UNDUH_ARTIFACTS.find((a) => a.id === "linux")?.filePattern).toContain(".AppImage");
  });

  test("tanpa kartu keempat, tanpa .deb/.rpm di judul render", () => {
    const titles = UNDUH_ARTIFACTS.map((a) =>
      `${a.title} ${a.spec} ${a.filePattern}`.toLowerCase(),
    );
    for (const needle of ["iphone", "ipad", ".deb", ".rpm", "fedora"]) {
      for (const t of titles) {
        expect(t.includes(needle)).toBe(false);
      }
    }
  });

  test("tiap kartu tombol Unduh langsung ke berkas rilis (CTA jujur)", () => {
    const page = src("features/unduh/unduh-page.tsx");
    expect(page.includes("href={a.href}")).toBe(true);
    expect(page.includes('href="#"')).toBe(false);
    for (const a of UNDUH_ARTIFACTS) {
      expect(a.href).toContain("github.com");
      expect(a.href).toContain("releases/download/v1.0.0");
      expect(a.href.endsWith(a.file)).toBe(true);
    }
  });

  test("tanpa CI builder: tanpa workflow release, builder lokal + gate", () => {
    expect(readFileSync(join(repoRoot, ".gitignore"), "utf8")).toContain("apps/desktop/release");
    const script = readFileSync(join(repoRoot, "scripts", "package-local.sh"), "utf8");
    expect(script.includes("verify:caksara")).toBe(true);
    expect(script.includes("electron-builder")).toBe(true);
  });
});
