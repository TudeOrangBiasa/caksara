import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { quizSchema } from "../../../apps/web/src/lib/zod/question";
import {
  buildVendoredBlock,
  extractBlock,
  spliceVendoredBlock,
  VENDOR_HEADER,
} from "./vendor-bank";

const root = join(import.meta.dirname, "..", "..", "..");
const fe = readFileSync(join(root, "apps/web/src/features/quiz/quiz-data.ts"), "utf8");

describe("vendor-bank #57 — blok vendored dari QUIZ_BANK FE", () => {
  test("header + identifier FALLBACK_BANK, tanpa export", () => {
    const block = buildVendoredBlock(fe);
    const lines = block.split("\n");
    assert.equal(lines[0], VENDOR_HEADER);
    assert.match(lines[0] as string, /JANGAN EDIT MANUAL/u);
    assert.ok(lines[1]?.includes("Deno/Vite"));
    assert.ok(lines[2]?.startsWith("const FALLBACK_BANK"));
    assert.equal(lines.at(-1), "};");
  });

  test("blok ter-parse Zod FE sebagai bank valid", () => {
    const decl = buildVendoredBlock(fe).split("\n");
    decl[2] = (decl[2] as string).replace(/^const FALLBACK_BANK[^=]*=/u, "");
    const bank = new Function(
      `"use strict"; return (${decl.slice(2).join("\n").replace(/;$/u, "")});`,
    )() as Record<string, unknown[]>;
    for (const [moduleId, questions] of Object.entries(bank)) {
      assert.ok(quizSchema.safeParse({ moduleId, questions }).success, moduleId);
    }
  });
  test("splice idempoten: dua kali jalan → byte-identik", () => {
    const block = buildVendoredBlock(fe);
    const once = spliceVendoredBlock(
      readFileSync(join(root, "supabase/functions/generate-quiz/index.ts"), "utf8"),
      block,
    );
    assert.equal(spliceVendoredBlock(once, block), once);
    assert.ok(once.includes(VENDOR_HEADER));
  });

  test("batas blok unik: satu marker, satu penutup }; kolom-0", () => {
    const edge = readFileSync(join(root, "supabase/functions/generate-quiz/index.ts"), "utf8");
    for (const [source, marker, label] of [
      [fe, "export const QUIZ_BANK", "FE"],
      [edge, "const FALLBACK_BANK", "Edge"],
    ] as const) {
      const { start, end } = extractBlock(source, marker, label);
      assert.ok(end > start);
    }
  });
});
