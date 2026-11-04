import { z } from "zod";

export const ragCitationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
});
export type RagCitation = z.infer<typeof ragCitationSchema>;

/**
 * Kontrak Edge guru-rag (#94 ask + #95 explain): JSON ketat.
 * outside:true → FE render TEACHER_OUTSIDE_REPLY exact, abaikan answer.
 * outside:false → answer + ≥1 entryIds valid wajib; citations = judul chip.
 * Edge memvalidasi bentuk yang sama (supabase/functions/guru-rag/rag-schema.ts,
 * vendored npm:zod — JAGA SINKRON).
 */
export const ragResponseSchema = z.object({
  answer: z.string(),
  entryIds: z.array(z.string().min(1)),
  outside: z.boolean(),
  citations: z.array(ragCitationSchema).optional(),
});
export type RagResponse = z.infer<typeof ragResponseSchema>;
