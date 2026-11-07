import { gradeAnswer } from "./quiz-kind";
import type { Quiz } from "../../lib/zod/question";

export interface QuizAnswer {
  selectedIndex?: number;
  ordered?: string[];
  /** Pasangan cocokkan yang terpasang ({kiri: kanan}); soal selesai bila SEMUA pairs cocok. */
  matches?: Record<string, string>;
}

export interface QuizUiState {
  quiz: Quiz;
  currentIndex: number;
  answers: Map<number, QuizAnswer>;
  showFeedback: boolean;
}

export type QuizAction =
  | { type: "ANSWER"; questionIndex: number; answer: QuizAnswer }
  | { type: "NEXT" }
  | { type: "RESET" }
  | { type: "HYDRATE"; currentIndex: number; answers: [number, QuizAnswer][] };

export function quizReducer(state: QuizUiState, action: QuizAction): QuizUiState {
  switch (action.type) {
    case "ANSWER": {
      const answers = new Map(state.answers);
      answers.set(action.questionIndex, action.answer);
      return { ...state, answers, showFeedback: true };
    }
    case "NEXT": {
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.quiz.questions.length - 1),
        showFeedback: false,
      };
    }
    case "RESET": {
      return createSession(state.quiz);
    }
    case "HYDRATE": {
      return {
        ...state,
        currentIndex: Math.min(action.currentIndex, state.quiz.questions.length - 1),
        answers: new Map(action.answers),
        showFeedback: false,
      };
    }
    default:
      return state;
  }
}

export function createSession(quiz: Quiz): QuizUiState {
  return {
    quiz,
    currentIndex: 0,
    answers: new Map(),
    showFeedback: false,
  };
}

export function getScore(session: QuizUiState): { correct: number; total: number } {
  let correct = 0;
  const { questions } = session.quiz;
  session.answers.forEach((answer, qIdx) => {
    const q = questions[qIdx];
    if (q && gradeAnswer(q, answer)) correct++;
  });
  return { correct, total: questions.length };
}

export function isSessionComplete(session: QuizUiState): boolean {
  return session.answers.size === session.quiz.questions.length;
}
