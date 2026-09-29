import { describe, expect, test } from "bun:test";

import {
  CARD_H,
  CARD_PNG_MAX_BYTES,
  CARD_W,
  exportPng,
  resolveAvatarSrc,
} from "./achievement-card";

describe("resolveAvatarSrc", () => {
  test("foto data:image dipakai langsung", () => {
    expect(resolveAvatarSrc({ kind: "photo", value: "data:image/png;base64,AAA" }, "Made")).toBe(
      "data:image/png;base64,AAA",
    );
  });

  test("foto IP lokal dipakai, path asing ditolak ke IP deterministik", () => {
    expect(resolveAvatarSrc({ kind: "photo", value: "/assets/avatar-fox.webp" }, "Made")).toBe(
      "/assets/avatar-fox.webp",
    );
    const fallback = resolveAvatarSrc(
      { kind: "photo", value: "/assets/bedawang-happy.png" },
      "Made",
    );
    expect(fallback?.startsWith("/assets/avatar-")).toBe(true);
  });

  test("bedawang memakai PNG mood, color kembali ke inisial", () => {
    expect(resolveAvatarSrc({ kind: "bedawang", value: { mood: "semangat" } }, "Made")).toBe(
      "/assets/bedawang-waving.png",
    );
    expect(resolveAvatarSrc({ kind: "color", value: "terakota" }, "Made")).toBeNull();
  });

  test("tanpa avatar memakai IP deterministik per nama", () => {
    const a = resolveAvatarSrc(undefined, "Made Wirawan");
    const b = resolveAvatarSrc(undefined, "Made Wirawan");
    expect(a).toBe(b);
    expect(a?.startsWith("/assets/avatar-")).toBe(true);
  });

  test("dimensi kartu 1080x1350", () => {
    expect(CARD_W).toBe(1080);
    expect(CARD_H).toBe(1350);
  });

  test("exportPng menolak kanvas berdimensi salah", () => {
    const canvas = { width: 100, height: 100, toDataURL: () => "x" } as HTMLCanvasElement;
    expect(exportPng(canvas)).toBeNull();
    expect(CARD_PNG_MAX_BYTES).toBe(450_000);
  });
});
