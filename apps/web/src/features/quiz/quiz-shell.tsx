import { ArrowLeft, BookX, Heart, HeartCrack, RotateCcw } from "lucide-react";
import { useEffect, useReducer, useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { EmptyState } from "../../components/empty-state";
import { Bedawang } from "../../components/bedawang";
import { SessionLevelBadge } from "./quiz-level-badge";
import { addXp, refillHearts, setHearts, updateStreak } from "../../lib/profile-store";
import { MAX_HEARTS, XP_PER_CORRECT } from "../../lib/game-rules";
import { notifyHeartsRefilled } from "../../lib/notify";
import { playCue } from "../../lib/sound";
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
import type { QuizResume } from "./quiz-resume";
import { clearResume, loadResume, saveResume } from "./quiz-resume";

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
        onAnswer={({ matches, cocokkanSalah }) => setAnswer({ matches, cocokkanSalah })}
      />
    );
  }

  if (question.type === "dengar_pilih" || question.type === "kenali_visual") {
    return (
      <div className="space-y-4">
        <KenaliVisualPrompt
          question={question}
          showFeedback={session.showFeedback}
          isCorrect={answer ? isAnswerCorrect(question, answer) : undefined}
        />
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

function ResumeDialog({
  resume,
  total,
  onResume,
  onRestart,
}: {
  resume: QuizResume;
  total: number;
  onResume: () => void;
  onRestart: () => void;
}) {
  const tanggal = new Date(resume.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lanjutkan kuis"
      className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-6 md:max-w-xl text-center"
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-accent/20">
        <RotateCcw className="size-10 text-accent" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Lanjutkan kuis?</h1>
      <p className="mt-2 max-w-[32ch] text-sm text-muted-foreground">
        Terakhir sampai soal ke-{resume.currentIndex + 1} dari {total} ({tanggal}).
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Button
          variant="cta"
          className="h-12 w-full text-base font-bold tracking-wide"
          onClick={onResume}
        >
          Lanjut dari soal ke-{resume.currentIndex + 1}
        </Button>
        <Button variant="outline" className="h-12 w-full" onClick={onRestart}>
          Mulai ulang
        </Button>
      </div>
    </div>
  );
}

function GameOver({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hati habis, kuis berakhir"
        className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-6 md:max-w-xl text-center"
      >
        <Bedawang mood="sedih" className="size-24 drop-shadow-md" />
        <span className="mt-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 animate-card-pop">
          <HeartCrack className="size-7 text-destructive" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Hati kamu habis</h1>
        <p className="mt-2 max-w-[30ch] text-sm text-muted-foreground">
          Nggak apa-apa, salah itu bagian dari belajar. Hati sudah pulih penuh, yuk coba lagi!
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button
            variant="cta"
            className="h-12 w-full gap-2 text-base font-bold tracking-wide"
            onClick={onRetry}
          >
            <RotateCcw className="size-4" aria-hidden /> Coba Lagi
          </Button>
          <Button variant="outline" className="h-12 w-full" onClick={onBack}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
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
    updateStreak();
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
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "Enter" && session.showFeedback) {
        e.preventDefault();
        handleNext();
      } else if (!session.showFeedback && e.key >= "1" && e.key <= "4") {
        const index = Number(e.key) - 1;
        const question = quiz.questions[session.currentIndex];
        if (question && "choices" in question && index < question.choices.length) {
          submitAnswer(session.currentIndex, { selectedIndex: index });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

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
          aria-label={`Soal ${session.currentIndex + 1} dari ${quiz.questions.length}`}
        >
          {quiz.questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-200 ease-out",
                i < session.currentIndex
                  ? "bg-primary"
                  : i === session.currentIndex
                    ? "animate-quiz-progress bg-primary/60"
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
            "flex shrink-0 items-center gap-1 rounded-full bg-card px-2.5 py-1 text-sm font-bold tabular-nums text-destructive",
            hearts <= 2 && "animate-heart-pulse",
          )}
        >
          <Heart className="size-4 fill-current" aria-hidden />
          {hearts}
        </span>
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Soal {session.currentIndex + 1} / {quiz.questions.length}
          </p>
          <SessionLevelBadge level={level} />
        </div>
        {current.type !== "kenali_visual" && (
          <h2 className="mb-4 text-lg font-medium">{current.prompt}</h2>
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
            explanation={
              current.explanation ??
              (current.sourceRef ? `Sumber: ${current.sourceRef}` : undefined)
            }
            sourceRef={current.sourceRef}
            onOpenKbEntry={onOpenKbEntry}
            onNext={handleNext}
            isLast={session.currentIndex === quiz.questions.length - 1}
          />
        )}
      </div>
    </div>
  );
}
