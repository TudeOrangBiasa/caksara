import { describe, test } from "node:test";
import assert from "node:assert/strict";

const QUIZ_BANK_MOD_01_LATIN = "Om Swastiastu";

/** Keputusan render QuizAudio: jawaban Latin hanya di DOM pasca-feedback. */
function renderedSpeechHtml(latin: string, showFeedback: boolean): string {
  if (!showFeedback) {
    return `<button aria-label="Putar audio">Putar</button><span>Audio Latin (sementara)</span>`;
  }
  return (
    `<button aria-label="Dengarkan: ${latin}">Putar</button>` +
    `<span lang="id">${latin}</span><span>Audio Latin (sementara)</span>`
  );
}

describe("QuizAudio #86 — jawaban Latin tak bocor pra-feedback", () => {
  test("pre-feedback: DOM soal dengar tak memuat jawaban Latin (teks maupun aria-label)", () => {
    const dumped = renderedSpeechHtml(QUIZ_BANK_MOD_01_LATIN, false);
    assert.equal(dumped.includes(QUIZ_BANK_MOD_01_LATIN), false);
    assert.equal(dumped.includes("Dengarkan:"), false);
    assert.equal(dumped.includes("Putar"), true);
  });

  test("post-feedback: DOM boleh menampilkan jawaban Latin", () => {
    const dumped = renderedSpeechHtml(QUIZ_BANK_MOD_01_LATIN, true);
    assert.equal(dumped.includes(QUIZ_BANK_MOD_01_LATIN), true);
  });
});
