import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { parseWitaDate } from "./game-state";
import { witaDateString } from "../game-rules";

describe("parseWitaDate", () => {
  test("tanggal WITA valid lolos", () => {
    assert.equal(parseWitaDate("2026-09-05"), "2026-09-05");
  });

  test("format asing dan tanggal UTC mentah ditolak dengan keras", () => {
    assert.throws(() => parseWitaDate("05/09/2026"));
    assert.throws(() => parseWitaDate("2026-09-05T00:00:00Z"));
    assert.throws(() => parseWitaDate(20260905));
  });
});

describe("witaDateString", () => {
  test("keluaran selalu tanggal WITA valid", () => {
    const out = witaDateString(new Date("2026-09-04T16:00:00Z"));
    assert.equal(parseWitaDate(out), "2026-09-05");
  });
});
