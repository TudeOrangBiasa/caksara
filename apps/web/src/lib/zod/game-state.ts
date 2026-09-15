import { z } from "zod";

/** WITA calendar day. The brand rejects UTC-day strings at compile time. Build via parseWitaDate, never from toISOString(). */
export const witaDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, "Tanggal harus format YYYY-MM-DD.")
  .brand<"WitaDate">();

export type WitaDate = z.infer<typeof witaDateSchema>;

/** Sole constructor for caller-supplied dates. Throws on garbage so a bad date never silently wipes a Streak. */
export function parseWitaDate(input: unknown): WitaDate {
  return witaDateSchema.parse(input);
}

/** Trust boundary: parse freshly loaded storage with parseGameState before handing state to game-rules. */
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
