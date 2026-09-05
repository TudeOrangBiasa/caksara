import { z } from "zod";

export const witaDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, "Tanggal harus format YYYY-MM-DD.");

export const gameStateSchema = z.object({
  xp: z.number().int().nonnegative(),
  hearts: z.number().int().min(0).max(5),
  streak: z.number().int().nonnegative(),
  lastActiveDate: witaDateSchema.optional(),
  heartsRefilledAt: witaDateSchema.optional(),
});

export type GameState = z.infer<typeof gameStateSchema>;

export function parseGameState(input: unknown): GameState {
  return gameStateSchema.parse(input);
}
