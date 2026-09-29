import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { fetchKbEntries } from "./kb-source";
import type { KbFetchDeps } from "./kb-source";
import type { SupabaseKbRow } from "./kb-remote";

const localRow = {
  id: "kb_wre_01",
  category: "wresastra" as const,
  title: "Aksara ha",
  latin: "ha",
  glyph: "ᬳ",
  body: "Aksara wresastra ha.",
  level: "1" as const,
  sources: [{ nama: "Unicode Consortium", ket: "U+1B00–U+1B7F" }],
};

const remoteRow = {
  id: 3,
  category: "wresastra",
  title: "Aksara ka",
  body: "Aksara wresastra ka.",
  source: "Unicode Consortium — U+1B00–U+1B7F",
  level: 1,
};

function deps(over: Partial<KbFetchDeps> = {}): KbFetchDeps {
  return {
    online: true,
    hasBackend: true,
    readCache: () => null,
    writeCache: () => {},
    // oxlint require-await: stub async DI boundary, bukan lupa await.
    // eslint-disable-next-line require-await
    queryRemote: async () => [remoteRow],
    ...over,
  };
}

describe("fetchKbEntries — cache-first, local fallback #25", () => {
  test("remote valid → pakai remote, tulis cache", async () => {
    let wrote: unknown = null;
    const out = await fetchKbEntries({
      ...deps({ writeCache: (rows) => (wrote = rows) }),
      local: [localRow],
    });
    assert.equal(out.source, "remote");
    assert.equal(out.entries.length, 1);
    assert.equal(out.entries[0]?.title, "Aksara ka");
    assert.ok(Array.isArray(wrote));
  });

  test("remote kosong → fallback lokal + loadError true (banner, bukan empty)", async () => {
    // eslint-disable-next-line require-await
    const out = await fetchKbEntries({
      ...deps({ queryRemote: async () => [] }),
      local: [localRow],
    });
    assert.equal(out.source, "local");
    assert.deepEqual(out.entries, [localRow]);
    assert.equal(out.loadError, true);
  });

  test("remote invalid semua → fallback lokal + loadError true", async () => {
    const out = await fetchKbEntries({
      // eslint-disable-next-line require-await
      ...deps({ queryRemote: async () => [{ id: -1 }] as unknown as SupabaseKbRow[] }),
      local: [localRow],
    });
    assert.equal(out.source, "local");
    assert.equal(out.loadError, true);
  });

  test("remote eksplisit kosong + local dikosongkan → entries kosong (cabang empty reachable)", async () => {
    // eslint-disable-next-line require-await
    const out = await fetchKbEntries({
      ...deps({ queryRemote: async () => [] }),
      local: [],
    });
    assert.deepEqual(out.entries, []);
    assert.equal(out.loadError, true);
  });
});

describe("fetchKbEntries — offline/cache/down #25", () => {
  test("offline tanpa cache → lokal + offline true tanpa query remote", async () => {
    let queried = false;
    const out = await fetchKbEntries({
      ...deps({
        online: false,
        readCache: () => null,
        // eslint-disable-next-line require-await
        queryRemote: async () => {
          queried = true;
          return [];
        },
      }),
      local: [localRow],
    });
    assert.equal(queried, false);
    assert.equal(out.offline, true);
    assert.equal(out.source, "local");
  });

  test("offline pakai cache segar dulu (ADR-0008 KB cache offline)", async () => {
    const cached: SupabaseKbRow[] = [remoteRow];
    let queried = false;
    const out = await fetchKbEntries({
      ...deps({
        online: false,
        readCache: () => cached,
        // eslint-disable-next-line require-await
        queryRemote: async () => {
          queried = true;
          return [];
        },
      }),
      local: [localRow],
    });
    assert.equal(queried, false);
    assert.equal(out.offline, true);
    assert.equal(out.source, "cache");
    assert.equal(out.entries[0]?.title, "Aksara ka");
  });

  test("tanpa backend → cache lokal bila ada", async () => {
    const cached: SupabaseKbRow[] = [remoteRow];
    const out = await fetchKbEntries({
      ...deps({ hasBackend: false, readCache: () => cached }),
      local: [localRow],
    });
    assert.equal(out.source, "cache");
    assert.equal(out.entries[0]?.title, "Aksara ka");
    assert.equal(out.loadError, false);
  });
  test("remote lempar → lokal + loadError true, offline false", async () => {
    const out = await fetchKbEntries({
      ...deps({
        // eslint-disable-next-line require-await
        queryRemote: async () => {
          throw new Error("down");
        },
      }),
      local: [localRow],
    });
    assert.equal(out.source, "local");
    assert.equal(out.offline, false);
    assert.equal(out.loadError, true);
  });
});
