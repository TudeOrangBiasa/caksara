import { z } from "zod";

/** Lifecycle values. Provisional pair: #22 names actions (Lanjut/Mulai Ulang), not these strings. Revisit when the store consumer lands. */
export const sessionStatusSchema = z.enum(["in_progress", "done"]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

/** Sesi Kuis progress for resume (Lanjut vs Mulai Ulang). currentIndex reopens the session where the learner left it. */
export const sessionSchema = z.object({
  profileId: z.string().min(1),
  moduleId: z.string().min(1),
  status: sessionStatusSchema,
  score: z.number().int().nonnegative(),
  currentIndex: z.number().int().nonnegative(),
});

export type QuizSession = z.infer<typeof sessionSchema>;
