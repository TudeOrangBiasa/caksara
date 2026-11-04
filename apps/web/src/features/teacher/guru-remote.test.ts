import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { fetchGuruRemote } from "./guru-remote";
import { TEACHER_OUTSIDE_REPLY } from "./teacher-data";

const invoke =
  (data: unknown, error: unknown = null) =>
  () =>
    Promise.resolve({ data, error });

describe("fetchGuruRemote — Edge guru-rag di seam #94/#95", () => {
  test("grounded → ok + answer + entryIds + citations", async () => {
    const out = await fetchGuruRemote(
      { mode: "ask", question: "Apa arti Galungan?" },
      {
        invokeRemote: invoke({
          answer: "Galungan adalah kemenangan dharma.",
          entryIds: ["7"],
          outside: false,
          citations: [{ id: "7", title: "Galungan" }],
        }),
      },
    );
    assert.equal(out.ok, true);
    assert.equal(out.verdict?.answer, "Galungan adalah kemenangan dharma.");
    assert.deepEqual(out.verdict?.entryIds, ["7"]);
    assert.deepEqual(out.verdict?.citations, [{ id: "7", title: "Galungan" }]);
    assert.equal(out.verdict?.outside, false);
  });

  test("outside:true → ok + kalimat tolak EXACT #90, answer Edge dibuang", async () => {
    const out = await fetchGuruRemote(
      { mode: "ask", question: "Siapa presiden?" },
      {
        invokeRemote: invoke({
          answer: "Presiden adalah… (seharusnya dibuang)",
          entryIds: [],
          outside: true,
        }),
      },
    );
    assert.equal(out.ok, true);
    assert.equal(out.verdict?.outside, true);
    assert.equal(out.verdict?.answer, TEACHER_OUTSIDE_REPLY);
    assert.equal(
      out.verdict?.answer,
      "Maaf itu di luar materi Caksara. Saya hanya jawab dari 27 materi yang ada.",
    );
    assert.deepEqual(out.verdict?.entryIds, []);
  });

  test("jawaban tanpa entryIds → ok:false (fallback lokal, jangan chip palsu)", async () => {
    const out = await fetchGuruRemote(
      { mode: "ask", question: "Apa itu wresastra?" },
      { invokeRemote: invoke({ answer: "Wresastra…", entryIds: [], outside: false }) },
    );
    assert.equal(out.ok, false);
    assert.equal(out.verdict, null);
  });

  test("citations asing (tak ada di entryIds) disaring keluar", async () => {
    const out = await fetchGuruRemote(
      { mode: "ask", question: "Apa itu Galungan?" },
      {
        invokeRemote: invoke({
          answer: "Galungan…",
          entryIds: ["7"],
          outside: false,
          citations: [
            { id: "7", title: "Galungan" },
            { id: "999", title: "Palsu" },
          ],
        }),
      },
    );
    assert.equal(out.ok, true);
    assert.deepEqual(out.verdict?.citations, [{ id: "7", title: "Galungan" }]);
  });

  test("error Edge / Zod gagal / offline → ok:false (AI-down exact di call-site)", async () => {
    const err = await fetchGuruRemote(
      { mode: "ask", question: "x" },
      { invokeRemote: invoke(null, new Error("503")) },
    );
    assert.equal(err.ok, false);
    const bad = await fetchGuruRemote(
      { mode: "ask", question: "x" },
      { invokeRemote: invoke({ answer: 42 }) },
    );
    assert.equal(bad.ok, false);
    // bun test: navigator hidup di global; simpan/restore manual (pola quiz-generate.test.ts).
    const holder = globalThis as unknown as { navigator?: unknown };
    const nav = holder.navigator;
    Object.assign(globalThis, { navigator: { onLine: false } });
    try {
      let calls = 0;
      const out = await fetchGuruRemote(
        { mode: "ask", question: "x" },
        {
          invokeRemote: () => {
            calls += 1;
            return invoke({ answer: "x", entryIds: ["1"], outside: false })();
          },
        },
      );
      assert.equal(calls, 0);
      assert.equal(out.ok, false);
    } finally {
      Object.assign(globalThis, { navigator: nav });
    }
  });
});
