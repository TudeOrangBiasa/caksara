/// <reference lib="deno.ns" />
/// <reference lib="dom" />
// Kunci server baru Supabase berbentuk PLURAL JSON dict, mis.
// SUPABASE_PUBLISHABLE_KEYS = {"default": "sb_publishable_..."}.
// Deno.env.get singular return null — parse ["default"] dengan try/catch.
// Tanpa fallback legacy: string kosong berarti konfigurasi belum lengkap
// (handler balas 500 yang jelas, bukan 500 misterius).
// Tak pernah log nilai kunci — hanya label bila JSON rusak.
// Modul tanpa impor: bisa diuji langsung dari bun (tanpa Deno).

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
