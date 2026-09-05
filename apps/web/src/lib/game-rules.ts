import { witaDateSchema } from "./zod/game-state";
import type { GameState } from "./zod/game-state";

export type { GameState };

export const MAX_HEARTS = 5;
export const XP_PER_CORRECT = 10;

const WITA_OFFSET_MS = 8 * 3_600_000;

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function witaDateString(now: Date): string {
  const wita = new Date(now.getTime() + WITA_OFFSET_MS);
  return `${wita.getUTCFullYear()}-${pad(wita.getUTCMonth() + 1)}-${pad(wita.getUTCDate())}`;
}

export function applyCorrectAnswer(state: GameState): GameState {
  return { ...state, xp: state.xp + XP_PER_CORRECT };
}

export interface WrongAnswerResult {
  state: GameState;
  gameOver: boolean;
}

export function applyWrongAnswer(state: GameState): WrongAnswerResult {
  const hearts = Math.max(0, state.hearts - 1);
  return { state: { ...state, hearts }, gameOver: hearts === 0 };
}

const MS_PER_DAY = 86_400_000;

function shiftWitaDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d) + days * MS_PER_DAY);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

export function refillHeartsForNewDay(state: GameState, now: Date): GameState {
  const today = witaDateString(now);
  if (state.heartsRefilledAt === today) return state;
  return { ...state, hearts: MAX_HEARTS, heartsRefilledAt: today };
}

export function resetStreakForMissedDay(state: GameState, today: string): GameState {
  const validToday = witaDateSchema.parse(today);
  if (state.lastActiveDate === validToday) return state;
  if (state.lastActiveDate !== undefined && shiftWitaDate(state.lastActiveDate, 1) === validToday) {
    return state;
  }
  if (state.streak === 0) return state;
  return { ...state, streak: 0 };
}

export function touchStreakOnActivity(state: GameState, today: string): GameState {
  const validToday = witaDateSchema.parse(today);
  if (state.lastActiveDate === validToday) return state;
  const continued =
    state.lastActiveDate !== undefined && shiftWitaDate(state.lastActiveDate, 1) === validToday;
  return {
    ...state,
    streak: continued ? state.streak + 1 : 1,
    lastActiveDate: validToday,
  };
}
export type Mastery = "belum" | "dipahami" | "ahli";

export interface MasteryInput {
  correctCount: number;
  totalCount: number;
}

// Thresholds stay in code (not KB) so the quiz Edge and the client share one
// interpretation; changing them is a product decision, hence explicit numbers.
export function deriveMastery(input: MasteryInput): Mastery {
  const { correctCount, totalCount } = input;
  if (totalCount <= 0) return "belum";
  const rate = correctCount / totalCount;
  if (totalCount >= 5 && rate >= 0.8) return "ahli";
  if (totalCount >= 3 && rate >= 0.5) return "dipahami";
  return "belum";
}
