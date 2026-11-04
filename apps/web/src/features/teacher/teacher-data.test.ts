import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getTeacherReply, QUICK_REPLIES, TEACHER_OUTSIDE_REPLY } from "./teacher-data";
import { GEMINI_DOWN_MESSAGE } from "../../lib/notify";

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

  test("tanya luar KB → kalimat tolak exact #90 + pills saran", () => {
    const reply = getTeacherReply("Siapa presiden Indonesia?");
    assert.equal(reply.outside, true);
    assert.equal(reply.answer, TEACHER_OUTSIDE_REPLY);
    assert.equal(
      reply.answer,
      "Maaf itu di luar materi Caksara. Saya hanya jawab dari 27 materi yang ada.",
    );
    assert.ok(reply.sources.length === 0);
    assert.ok(reply.suggestions && reply.suggestions.length > 0, "fallback tanpa pills");
  });

  test("input kosong → kalimat tolak exact #90 + pills saran", () => {
    const reply = getTeacherReply("   ");
    assert.equal(reply.outside, true);
    assert.equal(reply.answer, TEACHER_OUTSIDE_REPLY);
    assert.ok(reply.suggestions && reply.suggestions.length > 0);
  });

  test("topik dikenal tapi jawaban tak ada → tetap kalimat tolak exact #90", () => {
    const reply = getTeacherReply("penjor warna apa ya");
    assert.equal(reply.outside, true);
    assert.equal(reply.answer, TEACHER_OUTSIDE_REPLY);
  });

  test("pesan AI gangguan exact #90 terkunci di notify", () => {
    assert.equal(GEMINI_DOWN_MESSAGE, "AI sedang gangguan. Materi dan kuis tetap bisa dibuka.");
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
