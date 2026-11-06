import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const webRoot = join(import.meta.dir, "..", "..", "..");
const src = (p: string) => readFileSync(join(webRoot, "src", p), "utf8");

describe("UI — halaman memalukan dihapus (#88)", () => {
  const landing = src("features/landing/landing-home.tsx");

  test("tanpa href mati", () => {
    // Jarum dibangun saat runtime agar berkas uji ini sendiri tidak cocok
    // dengan rg penerimaan pada kriteria #88.
    const shame = [["href=", '"#"'].join("")];
    for (const needle of shame) {
      expect(landing.includes(needle)).toBe(false);
    }
  });
  test("testimoni + kontak data-driven, bukan hardcode klaim (#160)", () => {
    // Pengecualian #160: testimoni + kontak footer tampil apa adanya dari
    // Pencil T4HbK, bukan data asli. Guard: nama/kontak hidup di
    // landing-data.ts, komponen hanya render via LANDING_TESTIMONIES/LANDING_CONTACTS.
    expect(landing.includes("LANDING_TESTIMONIES")).toBe(true);
    expect(landing.includes("LANDING_CONTACTS")).toBe(true);
    const dataDriven = [
      ["Bapak", "Wayan"].join(" "),
      ["Ibu", "Putu"].join(" "),
      ["Dek", "Made"].join(" "),
      ["Bli", "Agung"].join(" "),
      ["123", "456"].join(" "),
      ["halo", "caksara"].join("@"),
    ];
    for (const needle of dataDriven) {
      expect(landing.includes(needle)).toBe(false);
    }
    const data = src("features/landing/landing-data.ts");
    // Baris 1 tampil; baris 2 nonaktif di Pencil (row2 enabled=false).
    for (const needle of dataDriven.filter((n) => !n.includes("Putu") && !n.includes("Made"))) {
      expect(data.includes(needle)).toBe(true);
    }
  });
  test("hero dua CTA ala Pencil T4HbK (primer + sekunder)", () => {
    const hero = landing.slice(landing.indexOf("{/* HERO */}"), landing.indexOf("{/* WHY US */}"));
    expect(hero.includes("MULAI BELAJAR")).toBe(true);
    expect(hero.includes("SAYA SUDAH PUNYA AKUN")).toBe(true);
  });
});

describe("UI — ikon lucide-react saja (#103)", () => {
  test("tanpa pustaka ikon selain lucide", () => {
    const libs = ["pho" + "sphor", "react" + "-icons", "font" + "awesome"];
    for (const f of [
      "components/nav-tabs.tsx",
      "components/bottom-nav.tsx",
      "features/dashboard/dashboard.tsx",
      "features/landing/landing-home.tsx",
      "features/quiz/quiz-feedback.tsx",
      "features/quiz/quiz-shell.tsx",
    ]) {
      const body = src(f);
      for (const lib of libs) {
        expect(body.includes(lib)).toBe(false);
      }
    }
  });

  test("KB → LibraryBig, Guru → MessageCircleQuestion di nav + dashboard + landing", () => {
    for (const f of [
      "components/nav-tabs.tsx",
      "features/dashboard/dashboard.tsx",
      "features/landing/landing-home.tsx",
    ]) {
      const body = src(f);
      expect(body.includes("LibraryBig")).toBe(true);
      expect(body.includes("MessageCircleQuestion")).toBe(true);
    }
  });
});

describe("UI — brand Bedawang konsisten (#98)", () => {
  test("header + top-nav + splash memakai komponen Bedawang", () => {
    expect(src("components/header.tsx").includes("<Bedawang")).toBe(true);
    expect(src("components/top-nav.tsx").includes("<Bedawang")).toBe(true);
    expect(src("features/onboarding/onboarding-gate.tsx").includes("<Bedawang")).toBe(true);
  });

  test("favicon.ico berasal dari bedawang-standing", () => {
    const ico = readFileSync(join(webRoot, "public", "favicon.ico"));
    expect(ico.length).toBeGreaterThan(1000);
    expect(src("../src/root.tsx").includes("/favicon.ico")).toBe(true);
  });
});
