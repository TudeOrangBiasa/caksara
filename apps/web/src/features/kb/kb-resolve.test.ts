import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { resolveKbEntry } from "./kb-resolve";

describe("resolveKbEntry — deep-link /kb/:id #67", () => {
  test("id dikenal mengembalikan entri", () => {
    const entry = resolveKbEntry("kb_sapaan");
    assert.ok(entry);
    assert.equal(entry.id, "kb_sapaan");
  });

  test("id asing mengembalikan null (rute render 404)", () => {
    assert.equal(resolveKbEntry("kb_bogus"), null);
  });

  test("tanpa id mengembalikan null", () => {
    assert.equal(resolveKbEntry(), null);
    assert.equal(resolveKbEntry(""), null);
  });
});
