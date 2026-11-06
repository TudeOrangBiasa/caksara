import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { parseSupabaseKbRows } from "./kb-remote";
import type { SupabaseKbRow } from "./kb-remote";

const validRow: SupabaseKbRow = {
  id: 3,
  category: "wresastra",
  title: "Aksara ka",
  body: "Aksara wresastra ka.",
  source: "Unicode Consortium — U+1B00–U+1B7F\nParasali — Padanan & pelafalan aksara Bali",
  level: 1,
};

describe("parseSupabaseKbRows — kb_entries → KbEntry lokal", () => {
  test("baris wajar menjadi entri wresastra level 1 dengan ID asli", () => {
    const out = parseSupabaseKbRows([validRow]);
    assert.equal(out.length, 1);
    assert.equal(out[0]?.id, "3");
    assert.equal(out[0]?.category, "wresastra");
    assert.equal(out[0]?.level, "1");
    assert.equal(out[0]?.sources.length, 2);
    assert.equal(out[0]?.sources[0]?.nama, "Unicode Consortium");
  });

  test("baris tak valid dibuang, bukan melempar", () => {
    const out = parseSupabaseKbRows([
      validRow,
      { ...validRow, id: -1, title: "" } as unknown as SupabaseKbRow,
    ]);
    assert.equal(out.length, 1);
  });

  test("kategori asing dibuang agar daftar tidak menampilkan data semu", () => {
    const out = parseSupabaseKbRows([{ ...validRow, category: "pepatah" }]);
    assert.deepEqual(out, []);
  });

  test("source satu baris tanpa pemisah menjadi satu sumber", () => {
    const out = parseSupabaseKbRows([{ ...validRow, source: "Parasali" }]);
    assert.deepEqual(out[0]?.sources, [{ nama: "Parasali", ket: "Rujukan KB" }]);
  });

  test("daftar kosong tetap kosong", () => {
    assert.deepEqual(parseSupabaseKbRows([]), []);
    assert.deepEqual(parseSupabaseKbRows(null), []);
  });

  test("glyph diekstrak dari body seed agar kartu remote tetap beraksara (V11b)", () => {
    const out = parseSupabaseKbRows([
      {
        ...validRow,
        body: "Aksara: ᬳ (Latin: ha)\n\nAksara wresastra ha.",
      },
    ]);
    assert.equal(out[0]?.glyph, "ᬳ");
    assert.equal(out[0]?.latin, "ha");
  });

  test("pola di tengah body tetap ketemu (tanpa awalan, V11b)", () => {
    const out = parseSupabaseKbRows([
      {
        ...validRow,
        body: "Catatan kurator.\nAksara: ᬓ (Latin: ka) dipakai menulis kata dasar.",
      },
    ]);
    assert.equal(out[0]?.glyph, "ᬓ");
    assert.equal(out[0]?.latin, "ka");
  });

  test("body tanpa pola Aksara/Latin → entri tetap valid tanpa glyph (V11b)", () => {
    const out = parseSupabaseKbRows([{ ...validRow, body: "Aksara wresastra ka." }]);
    assert.equal(out.length, 1);
    assert.equal(out[0]?.glyph, undefined);
    assert.equal(out[0]?.latin, undefined);
  });

  test("latin diekstrak walau tanpa glyph Aksara: (V11b)", () => {
    const out = parseSupabaseKbRows([
      { ...validRow, body: "Salam pembuka (Latin: Om Swastiastu) diucapkan saat bertemu." },
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0]?.glyph, undefined);
    assert.equal(out[0]?.latin, "Om Swastiastu");
  });

  test("pola tak peduli kapitalisasi aksara:/latin: (V11b)", () => {
    const out = parseSupabaseKbRows([
      { ...validRow, body: "catatan: AKSARA: ᬕ (latin: ga) untuk bunyi g." },
    ]);
    assert.equal(out[0]?.glyph, "ᬕ");
    assert.equal(out[0]?.latin, "ga");
  });

  test("kolom glyph/latin Supabase dipakai langsung bila ada (V11b)", () => {
    const out = parseSupabaseKbRows([{ ...validRow, glyph: "ᬓ", latin: "ka" }]);
    assert.equal(out[0]?.glyph, "ᬓ");
    assert.equal(out[0]?.latin, "ka");
  });
});
