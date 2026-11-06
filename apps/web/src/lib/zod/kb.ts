import { z } from "zod";

/**
 * Baris kb_entries Supabase (ADR-0002: read-only publik via policy
 * public_read_kb). Kolom embedding opsional diabaikan — MVP cukup query
 * by category + level (ADR-0009), bukan pgvector.
 */
export const kbRemoteRowSchema = z.object({
  id: z.union([z.number().int().positive(), z.string().trim().min(1)]),
  category: z.string().trim().min(1),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  source: z.string().trim().min(1),
  level: z.coerce.number().int().min(1).max(3),
  glyph: z.string().trim().min(1).nullish(),
  latin: z.string().trim().min(1).nullish(),
});

export type KbRemoteRow = z.infer<typeof kbRemoteRowSchema>;
