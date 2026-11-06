import { z } from "zod";

import { KB_ENTRIES } from "../features/kb/kb-data";

/**
 * Helper transliterasi Latin ↔ aksara Bali, tabel rule terbatas.
 * Murni tanpa network: hanya memetakan input ke tabel dari KB repo sendiri
 * (18 Wresastra + frasa sapaan/budaya yang punya glyph di KB).
 * Input di luar tabel → pesan aman, bukan panggilan API/Gemini.
 */
export const UNSUPPORTED_MESSAGE = "Belum didukung; coba aksara di KB";

export const transliterateInputSchema = z.object({
  latin: z.string().trim().min(1).max(280),
});

export const transliterateGlyphInputSchema = z.object({
  glyph: z.string().trim().min(1).max(280),
});

export const transliterateResultSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    glyph: z.string().min(1),
    matched: z.array(z.string().min(1)),
  }),
  z.object({ ok: z.literal(false), message: z.string().min(1) }),
]);

export type TransliterateResult = z.infer<typeof transliterateResultSchema>;

export const transliterateBackResultSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    latin: z.string().min(1),
    matched: z.array(z.string().min(1)),
  }),
  z.object({ ok: z.literal(false), message: z.string().min(1) }),
]);

export type TransliterateBackResult = z.infer<typeof transliterateBackResultSchema>;

interface PhraseRow {
  latin: string;
  glyph: string;
}

// Tabel frasa: entri KB yang punya latin + glyph (sapaan & budaya).
// Diturunkan dari KB repo sendiri agar selalu sinkron dengan materi.
const PHRASE_TABLE: PhraseRow[] = KB_ENTRIES.flatMap((e) => {
  if (typeof e.latin !== "string" || e.latin.length === 0) return [];
  if (typeof e.glyph !== "string" || e.glyph.length === 0) return [];
  const latins = e.latin
    .split(/[·|]/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return latins.map((latin) => ({ latin, glyph: e.glyph as string }));
});
const latinToGlyphMap = new Map<string, { glyph: string; key: string }>();
const glyphToLatinMap = new Map<string, string>();
for (const row of PHRASE_TABLE) {
  const key = row.latin.toLowerCase();
  if (!latinToGlyphMap.has(key)) latinToGlyphMap.set(key, { glyph: row.glyph, key: row.latin });
  if (!glyphToLatinMap.has(row.glyph)) glyphToLatinMap.set(row.glyph, row.latin);
}

function unsupported(): TransliterateResult {
  return { ok: false, message: UNSUPPORTED_MESSAGE };
}

/**
 * Latin → glyph. Cocokkan frasa utuh dulu, lalu greedy per kata
 * (jendela 2 kata untuk "Om Swastiastu" dkk, lalu 1 kata/suku kata).
 */
export function latinToGlyph(raw: string): TransliterateResult {
  const parsed = transliterateInputSchema.safeParse({ latin: raw });
  if (!parsed.success) return unsupported();
  const input = parsed.data.latin.replaceAll(/\s+/gu, " ");
  const whole = latinToGlyphMap.get(input.toLowerCase());
  if (whole) return { ok: true, glyph: whole.glyph, matched: [whole.key] };

  const words = input.split(" ");
  const glyphs: string[] = [];
  const matched: string[] = [];
  let i = 0;
  while (i < words.length) {
    const two = i + 1 < words.length ? `${words[i]} ${words[i + 1]}`.toLowerCase() : null;
    const twoHit = two ? latinToGlyphMap.get(two) : undefined;
    if (twoHit) {
      glyphs.push(twoHit.glyph);
      matched.push(twoHit.key);
      i += 2;
      continue;
    }
    const oneHit = latinToGlyphMap.get(words[i].toLowerCase());
    if (!oneHit) return unsupported();
    glyphs.push(oneHit.glyph);
    matched.push(oneHit.key);
    i += 1;
  }
  const result = { ok: true as const, glyph: glyphs.join(" "), matched };
  return transliterateResultSchema.parse(result);
}

/** Glyph → Latin (balikan tabel yang sama, dipisah spasi per kata). */
export function glyphToLatin(raw: string): TransliterateBackResult {
  const parsed = transliterateGlyphInputSchema.safeParse({ glyph: raw });
  if (!parsed.success) return { ok: false, message: UNSUPPORTED_MESSAGE };
  const input = parsed.data.glyph.replaceAll(/\s+/gu, " ").trim();
  const whole = glyphToLatinMap.get(input);
  if (whole) return { ok: true, latin: whole, matched: [input] };

  const tokens = input.split(" ");
  const latins: string[] = [];
  for (const token of tokens) {
    const hit = glyphToLatinMap.get(token);
    if (!hit) return { ok: false, message: UNSUPPORTED_MESSAGE };
    latins.push(hit);
  }
  const result = { ok: true as const, latin: latins.join(" "), matched: tokens };
  return transliterateBackResultSchema.parse(result);
}
