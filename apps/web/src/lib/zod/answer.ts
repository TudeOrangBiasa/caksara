import { z } from "zod";

export const answerSchema = z.object({
  sessionId: z.number().int().positive(),
  questionIdx: z.number().int().nonnegative(),
  aksaraId: z.string().min(1).optional(),
  correct: z.boolean(),
});

export type Answer = z.infer<typeof answerSchema>;
