/// <reference lib="deno.ns" />
// Vendored dari apps/web/src/lib/zod/rag.ts — JAGA SINKRON.
// Alasan: bundler Edge menolak bare specifier "zod" dari file di luar
// direktori function; file ini memakai "npm:zod" seperti question.ts.
import { z } from "npm:zod@4";

export const ragCitationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
});

export const ragResponseSchema = z.object({
  answer: z.string(),
  entryIds: z.array(z.string().min(1)),
  outside: z.boolean(),
  citations: z.array(ragCitationSchema).optional(),
});
