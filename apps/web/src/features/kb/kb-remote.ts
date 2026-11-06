import { kbRemoteRowSchema } from "../../lib/zod/kb";
import { kbCategorySchema, kbEntrySchema } from "./kb-data";
import type { KbEntry } from "./kb-data";

export interface SupabaseKbRow {
  id: number | string;
  category: string;
  title: string;
  body: string;
  source: string;
  level: number | string;
  /** Kolom glyph Supabase (opsional) — bila ada dipakai langsung; bila absen
   * diekstrak dari pola "Aksara: <glyph> (Latin: …)" di mana pun dalam body. */
  glyph?: string | null;
  latin?: string | null;
  /** #105: kolom audio_url Supabase (opsional) — URL Storage /audio/... bila sudah diunggah. */
  audio_url?: string | null;
}

/** Pecah kolom source seed ("Nama — ket\n...") jadi daftar sumber terstruktur. */
function splitSources(source: string): { nama: string; ket: string }[] {
  const out = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [nama, ...rest] = line.split("—").map((p) => p.trim());
      const ket = rest.join("—").trim();
      return { nama: nama ?? line, ket: ket || "Rujukan KB" };
    })
    .filter((s) => s.nama.length > 0);
  return out.length > 0 ? out : [{ nama: source.trim() || "Rujukan KB", ket: "Rujukan KB" }];
}

/**
 * Ubah baris kb_entries Supabase menjadi KbEntry lokal — SSOT kategori:
 * kbCategorySchema (kb-data.ts). ID dipertahankan apa adanya (tanpa prefix)
 * supaya detail bisa ditelusuri balik dari Sesi & Guru; baris tak valid atau
 * berkategori asing dibuang (bukan dipetakan diam-diam) agar daftar tidak
 * menampilkan data semu.
 */
export function parseSupabaseKbRows(rows: SupabaseKbRow[] | null | undefined): KbEntry[] {
  if (!rows || rows.length === 0) return [];
  const out: KbEntry[] = [];
  for (const row of rows) {
    const parsed = kbRemoteRowSchema.safeParse(row);
    if (!parsed.success) continue;
    if (!kbCategorySchema.safeParse(parsed.data.category).success) continue;
    const sources = splitSources(parsed.data.source);
    const glyph = parsed.data.glyph?.trim() || extractGlyph(parsed.data.body);
    const latin = parsed.data.latin?.trim() || extractLatin(parsed.data.body);
    const entry = kbEntrySchema.safeParse({
      id: String(parsed.data.id),
      category: parsed.data.category,
      title: parsed.data.title,
      ...(glyph ? { glyph } : {}),
      ...(latin ? { latin } : {}),
      body: parsed.data.body,
      level: String(parsed.data.level),
      sources,
      ...(row.audio_url?.trim() ? { audioUrl: row.audio_url.trim() } : {}),
    });
    if (entry.success) out.push(entry.data);
  }
  return out;
}

/**
 * Ekstrak glyph dari pola "Aksara: ᬳ (Latin: ha)" di posisi mana pun dalam
 * body — seed menaruhnya di awal, tapi body remote bisa berawalan lain.
 */
function extractGlyph(body: string): string | undefined {
  const m = body.match(/Aksara:\s*([ᬀ-᭿]+)/iu);
  return m?.[1];
}

/** Ekstrak "(Latin: xxx)" dari body bila kolom latin absen. */
function extractLatin(body: string): string | undefined {
  const m = body.match(/\(Latin\s*:\s*([^)]+?)\)/iu);
  return m?.[1]?.trim() || undefined;
}
