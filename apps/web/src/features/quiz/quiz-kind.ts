import type { Question } from "../../lib/zod/question";
import type { QuizAnswer } from "./quiz-store";

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function gradeChoice(question: Question, answer: QuizAnswer): boolean {
  if (!("choices" in question) || answer.selectedIndex === undefined) return false;
  return question.choices?.[answer.selectedIndex]?.isCorrect === true;
}

function gradeSusun(question: Question, answer: QuizAnswer): boolean {
  if (!("tiles" in question) || !question.tiles || !answer.ordered) return false;
  return arraysEqual(question.tiles, answer.ordered);
}

function gradeCocokkan(question: Question, answer: QuizAnswer): boolean {
  if (!("pairs" in question) || !question.pairs || !answer.matches) return false;
  if (Object.keys(answer.matches).length !== question.pairs.length) return false;
  return question.pairs.every((p) => answer.matches?.[p.left] === p.right);
}
/** Tipe soal pilihan-ganda (satu jawaban benar dari choices). */
export const CHOICE_KINDS: Record<Question["type"], boolean> = {
  dengar_pilih: true,
  kenali_visual: true,
  checkpoint_budaya: true,
  susun_aksara: false,
  cocokkan: false,
};

/**
 * Satu-satunya seam penilaian: tipe soal → fungsi grade.
 * Tambah tipe baru = satu baris tabel; dispatcher + store ikut tanpa edit.
 */
export const KIND_GRADE: Record<Question["type"], (q: Question, a: QuizAnswer) => boolean> = {
  dengar_pilih: gradeChoice,
  kenali_visual: gradeChoice,
  checkpoint_budaya: gradeChoice,
  susun_aksara: gradeSusun,
  cocokkan: gradeCocokkan,
};

export function gradeAnswer(question: Question, answer: QuizAnswer): boolean {
  return KIND_GRADE[question.type](question, answer);
}
