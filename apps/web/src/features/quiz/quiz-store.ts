import type { Question, Quiz } from "../../lib/zod/question";

export interface QuizAnswer {
  selectedIndex?: number;
  ordered?: string[];
  match?: { left: string; right: string };
}

export interface QuizSession {
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

export function quizReducer(state: QuizSession, action: QuizAction): QuizSession {
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

export function createSession(quiz: Quiz): QuizSession {
  return {
    quiz,
    currentIndex: 0,
    answers: new Map(),
    showFeedback: false,
  };
}

export function isAnswerCorrect(question: Question, answer: QuizAnswer): boolean {
  switch (question.type) {
    case "kenali_visual":
    case "dengar_pilih":
    case "checkpoint_budaya": {
      if (answer.selectedIndex === undefined) return false;
      return question.choices?.[answer.selectedIndex]?.isCorrect === true;
    }
    case "susun_aksara": {
      if (!question.tiles || !answer.ordered) return false;
      return arraysEqual(question.tiles, answer.ordered);
    }
    case "cocokkan": {
      if (!question.pairs || !answer.match) return false;
      const pair = question.pairs.find((p) => p.left === answer.match?.left);
      return pair?.right === answer.match?.right;
    }
    default:
      return false;
  }
}

export function getScore(session: QuizSession): { correct: number; total: number } {
  let correct = 0;
  const { questions } = session.quiz;
  session.answers.forEach((answer, qIdx) => {
    const q = questions[qIdx];
    if (q && isAnswerCorrect(q, answer)) correct++;
  });
  return { correct, total: questions.length };
}

export function isSessionComplete(session: QuizSession): boolean {
  return session.answers.size === session.quiz.questions.length;
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
