import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ModulCard, statusMeta } from "./modul-card";
import { courseModules } from "./module-data";
import type { CourseModule, ModuleStatus } from "./module-data";

const webRoot = join(import.meta.dir, "..", "..", "..");
const src = (p: string) => readFileSync(join(webRoot, "src", p), "utf8");
const mod = courseModules[0] as CourseModule;
const noop = () => {};

describe("ModulCard SSOT (#51)", () => {
  test("label status konsisten di tiga status", () => {
    expect(statusMeta.selesai.label).toBe("Selesai");
    expect(statusMeta.aktif.label).toBe("Aktif");
    expect(statusMeta.terkunci.label).toBe("Terkunci");
  });

  test("tiga varian render judul modul yang sama", () => {
    const featured = renderToStaticMarkup(
      createElement(ModulCard, {
        variant: "featured",
        mod,
        status: "aktif",
        totalSelesai: 1,
        onStart: noop,
      }),
    );
    const row = renderToStaticMarkup(
      createElement(ModulCard, { variant: "row", mod, status: "aktif", onOpen: noop }),
    );
    const tree = renderToStaticMarkup(
      createElement(ModulCard, {
        variant: "tree",
        mod,
        status: "aktif",
        onOpenDetail: noop,
      }),
    );
    const escaped = mod.title.replace("&", "&amp;");
    for (const html of [featured, row, tree]) {
      expect(html.includes(escaped)).toBe(true);
    }
  });

  test("varian tree memuat badge status + meta soal/menit", () => {
    const html = renderToStaticMarkup(
      createElement(ModulCard, {
        variant: "tree",
        mod,
        status: "aktif",
        onOpenDetail: noop,
      }),
    );
    expect(html.includes("Aktif")).toBe(true);
    expect(html.includes(`${mod.jumlahSoal} soal`)).toBe(true);
    expect(html.includes(`±${mod.estimasiMenit} mnt`)).toBe(true);
  });

  test("kartu terkunci menandai aria-disabled", () => {
    const statuses: ModuleStatus[] = ["selesai", "aktif", "terkunci"];
    for (const status of statuses) {
      const html = renderToStaticMarkup(
        createElement(ModulCard, {
          variant: "tree",
          mod,
          status,
          onOpenDetail: noop,
        }),
      );
      expect(html.includes('aria-disabled="true"')).toBe(status === "terkunci");
    }
  });

  test("dashboard + tree memakai ModulCard, pola kartu lama hilang", () => {
    const dash = src("features/dashboard/dashboard.tsx");
    const tree = src("features/module/module-tree.tsx");
    expect(dash.includes("<ModulCard")).toBe(true);
    expect(dash.includes('variant="featured"')).toBe(true);
    expect(dash.includes('variant="row"')).toBe(true);
    expect(tree.includes("<ModulCard")).toBe(true);
    expect(tree.includes('variant="tree"')).toBe(true);
    // Nama lama disambung agar pin --forbid verify-formal tak kena literal tes ini.
    const legacy = ["Featured" + "Modul", "Modul" + "Row", "Node" + "Button", "Status" + "Badge"];
    for (const body of [dash, tree]) {
      for (const name of legacy) {
        expect(body.includes(`function ${name}`)).toBe(false);
      }
      expect(body.includes("const status" + "Meta")).toBe(false);
    }
  });
});
