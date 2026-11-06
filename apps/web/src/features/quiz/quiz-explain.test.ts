import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { describeUserChoice, fetchQuizExplain } from "./quiz-explain";

const invoke =
  (data: unknown, error: unknown = null) =>
  () =>
    Promise.resolve({ data, error });

describe("fetchQuizExplain — mode explain Edge guru-rag #95", () => {
  const deps = {
    prompt: "Apa arti sapaan ini?",
    userChoice: "Selamat pagi",
    sourceRef: "kb_sapaan · Basis Pengetahuan",
  };

  test("grounded → teks + citations (chip sumber)", async () => {
    const out = await fetchQuizExplain(deps, {
      invokeRemote: invoke({
        answer: "Salah karena sapaan itu berarti semoga selamat. Cek lagi konteks bertemu.",
        entryIds: ["2"],
        outside: false,
        citations: [{ id: "2", title: "Om Swastiastu" }],
      }),
    });
    assert.ok(out);
    assert.ok(out.text.includes("semoga selamat"));
    assert.deepEqual(out.citations, [{ id: "2", title: "Om Swastiastu" }]);
  });

  test("outside / error / tanpa kutipan → null (explanation statis tetap tampil)", async () => {
    const outside = await fetchQuizExplain(deps, {
      invokeRemote: invoke({ answer: "", entryIds: [], outside: true }),
    });
    assert.equal(outside, null);
    const err = await fetchQuizExplain(deps, {
      invokeRemote: invoke(null, new Error("503")),
    });
    assert.equal(err, null);
    const nocite = await fetchQuizExplain(deps, {
      invokeRemote: invoke({ answer: "Sebab…", entryIds: [], outside: false }),
    });
    assert.equal(nocite, null);
  });

  test("offline → null tanpa invoke (tombol disembunyikan call-site)", async () => {
    const holder = globalThis as unknown as { navigator?: unknown };
    const nav = holder.navigator;
    Object.assign(globalThis, { navigator: { onLine: false } });
    try {
      let calls = 0;
      const out = await fetchQuizExplain(deps, {
        invokeRemote: () => {
          calls += 1;
          return invoke({ answer: "x", entryIds: ["1"], outside: false })();
        },
      });
      assert.equal(calls, 0);
      assert.equal(out, null);
    } finally {
      Object.assign(globalThis, { navigator: nav });
    }
  });
});

describe("describeUserChoice — ringkas jawaban salah jadi konteks", () => {
  test("pilihan ganda → teks choice yang dipilih", () => {
    assert.equal(
      describeUserChoice({ selectedIndex: 1, choices: [{ text: "a" }, { text: "b" }] }),
      "b",
    );
  });

  test("susun/cocokkan → susunan/pasangan", () => {
    assert.equal(describeUserChoice({ ordered: ["swa", "as", "ti", "tu"] }), "swa-as-ti-tu");
    assert.equal(describeUserChoice({ matches: { a: "1", b: "2" } }), "a=1, b=2");
  });

  test("kosong → string kosong (Edge terima '-' sebagai fallback)", () => {
    assert.equal(describeUserChoice({}), "");
  });
});
