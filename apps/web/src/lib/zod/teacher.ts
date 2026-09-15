import { z } from "zod";

/** Learner question to Guru Virtual. The 500-char cap is provisional abuse control; revisit when the Edge consumer lands. */
export const teacherQuestionSchema = z.object({
  question: z.string().trim().min(1, "Tulis dulu pertanyaannya ya.").max(500),
});

export type TeacherQuestion = z.infer<typeof teacherQuestionSchema>;

/** Guru Virtual reply. Cited answers map sourceRefs[] onto question sourceRef entries at the consumer; fallbacks always carry pills per #26. Branch on kind, never on text shape. */
export const teacherAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("answer"),
    text: z.string().trim().min(1),
    sourceRefs: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    kind: z.literal("fallback"),
    text: z.string().trim().min(1),
    pills: z.array(z.string().trim().min(1)).min(1),
  }),
]);

export type TeacherAnswer = z.infer<typeof teacherAnswerSchema>;
