import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getTeacherReply, QUICK_REPLIES } from "./teacher-data";

describe("guru virtual #26 — jawab dari KB + sourceRef", () => {
  test("tanya dalam KB → jawaban + sumber + entryId", () => {
    const reply = getTeacherReply("Apa itu wresastra?");
    assert.equal(reply.outside, false);
    assert.ok(reply.answer.length > 0);
    assert.ok(reply.sources.length > 0, "tanpa sumber rujukan");
    assert.ok(reply.entryId, "tanpa tautan balik KB");
  });

  test("tanya budaya dalam KB → entryId tepat", () => {
    const reply = getTeacherReply("Apa arti Galungan?");
    assert.equal(reply.outside, false);
    assert.equal(reply.entryId, "kb_galungan");
  });

  test("tanya luar KB → tolak halus + pills saran", () => {
    const reply = getTeacherReply("Siapa presiden Indonesia?");
    assert.equal(reply.outside, true);
    assert.match(reply.answer.toLowerCase(), /di luar materi/);
    assert.match(reply.answer.toLowerCase(), /aksara|bahasa|budaya/);
    assert.ok(reply.sources.length === 0);
    assert.ok(reply.suggestions && reply.suggestions.length > 0, "fallback tanpa pills");
  });

  test("input kosong → tolak halus + pills saran", () => {
    const reply = getTeacherReply("   ");
    assert.equal(reply.outside, true);
    assert.ok(reply.suggestions && reply.suggestions.length > 0);
  });
});

describe("guru virtual #26 — quick-reply 18 FAQ", () => {
  test("18 pills FAQ berlabel unik dan berteks tanya", () => {
    assert.equal(QUICK_REPLIES.length, 18);
    const texts = new Set(QUICK_REPLIES.map((q) => q.text));
    assert.equal(texts.size, 18);
    for (const q of QUICK_REPLIES) {
      assert.ok(q.label.trim().length > 0);
      assert.ok(q.text.trim().length > 0);
    }
  });

  test("setiap pills FAQ terjawab dari KB (tidak jatuh fallback)", () => {
    const jatuh = QUICK_REPLIES.filter((q) => getTeacherReply(q.text).outside);
    assert.deepEqual(
      jatuh.map((q) => q.text),
      [],
    );
  });
});
