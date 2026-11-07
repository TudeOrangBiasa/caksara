import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { kbMatchesFilter } from "./kb-filter";
import type { KbCategoryFilter, KbFilterInput, KbLevelFilter } from "./kb-filter";

const ha: KbFilterInput = {
  category: "wresastra",
  title: "Aksara ha",
  latin: "ha",
  body: "aksara dasar ha",
  level: "1",
};
const galungan: KbFilterInput = {
  category: "budaya",
  title: "Galungan",
  latin: "Galungan",
  body: "kemenangan dharma",
  level: "2",
};

function semua(query: string): { category: KbCategoryFilter; level: KbLevelFilter; query: string } {
  return { category: "semua", level: "semua", query };
}

describe("filter KB #25 — kategori + level + search", () => {
  test("tanpa filter semua entri tampil", () => {
    assert.equal(kbMatchesFilter(ha, { category: "semua", level: "semua", query: "" }), true);
  });

  test("filter kategori menyaring entri lain", () => {
    assert.equal(
      kbMatchesFilter(galungan, { category: "wresastra", level: "semua", query: "" }),
      false,
    );
    assert.equal(
      kbMatchesFilter(galungan, { category: "budaya", level: "semua", query: "" }),
      true,
    );
  });

  test("filter level menyaring entri level lain", () => {
    assert.equal(kbMatchesFilter(ha, { category: "semua", level: "2", query: "" }), false);
    assert.equal(kbMatchesFilter(galungan, { category: "semua", level: "2", query: "" }), true);
  });

  test("search cocok di judul/latin/isi, case-insensitive", () => {
    assert.equal(kbMatchesFilter(ha, semua("HA")), true);
    assert.equal(kbMatchesFilter(galungan, semua("dharma")), true);
    assert.equal(kbMatchesFilter(ha, semua("galungan")), false);
  });

  test("spasi search diabaikan", () => {
    assert.equal(kbMatchesFilter(ha, { category: "semua", level: "semua", query: "  " }), true);
  });

  test("kombinasi filter bekerja bersama", () => {
    assert.equal(kbMatchesFilter(galungan, { category: "budaya", level: "3", query: "" }), false);
    assert.equal(
      kbMatchesFilter(galungan, { category: "budaya", level: "2", query: "galung" }),
      true,
    );
  });
});
