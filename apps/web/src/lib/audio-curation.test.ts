import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { KB_ENTRIES } from "../features/kb/kb-data";

// Kontrak kurasi audio #105 + #109 (verifikasi FILE, bukan live):
// ≥10 entri KB ber-audioUrl lokal yang ada di public/, SFX lengkap,
// footprint biner kecil, tanpa fetch runtime di kode audio baru.
const root = join(import.meta.dirname, "..", "..", "..", "..");
const pub = (...segs: string[]) => join(root, "apps", "web", "public", ...segs);

describe("kurasi audio #105: ≥10 entri KB dengan audioUrl lokal hidup", () => {
  test("minimal 10 entri punya audioUrl /audio/*.mp3 yang ada di disk", () => {
    const withAudio = KB_ENTRIES.filter((e) => e.audioUrl);
    expect(withAudio.length).toBeGreaterThanOrEqual(10);
    for (const e of withAudio) {
      const url = e.audioUrl as string;
      expect(url.startsWith("/audio/")).toBe(true);
      expect(url.endsWith(".mp3")).toBe(true);
      expect(existsSync(pub(url.slice(1)))).toBe(true);
    }
  });

  test("wresastra ber-audio tepat ka/ba/ca/da/ga (panduan huruf awal)", () => {
    const wre = KB_ENTRIES.filter((e) => e.category === "wresastra" && e.audioUrl);
    expect(wre.map((e) => e.latin).sort()).toEqual(["ba", "ca", "da", "ga", "ka"]);
  });

  test("frasa ber-audio tepat 5 entri kosakata/budaya", () => {
    const ids = KB_ENTRIES.filter((e) => e.category !== "wresastra" && e.audioUrl)
      .map((e) => e.id)
      .sort();
    expect(ids).toEqual([
      "kb_ampura",
      "kb_canang_sari",
      "kb_madaar_ngajeng",
      "kb_matur_suksma",
      "kb_titiang",
    ]);
  });

  test("NOTICE-AUDIO.md provenance ada", () => {
    expect(existsSync(pub("audio", "NOTICE-AUDIO.md"))).toBe(true);
  });
});

describe("SFX Kenney #109: 8 klip + notice", () => {
  test("semua cue di sound.ts punya file ogg", () => {
    for (const f of ["success", "error", "press", "toggle", "sparkle", "chime"]) {
      expect(existsSync(pub("sfx", `${f}.ogg`))).toBe(true);
    }
    expect(existsSync(pub("sfx", "NOTICE-SFX.md"))).toBe(true);
  });
});

describe("footprint biner: audio+sfx ≤ 2 MB", () => {
  test("total mp3+ogg di public kecil", () => {
    let total = 0;
    for (const dir of ["audio", "sfx"]) {
      for (const f of readdirSync(pub(dir))) {
        if (f.endsWith(".mp3") || f.endsWith(".ogg")) total += statSync(pub(dir, f)).size;
      }
    }
    expect(total).toBeLessThan(2 * 1024 * 1024);
  });
});
