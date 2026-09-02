import { z } from "zod";

export const choiceSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  type: z.enum(["dengar_pilih", "susun_aksara", "kenali_visual", "checkpoint", "cocokkan"]),
  prompt: z.string().min(1),
  audioUrl: z.string().optional(),
  choices: z.array(choiceSchema).length(4),
  explanation: z.string().optional(),
  sourceRef: z.string().optional(),
  aksaraId: z.string().optional(),
  level: z.number().int().min(1).max(3).optional(),
});

export const quizSchema = z.object({
  moduleId: z.string(),
  questions: z.array(questionSchema).min(3).max(8),
});

export type Question = z.infer<typeof questionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
