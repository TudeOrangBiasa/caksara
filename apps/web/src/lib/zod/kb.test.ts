import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { kbRemoteRowSchema } from "./kb";

const validRow = {
  id: 3,
  category: "wresastra",
  title: "Aksara ka",
  body: "Aksara wresastra ka.",
  source: "Unicode Consortium — U+1B00–U+1B7F",
  level: 1,
};

describe("kbRemoteRowSchema — baris kb_entries Supabase", () => {
  test("baris seed yang wajar lolos", () => {
    assert.equal(kbRemoteRowSchema.safeParse(validRow).success, true);
  });

  test("id string dan level string '2' lolos (bentuk REST)", () => {
    const parsed = kbRemoteRowSchema.safeParse({ ...validRow, id: "kb-9", level: "2" });
    assert.equal(parsed.success, true);
  });

  test("judul/body/source kosong ditolak", () => {
    for (const patch of [{ title: "  " }, { body: "" }, { source: "" }]) {
      assert.equal(kbRemoteRowSchema.safeParse({ ...validRow, ...patch }).success, false);
    }
  });

  test("level di luar 1-3 ditolak", () => {
    assert.equal(kbRemoteRowSchema.safeParse({ ...validRow, level: 4 }).success, false);
    assert.equal(kbRemoteRowSchema.safeParse({ ...validRow, level: "9" }).success, false);
  });

  test("kolom embedding opsional diabaikan bila ada", () => {
    const parsed = kbRemoteRowSchema.safeParse({ ...validRow, embedding: [0.1, 0.2] });
    assert.equal(parsed.success, true);
  });
});
