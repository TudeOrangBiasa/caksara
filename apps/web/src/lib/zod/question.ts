import { z } from "zod";

export const choiceSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const questionTypeSchema = z.enum([
  "dengar_pilih",
  "susun_aksara",
  "kenali_visual",
  "checkpoint_budaya",
  "cocokkan",
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

const matchPairSchema = z.object({
  left: z.string().min(1),
  right: z.string().min(1),
});

export const questionSchema = z.object({
  type: questionTypeSchema,
  prompt: z.string().min(1),
  audioUrl: z.string().optional(),
  audioType: z.enum(["original", "latin"]).optional(),
  choices: z.array(choiceSchema).length(4).optional(),
  tiles: z.array(z.string().min(1)).optional(),
  pairs: z.array(matchPairSchema).optional(),
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
export type MatchPair = z.infer<typeof matchPairSchema>;
export type Quiz = z.infer<typeof quizSchema>;
