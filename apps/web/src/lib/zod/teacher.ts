import { z } from "zod";

export const teacherQuestionSchema = z.object({
  question: z.string().trim().min(1, "Tulis dulu pertanyaannya ya.").max(500),
});

export type TeacherQuestion = z.infer<typeof teacherQuestionSchema>;

export const teacherAnswerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("answer"),
    text: z.string().min(1),
    sourceRefs: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    kind: z.literal("fallback"),
    text: z.string().min(1),
    pills: z.array(z.string().min(1)),
  }),
]);

export type TeacherAnswer = z.infer<typeof teacherAnswerSchema>;
