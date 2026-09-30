import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Skema Edge adalah vendored copy dari skema web (bundler Edge menolak bare
// specifier "zod" dari luar direktori function). Test ini menggagalkan drift:
// setiap penambahan/penghapusan field di satu sisi WAJIB dicerminkan di sisi
// lain, bukan sekadar komentar JAGA SINKRON.
const WEB_SCHEMA_URL = new URL("../../lib/zod/question.ts", import.meta.url);
const EDGE_SCHEMA_URL = new URL(
  "../../../../../supabase/functions/generate-quiz/question.ts",
  import.meta.url,
);

/** Badan skema dari export pertama sampai EOF — header import boleh beda. */
function schemaBody(src: string): string {
  const marker = "export const choiceSchema";
  const idx = src.indexOf(marker);
  assert.ok(idx !== -1, "export choiceSchema hilang dari skema");
  return src.slice(idx).replace(/\r\n/g, "\n").trim();
}

describe("parity skema quiz web ↔ edge generate-quiz", () => {
  test("promptBali wajib ada di kedua skema (string non-kosong opsional)", () => {
    const web = readFileSync(WEB_SCHEMA_URL, "utf8");
    const edge = readFileSync(EDGE_SCHEMA_URL, "utf8");
    for (const [name, src] of [
      ["web", web],
      ["edge", edge],
    ] as const) {
      assert.match(
        src,
        /promptBali:\s*z\.string\(\)\.min\(1\)\.optional\(\)/,
        `${name}: promptBali wajib z.string().min(1).optional()`,
      );
    }
  });

  test("badan skema identik (field + tipe setara) — drift menggagalkan test", () => {
    const web = readFileSync(WEB_SCHEMA_URL, "utf8");
    const edge = readFileSync(EDGE_SCHEMA_URL, "utf8");
    assert.equal(schemaBody(edge), schemaBody(web));
  });

  test("import resolver tetap terpisah: web bare zod, edge npm:zod", () => {
    const web = readFileSync(WEB_SCHEMA_URL, "utf8");
    const edge = readFileSync(EDGE_SCHEMA_URL, "utf8");
    assert.match(web, /from "zod"/);
    assert.match(edge, /from "npm:zod@/);
  });
});
