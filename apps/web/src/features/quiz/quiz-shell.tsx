import { ArrowLeft, BookX, Heart } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { EmptyState } from "../../components/empty-state";
import { SessionLevelBadge } from "./quiz-level-badge";
import { QuestionBody } from "./quiz-question-body";
import { ResumeDialog } from "./quiz-resume-dialog";
import { GameOver } from "./quiz-game-over";
import { addXp, refillHearts, setHearts, updateStreak } from "../../lib/profile-store";
import { MAX_HEARTS, XP_PER_CORRECT } from "../../lib/game-rules";
import { notifyHeartsRefilled } from "../../lib/notify";
import { playCue } from "../../lib/sound";
import { QuizFeedback } from "./quiz-feedback";
import {
  createSession,
  getScore,
  isSessionComplete,
  isAnswerCorrect,
  quizReducer,
} from "./quiz-store";
import type { QuizAnswer } from "./quiz-store";
import type { QuizResume } from "./quiz-resume";
import { clearResume, loadResume, saveResume } from "./quiz-resume";
import type { Quiz } from "../../lib/zod/question";

export interface QuizFinishDetail {
  questionIndex: number;
  correct: boolean;
  aksaraId?: string;
}

interface QuizShellProps {
  quiz: Quiz;
  moduleId: string;
  /** Level adaptif sesi ini (#33 V11a) — tampil sebagai badge di header. */
  level?: number;
  initialHearts: number;
  onFinish: (score: { correct: number; total: number }, detail: QuizFinishDetail[]) => void;
  onBack: () => void;
  /** Tautan balik kecil sourceRef → entri KB (deep-link /kb/:id bila rute ada). */
  onOpenKbEntry?: (entryId: string) => void;
}

export function QuizShell({
  quiz,
  moduleId,
  level,
  initialHearts,
  onFinish,
  onBack,
  onOpenKbEntry,
}: QuizShellProps) {
  const [session, dispatch] = useReducer(quizReducer, quiz, createSession);
  const [hearts, setHeartsState] = useState(initialHearts);
  const [gameOver, setGameOver] = useState(initialHearts <= 0);
  const [resumeOffer, setResumeOffer] = useState<QuizResume | null>(() => loadResume(moduleId));
  const [resumed, setResumed] = useState(false);
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
  const handleNext = () => {
    if (isSessionComplete(session)) {
      clearResume(moduleId);
      const detail: QuizFinishDetail[] = [...session.answers.entries()].map(
        ([questionIndex, answer]) => {
          const q = quiz.questions[questionIndex];
          return {
            questionIndex,
            correct: q ? isAnswerCorrect(q, answer) : false,
            aksaraId: q?.aksaraId,
          };
        },
      );
      onFinish(getScore(session), detail);
    } else {
      dispatch({ type: "NEXT" });
    }
  };

  const current = quiz.questions[session.currentIndex];

  useEffect(() => {
    if (updateStreak()) playCue("streak");
    if (refillHearts()) notifyHeartsRefilled();
  }, []);

  // Buffer lokal: simpan progres tiap jawaban (kecuali dialog resume masih terbuka).
  useEffect(() => {
    if (!current) return;
    if (resumeOffer && !resumed) return;
    if (isSessionComplete(session)) return;
    saveResume({
      moduleId,
      currentIndex: session.currentIndex,
      answers: [...session.answers.entries()],
      hearts,
      updatedAt: Date.now(),
    });
  }, [current, session, hearts, moduleId, resumeOffer, resumed]);

  // Keyboard desktop (#22): 1-4 memilih, Enter lanjut setelah feedback.
  // Listener didaftar sekali; state terbaru dibaca lewat ref agar closure tak basi (#46).
  const keyStateRef = useRef({
    showFeedback: session.showFeedback,
    currentIndex: session.currentIndex,
    questions: quiz.questions,
    handleNext,
    submitAnswer,
  });
  keyStateRef.current = {
    showFeedback: session.showFeedback,
    currentIndex: session.currentIndex,
    questions: quiz.questions,
    handleNext,
    submitAnswer,
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const latest = keyStateRef.current;
      if (e.key === "Enter" && latest.showFeedback) {
        e.preventDefault();
        latest.handleNext();
      } else if (!latest.showFeedback && e.key >= "1" && e.key <= "4") {
        const index = Number(e.key) - 1;
        const question = latest.questions[latest.currentIndex];
        if (question && "choices" in question && index < question.choices.length) {
          latest.submitAnswer(latest.currentIndex, { selectedIndex: index });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleResume = () => {
    const offer = resumeOffer;
    if (offer) {
      dispatch({ type: "HYDRATE", currentIndex: offer.currentIndex, answers: offer.answers });
      setHeartsState(offer.hearts);
    }
    setResumed(true);
  };

  const handleRestart = () => {
    clearResume(moduleId);
    setResumeOffer(null);
    setResumed(true);
  };

  const handleRetry = () => {
    clearResume(moduleId);
    setHeartsState(MAX_HEARTS);
    setHearts(MAX_HEARTS);
    setGameOver(false);
    dispatch({ type: "RESET" });
  };

  if (quiz.questions.length === 0) {
    return (
      <EmptyState
        illustration={<BookX className="size-7" />}
        title="Belum ada soal"
        body="Modul ini belum punya soal. Balik dulu, kami siapkan materinya."
        action={
          <Button
            variant="cta"
            className="h-12 w-full text-base font-bold tracking-wide"
            onClick={onBack}
          >
            Kembali
          </Button>
        }
      />
    );
  }

  if (gameOver) {
    return <GameOver onRetry={handleRetry} onBack={onBack} />;
  }

  if (resumeOffer && !resumed) {
    return (
      <ResumeDialog
        resume={resumeOffer}
        total={quiz.questions.length}
        onResume={handleResume}
        onRestart={handleRestart}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col px-4 py-5 md:max-w-xl lg:max-w-[576px] lg:px-0 lg:py-0 lg:pt-5">
      <div className="mb-5 flex items-center gap-3 lg:mb-0 lg:h-8 lg:gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Keluar dari kuis"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:size-8"
        >
          <ArrowLeft className="size-5 lg:size-4" />
        </button>
        <div
          className="flex flex-1 gap-1 lg:gap-2"
          role="progressbar"
          aria-valuenow={session.currentIndex + 1}
          aria-valuemin={0}
          aria-valuemax={quiz.questions.length}
          aria-label={`Soal ${session.currentIndex + 1} dari ${quiz.questions.length}`}
        >
          {quiz.questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2.5 flex-1 rounded-full transition-colors duration-300 ease-out lg:h-4",
                i < session.currentIndex
                  ? "bg-primary"
                  : i === session.currentIndex
                    ? "animate-quiz-progress bg-primary"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
        <span
          role="status"
          aria-live="polite"
          aria-label={`Sisa ${hearts} Hati`}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full bg-card px-2.5 py-1 text-sm font-bold tabular-nums text-destructive ring-1 ring-border/60 lg:gap-1 lg:px-2.5 lg:py-1 lg:text-base",
            hearts <= 2 && "animate-heart-pulse",
          )}
        >
          <Heart className="size-4 fill-current lg:size-5" aria-hidden />
          {hearts}
        </span>
      </div>

      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between gap-2 lg:mt-5 lg:mb-0 lg:h-4 lg:gap-2">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase lg:text-[13px] lg:font-extrabold lg:leading-4 lg:tracking-[0.8px]">
            Soal {session.currentIndex + 1} / {quiz.questions.length}
          </p>
          <SessionLevelBadge level={level} />
        </div>
        {current.type !== "kenali_visual" && (
          <h2 className="mb-4 text-xl font-extrabold tracking-tight text-foreground lg:mt-0 lg:mb-0 lg:text-[22px] lg:leading-[27px] lg:tracking-normal">
            {current.prompt}
          </h2>
        )}
        <div key={session.currentIndex} className="animate-slide-up">
          <QuestionBody
            question={current}
            session={session}
            setAnswer={(answer) => submitAnswer(session.currentIndex, answer)}
          />
        </div>

        {session.showFeedback && (
          <QuizFeedback
            isCorrect={isAnswerCorrect(current, session.answers.get(session.currentIndex) ?? {})}
            explanation={current.explanation}
            sourceRef={current.sourceRef}
            aksaraId={current.aksaraId}
            prompt={current.prompt}
            answer={session.answers.get(session.currentIndex)}
            choices={"choices" in current ? current.choices : undefined}
            onOpenKbEntry={onOpenKbEntry}
            onNext={handleNext}
            isLast={session.currentIndex === quiz.questions.length - 1}
          />
        )}
      </div>
    </div>
  );
}
