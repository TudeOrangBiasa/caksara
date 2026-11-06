import { Cocokkan } from "./quiz-cocokkan";
import { SusunAksara } from "./quiz-susun";
import { QuizChoice } from "./quiz-choice";
import { KenaliVisualPrompt } from "./quiz-visual";
import { isAnswerCorrect } from "./quiz-store";
import type { QuizAnswer, QuizUiState } from "./quiz-store";
import type { Question } from "../../lib/zod/question";

interface QuestionBodyProps {
  question: Question;
  session: QuizUiState;
  setAnswer: (answer: QuizAnswer) => void;
}

export function QuestionBody({ question, session, setAnswer }: QuestionBodyProps) {
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
        onAnswer={(matches) => setAnswer({ matches })}
      />
    );
  }

  if (question.type === "dengar_pilih" || question.type === "kenali_visual") {
    return (
      <div className="flex flex-col gap-4">
        <KenaliVisualPrompt
          question={question}
          showFeedback={session.showFeedback}
          isCorrect={answer ? isAnswerCorrect(question, answer) : undefined}
        />
        <QuizChoice
          question={question}
          selectedIndex={answer?.selectedIndex ?? null}
          showFeedback={session.showFeedback}
          shakeIndex={answer?.selectedIndex ?? null}
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
      shakeIndex={answer?.selectedIndex ?? null}
      onSelect={(i) => setAnswer({ selectedIndex: i })}
    />
  );
}
