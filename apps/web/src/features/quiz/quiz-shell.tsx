import { ArrowLeft, Heart, HeartCrack, RotateCcw } from "lucide-react";
import { useEffect, useReducer, useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { addXp, refillHearts, setHearts, updateStreak } from "../../lib/profile-store";
import { notifyHeartsRefilled } from "../../lib/notify";
import { playCue } from "../../lib/sound";
import type { Question, Quiz } from "../../lib/zod/question";
import { Cocokkan } from "./quiz-cocokkan";
import { SusunAksara } from "./quiz-susun";
import { QuizChoice } from "./quiz-choice";
import { QuizFeedback } from "./quiz-feedback";
import { KenaliVisualPrompt } from "./quiz-visual";
import {
  createSession,
  getScore,
  isSessionComplete,
  isAnswerCorrect,
  quizReducer,
} from "./quiz-store";
import type { QuizAnswer, QuizSession } from "./quiz-store";

const XP_PER_CORRECT = 10;

interface QuizShellProps {
  quiz: Quiz;
  initialHearts: number;
  onFinish: (score: { correct: number; total: number }) => void;
  onBack: () => void;
}

function QuestionBody({
  question,
  session,
  setAnswer,
}: {
  question: Question;
  session: QuizSession;
  setAnswer: (answer: QuizAnswer) => void;
}) {
  const answer = session.answers.get(session.currentIndex);

  if (question.type === "susun_aksara" && question.tiles) {
    return (
      <SusunAksara
        tiles={question.tiles}
        disabled={session.showFeedback}
        onAnswer={(ordered) => setAnswer({ ordered })}
      />
    );
  }

  if (question.type === "cocokkan" && question.pairs) {
    return (
      <Cocokkan
        pairs={question.pairs}
        disabled={session.showFeedback}
        onAnswer={(left, right) => setAnswer({ match: { left, right } })}
      />
    );
  }

  if (question.type === "dengar_pilih" || question.type === "kenali_visual") {
    return (
      <div className="space-y-4">
        <KenaliVisualPrompt question={question} />
        <QuizChoice
          question={question}
          selectedIndex={answer?.selectedIndex ?? null}
          showFeedback={session.showFeedback}
          onSelect={(i) => setAnswer({ selectedIndex: i })}
        />
      </div>
    );
  }

  return (
    <QuizChoice
      question={question}
      selectedIndex={answer?.selectedIndex ?? null}
      showFeedback={session.showFeedback}
      onSelect={(i) => setAnswer({ selectedIndex: i })}
    />
  );
}

function GameOver({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-6 md:max-w-xl text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <HeartCrack className="size-10 text-destructive" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Hati kamu habis</h1>
      <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
        Nggak apa-apa, salah itu bagian dari belajar. Hati sudah pulih penuh, yuk coba lagi!
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Button className="h-12 w-full gap-2 text-base" onClick={onRetry}>
          <RotateCcw className="size-4" /> Coba Lagi
        </Button>
        <Button variant="outline" className="h-12 w-full" onClick={onBack}>
          Kembali
        </Button>
      </div>
    </div>
  );
}

export function QuizShell({ quiz, initialHearts, onFinish, onBack }: QuizShellProps) {
  const [session, dispatch] = useReducer(quizReducer, quiz, createSession);
  const [hearts, setHeartsState] = useState(initialHearts);
  const [gameOver, setGameOver] = useState(false);
  const current = quiz.questions[session.currentIndex];
  if (!current) return null;

  useEffect(() => {
    updateStreak();
    if (refillHearts()) notifyHeartsRefilled();
  }, []);

  const submitAnswer = (questionIndex: number, answer: QuizAnswer) => {
    if (session.answers.has(questionIndex)) return;
    dispatch({ type: "ANSWER", questionIndex, answer });

    const question = quiz.questions[questionIndex];
    if (isAnswerCorrect(question, answer)) {
      addXp(XP_PER_CORRECT);
      playCue("success");
    } else if (hearts > 0) {
      const next = hearts - 1;
      setHeartsState(next);
      setHearts(next);
      if (next === 0) setGameOver(true);
      playCue("error");
    }
  };

  const handleRetry = () => {
    setHeartsState(5);
    setHearts(5);
    setGameOver(false);
    dispatch({ type: "RESET" });
  };

  const handleNext = () => {
    if (isSessionComplete(session)) {
      onFinish(getScore(session));
    } else {
      dispatch({ type: "NEXT" });
    }
  };

  if (gameOver) {
    return <GameOver onRetry={handleRetry} onBack={onBack} />;
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col px-4 py-5 md:max-w-xl">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Keluar dari kuis"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div
          className="flex flex-1 gap-1"
          role="progressbar"
          aria-valuenow={session.currentIndex + 1}
          aria-valuemin={0}
          aria-valuemax={quiz.questions.length}
        >
          {quiz.questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                i < session.currentIndex
                  ? "bg-primary"
                  : i === session.currentIndex
                    ? "bg-primary/60"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full bg-card px-2.5 py-1 text-sm font-bold tabular-nums text-destructive",
            hearts <= 2 && "animate-heart-pulse",
          )}
        >
          <Heart className="size-4 fill-current" />
          {hearts}
        </span>
      </div>

      <div className="flex-1">
        <p className="mb-1 text-xs text-muted-foreground">
          Soal {session.currentIndex + 1} / {quiz.questions.length}
        </p>
        {current.type !== "kenali_visual" && (
          <h2 className="mb-4 text-lg font-medium">{current.prompt}</h2>
        )}

        <QuestionBody
          question={current}
          session={session}
          setAnswer={(answer) => submitAnswer(session.currentIndex, answer)}
        />

        {session.showFeedback && (
          <QuizFeedback
            isCorrect={isAnswerCorrect(current, session.answers.get(session.currentIndex) ?? {})}
            explanation={current.explanation}
            onNext={handleNext}
            isLast={session.currentIndex === quiz.questions.length - 1}
          />
        )}
      </div>
    </div>
  );
}
