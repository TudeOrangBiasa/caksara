import type { Question } from "../../lib/zod/question";
import { QuizAudio } from "./quiz-audio";

export function KenaliVisualPrompt({ question }: { question: Question }) {
  return (
    <div className="mb-4 flex flex-col items-center gap-4">
      {question.audioUrl || question.type === "dengar_pilih" ? (
        <QuizAudio audioUrl={question.audioUrl} audioType={question.audioType} />
      ) : (
        <span className="font-balinese text-6xl text-primary">{question.prompt}</span>
      )}
    </div>
  );
}
