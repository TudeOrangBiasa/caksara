// Seed kb_entries + modules dari data lokal (ADR-0003).
// Pakai: bun run db:seed  (baca apps/web/.env)
// RLS hanya mengizinkan insert via policy sementara "tmp_seed_insert"
// (dibuat manual sebelum seed, di-drop setelahnya), jadi tanpa service_role key:
//   create policy "tmp_seed_insert" on public.kb_entries for insert to authenticated with check (true);
//   create policy "tmp_seed_insert" on public.modules for insert to authenticated with check (true);
// Idempoten: lewati tabel yang sudah berisi baris.
import { createClient } from "@supabase/supabase-js";

import { KB_ENTRIES } from "../apps/web/src/features/kb/kb-data";
import { courseModules } from "../apps/web/src/features/module/module-data";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY kosong — isi apps/web/.env");
}

const supabase = createClient(url, key);
const { data: auth, error: authError } = await supabase.auth.signInAnonymously();
if (authError || !auth.session) {
  throw new Error("signInAnonymously gagal: " + authError?.message);
}

async function tableEmpty(table: string): Promise<boolean> {
  const { data, error } = await supabase.from(table).select("id").limit(1);
  if (error) throw new Error(`cek ${table} gagal: ${error.message}`);
  return (data ?? []).length === 0;
}

if (await tableEmpty("kb_entries")) {
  const rows = KB_ENTRIES.map((e) => ({
    category: e.category,
    title: e.title,
    body:
      e.glyph || e.latin
        ? `Aksara: ${e.glyph ?? "-"} (Latin: ${e.latin ?? "-"})\n\n${e.body}`
        : e.body,
    source: e.sources.map((s) => `${s.nama} — ${s.ket}`).join("\n"),
    level: Number(e.level),
  }));
  const { error } = await supabase.from("kb_entries").insert(rows);
  if (error) throw new Error("seed kb_entries gagal: " + error.message);
  console.log(`kb_entries: +${rows.length} baris`);
} else {
  console.log("kb_entries: sudah terisi, dilewati");
}

if (await tableEmpty("modules")) {
  const sorted = [...courseModules].sort((a, b) => a.order - b.order);
  const rows = sorted.map((m, i) => ({
    id: m.id,
    title: m.title,
    theme: `${m.theme} — ${m.description}`,
    order: m.order,
    prereq_id: i > 0 ? sorted[i - 1].id : null,
  }));
  const { error } = await supabase.from("modules").insert(rows);
  if (error) throw new Error("seed modules gagal: " + error.message);
  console.log(`modules: +${rows.length} baris`);
} else {
  console.log("modules: sudah terisi, dilewati");
}
