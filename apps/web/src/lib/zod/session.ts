import { z } from "zod";

export const sessionStatusSchema = z.enum(["in_progress", "done"]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const sessionSchema = z.object({
  profileId: z.string().min(1),
  moduleId: z.string().min(1),
  status: sessionStatusSchema,
  score: z.number().int().nonnegative(),
  currentIndex: z.number().int().nonnegative(),
});

export type QuizSession = z.infer<typeof sessionSchema>;
