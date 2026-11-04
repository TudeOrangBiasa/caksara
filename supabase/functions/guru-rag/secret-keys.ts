/// <reference lib="deno.ns" />
/// <reference lib="dom" />
// Vendored dari ../generate-quiz/secret-keys.ts — JAGA SINKRON.
// Alasan: path relatif keluar direktori function tidak stabil saat bundling
// server-side (lihat komentar question.ts), jadi tiap function bawa salinan.
// Kunci server Supabase berbentuk PLURAL JSON dict,
// {"default": "sb_..."} — parse ["default"], tanpa fallback legacy.
export function secretFromJsonPlural(raw: string | undefined, label: string): string {
  if (!raw) return "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(`[${label}] bukan JSON valid`);
    return "";
  }
  if (parsed && typeof parsed === "object" && "default" in parsed) {
    const def: unknown = parsed.default;
    return typeof def === "string" ? def : "";
  }
  return "";
}
