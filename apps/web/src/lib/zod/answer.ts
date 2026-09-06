import { z } from "zod";

/** One graded Sesi Kuis response. correct is required because Hati/XP feedback cannot branch on unknown. aksaraId stays optional: non-Wresastra questions have none, and Mastery derives only from answers that carry one. */
export const answerSchema = z.object({
  sessionId: z.number().int().positive(),
  questionIdx: z.number().int().nonnegative(),
  aksaraId: z.string().min(1).optional(),
  correct: z.boolean(),
});

export type Answer = z.infer<typeof answerSchema>;
