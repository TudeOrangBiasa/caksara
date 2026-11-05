import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionBody } from "./quiz-question-body";
import { QuizFeedback } from "./quiz-feedback";
import { createSession } from "./quiz-store";
import type { Question, Quiz } from "../../lib/zod/question";

function sessionFor(question: Question, answered: boolean) {
  const quiz: Quiz = {
    moduleId: "mod_test_reskin",
    questions: [question, question, question],
  };
  const session = createSession(quiz);
  if (answered) {
    const first = quiz.questions[0];
    if (first && "choices" in first) {
      const correctIndex = first.choices.findIndex((c) => c.isCorrect);
      session.answers.set(0, { selectedIndex: correctIndex });
    } else if (first && first.type === "susun_aksara" && first.tiles) {
      session.answers.set(0, { ordered: [...first.tiles] });
    } else if (first && first.type === "cocokkan" && first.pairs) {
      session.answers.set(0, {
        matches: Object.fromEntries(first.pairs.map((p) => [p.left, p.right])),
      });
    }
    session.showFeedback = true;
  }
  return session;
}

function renderBody(question: Question): string {
  return renderToStaticMarkup(
    createElement(QuestionBody, {
      question,
      session: sessionFor(question, false),
      setAnswer: () => {},
    }),
  );
}

const CHOICES = [
  { text: "Om Swastiastu", isCorrect: true },
  { text: "Matur suksma", isCorrect: false },
];

describe("Reskin T3 #142 — semua tipe soal dirender", () => {
  test("dengar_pilih: ask row + tombol Putar + opsi", () => {
    const html = renderBody({
      type: "dengar_pilih",
      prompt: "Dengarkan, lalu pilih sapaan yang benar.",
      audioUrl: "/audio/matur-suksma.mp3",
      audioType: "original",
      latinText: "Om Swastiastu",
      choices: CHOICES,
    });
    assert.ok(html.includes("Maskot Bedawang Nala"), "ask row tanpa maskot");
    assert.ok(html.includes("Putar audio"), "tanpa tombol Putar");
    assert.ok(html.includes("Pilihan 1"), "tanpa opsi pilihan");
    assert.equal(html.includes("Dengarkan:"), false, "jawaban Latin bocor via aria-label");
  });

  test("kenali_visual: bubble aksara + opsi", () => {
    const html = renderBody({
      type: "kenali_visual",
      prompt: "ᬫᬢᬸᬃᬲᬸᬓ᭄ᬲ᭄ᬫ",
      choices: [
        { text: "Terima kasih", isCorrect: true },
        { text: "Mohon maaf", isCorrect: false },
      ],
    });
    assert.ok(html.includes('lang="ban"'), "bubble tanpa lang ban");
    assert.ok(html.includes("Pilihan 2"), "tanpa opsi pilihan");
  });

  test("checkpoint_budaya: opsi langsung tanpa ask row", () => {
    const html = renderBody({
      type: "checkpoint_budaya",
      prompt: "Kapan sapaan diucapkan?",
      choices: CHOICES,
    });
    assert.ok(html.includes("Pilihan 1"), "tanpa opsi pilihan");
    assert.equal(html.includes("Maskot Bedawang Nala"), false, "ask row tak perlu di sini");
  });

  test("susun_aksara: drop zone + ubin + tombol Cek", () => {
    const html = renderBody({
      type: "susun_aksara",
      prompt: "Susun suku kata.",
      tiles: ["swa", "sti"],
    });
    assert.ok(html.includes("Susunan jawaban sementara"), "tanpa drop zone");
    assert.ok(html.includes("Pilihan ubin aksara"), "tanpa ubin");
    assert.ok(html.includes("Cek"), "tanpa tombol Cek");
  });

  test("cocokkan: grid 2 kolom + status pasangan", () => {
    const html = renderBody({
      type: "cocokkan",
      prompt: "Pasangkan sapaan dengan artinya.",
      pairs: [
        { left: "Om Swastiastu", right: "Salam sejahtera" },
        { left: "Ampura", right: "Mohon maaf" },
      ],
    });
    assert.ok(html.includes("Kolom aksara"), "tanpa kolom kiri");
    assert.ok(html.includes("Kolom arti"), "tanpa kolom kanan");
    assert.ok(html.includes("pasangan cocok"), "tanpa status pasangan");
  });

  test("feedback benar: hijau + XP + tautan KB", () => {
    const html = renderToStaticMarkup(
      createElement(QuizFeedback, {
        isCorrect: true,
        explanation: "Salam pembuka.",
        sourceRef: "kb_sapaan · Basis Pengetahuan",
        onOpenKbEntry: () => {},
        onNext: () => {},
        isLast: false,
      }),
    );
    assert.ok(html.includes("Bener banget!"), "tanpa judul benar");
    assert.ok(html.includes("bg-success/15"), "panel benar tak hijau");
    assert.ok(html.includes("XP"), "tanpa pill XP");
    assert.ok(html.includes("Buka di Basis Pengetahuan"), "tanpa tautan KB");
    assert.ok(html.includes("Lanjut"), "tanpa tombol Lanjut");
  });

  test("feedback salah: merah + tombol Lanjut", () => {
    const html = renderToStaticMarkup(
      createElement(QuizFeedback, {
        isCorrect: false,
        explanation: "Coba baca lagi.",
        onNext: () => {},
        isLast: true,
      }),
    );
    assert.ok(html.includes("Belum tepat"), "tanpa judul salah");
    assert.ok(html.includes("bg-destructive/10"), "panel salah tak merah");
    assert.ok(html.includes("Lihat Hasil"), "soal terakhir tanpa Lihat Hasil");
  });
});
