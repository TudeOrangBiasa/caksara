import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ragResponseSchema } from "./rag";

describe("ragResponseSchema — kontrak Edge guru-rag #94/#95", () => {
  test("jawaban grounded (answer + entryIds + citations) lolos", () => {
    const parsed = ragResponseSchema.safeParse({
      answer: "Galungan adalah kemenangan dharma.",
      entryIds: ["7"],
      outside: false,
      citations: [{ id: "7", title: "Galungan" }],
    });
    assert.equal(parsed.success, true);
  });

  test("outside:true lolos dengan answer kosong + entryIds kosong", () => {
    const parsed = ragResponseSchema.safeParse({ answer: "", entryIds: [], outside: true });
    assert.equal(parsed.success, true);
  });

  test("citations opsional (Edge lama tanpa judul chip tetap parse)", () => {
    const parsed = ragResponseSchema.safeParse({
      answer: "Matur suksma berarti terima kasih.",
      entryIds: ["3"],
      outside: false,
    });
    assert.equal(parsed.success, true);
  });

  test("tanpa outside / entryIds bukan array → ditolak", () => {
    assert.equal(ragResponseSchema.safeParse({ answer: "x", entryIds: ["1"] }).success, false);
    assert.equal(
      ragResponseSchema.safeParse({ answer: "x", entryIds: "1", outside: false }).success,
      false,
    );
  });

  test("citation tanpa id/judul → ditolak (jangan render chip palsu)", () => {
    assert.equal(
      ragResponseSchema.safeParse({
        answer: "x",
        entryIds: ["1"],
        outside: false,
        citations: [{ id: "", title: "" }],
      }).success,
      false,
    );
  });
});
