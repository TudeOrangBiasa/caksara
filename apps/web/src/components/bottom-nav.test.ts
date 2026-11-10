import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dock = readFileSync(join(import.meta.dir, "bottom-nav.tsx"), "utf8");
const top = readFileSync(join(import.meta.dir, "top-nav.tsx"), "utf8");

describe("Bottom-dock polish (#198)", () => {
  test("safe-area: padding bawah hormati gesture bar", () => {
    expect(dock.includes("env(safe-area-inset-bottom)")).toBe(true);
  });

  test("pill aktif ala Pen: ikon aktif di kapsul bg-primary", () => {
    expect(dock.includes("bg-primary text-primary-foreground")).toBe(true);
  });

  test("CTA jujur (aturan agen #1): aria-label = aksi tab, bukan sekadar nama", () => {
    expect(dock.includes("Buka ${tab.label}")).toBe(true);
    // Lintas viewport konsisten: TopNav desktop tanpa prefix "Buka" bikin
    // accessible name beda dari dock + selector rapuh.
    expect(top.includes("Buka ${tab.label}")).toBe(true);
  });
});
