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

const questionBase = z.object({
  prompt: z.string().min(1),
  audioUrl: z.string().optional(),
  audioType: z.enum(["original", "latin"]).optional(),
  // Teks Latin yang dibaca saat audio asli belum terkurasi (ADR-0005: bukan TTS aksara).
  latinText: z.string().min(1).optional(),
  explanation: z.string().optional(),
  sourceRef: z.string().optional(),
  aksaraId: z.string().optional(),
  level: z.number().int().min(1).max(3).optional(),
});

const dengarPilihSchema = questionBase.extend({
  type: z.literal("dengar_pilih"),
  choices: z.array(choiceSchema).min(2),
});

const kenaliVisualSchema = questionBase.extend({
  type: z.literal("kenali_visual"),
  choices: z.array(choiceSchema).min(2),
});

const checkpointBudayaSchema = questionBase.extend({
  type: z.literal("checkpoint_budaya"),
  choices: z.array(choiceSchema).min(2),
});

const susunAksaraSchema = questionBase.extend({
  type: z.literal("susun_aksara"),
  tiles: z.array(z.string().min(1)).min(2),
});

const cocokkanSchema = questionBase.extend({
  type: z.literal("cocokkan"),
  pairs: z.array(matchPairSchema).min(1),
});

export const questionSchema = z.discriminatedUnion("type", [
  dengarPilihSchema,
  kenaliVisualSchema,
  checkpointBudayaSchema,
  susunAksaraSchema,
  cocokkanSchema,
]);

export const quizSchema = z.object({
  moduleId: z.string(),
  questions: z.array(questionSchema).min(3).max(8),
});

export type Question = z.infer<typeof questionSchema>;
export type MatchPair = z.infer<typeof matchPairSchema>;
export type Quiz = z.infer<typeof quizSchema>;
