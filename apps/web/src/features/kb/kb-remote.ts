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
    const entry = kbEntrySchema.safeParse({
      id: String(parsed.data.id),
      category: parsed.data.category,
      title: parsed.data.title,
      body: parsed.data.body,
      level: String(parsed.data.level),
      sources,
    });
    if (entry.success) out.push(entry.data);
  }
  return out;
}
