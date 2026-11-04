import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { WRESASTRA_AKSARA } from "../features/module/aksara-data";
import { UNSUPPORTED_MESSAGE, glyphToLatin, latinToGlyph } from "./transliterate-bali";

describe("latinToGlyph — 18 wresastra round-trip", () => {
  assert.equal(WRESASTRA_AKSARA.length, 18);

  for (const a of WRESASTRA_AKSARA) {
    test(`${a.latin} → ${a.glyph}`, () => {
      const out = latinToGlyph(a.latin);
      assert.equal(out.ok, true);
      assert.equal(out.ok && out.glyph, a.glyph);
    });
  }

  test("kapital Ha juga lolos (case-insensitive)", () => {
    const out = latinToGlyph("Ha");
    assert.deepEqual(out, { ok: true, glyph: "ᬳ", matched: ["ha"] });
  });

  test("frasa sapaan KB lolos utuh", () => {
    const out = latinToGlyph("Om Swastiastu");
    assert.equal(out.ok, true);
    assert.equal(out.ok && out.glyph, "ᬒᬁᬲ᭄ᬯᬲ᭄ᬢᬶᬬᬲ᭄ᬢᬸ");
  });

  test("kombinasi frasa + aksara lolos per kata", () => {
    const out = latinToGlyph("Om Swastiastu ha");
    assert.equal(out.ok, true);
    assert.equal(out.ok && out.glyph, "ᬒᬁᬲ᭄ᬯᬲ᭄ᬢᬶᬬᬲ᭄ᬢᬸ ᬳ");
  });

  test("kata di luar KB → pesan aman", () => {
    assert.deepEqual(latinToGlyph("hello world"), {
      ok: false,
      message: UNSUPPORTED_MESSAGE,
    });
    assert.deepEqual(latinToGlyph(""), { ok: false, message: UNSUPPORTED_MESSAGE });
    assert.deepEqual(latinToGlyph("   "), { ok: false, message: UNSUPPORTED_MESSAGE });
  });
});

describe("glyphToLatin — balikan tabel", () => {
  for (const a of WRESASTRA_AKSARA) {
    test(`${a.glyph} → ${a.latin}`, () => {
      const out = glyphToLatin(a.glyph);
      assert.equal(out.ok, true);
      assert.equal(out.ok && out.latin, a.latin);
    });
  }

  test("glyph asing → pesan aman", () => {
    assert.deepEqual(glyphToLatin("XYZ"), { ok: false, message: UNSUPPORTED_MESSAGE });
  });
});
