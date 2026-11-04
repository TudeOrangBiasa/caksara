// node:test agar typecheck bersih (bun:test tak dikenal tsc di repo ini).
import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { cancelSpeech, speakLatin, speechSupported } from "./speech";

const g = globalThis as unknown as Record<string, unknown>;
const savedWindow = g.window;

interface Spoken {
  text: string;
  lang: string;
  rate: number;
}

function stubSpeech(calls: { utter: Spoken | null }): void {
  class FakeUtterance {
    text: string;
    lang = "";
    rate = 1;
    constructor(text: string) {
      this.text = text;
    }
  }
  const fake = {
    cancel() {},
    speak(utter: Spoken) {
      calls.utter = { text: utter.text, lang: utter.lang, rate: utter.rate };
    },
  };
  g.window = { speechSynthesis: fake };
  g.SpeechSynthesisUtterance = FakeUtterance as unknown as typeof SpeechSynthesisUtterance;
}

test.afterEach(() => {
  if (savedWindow === undefined) delete g.window;
  else g.window = savedWindow;
  delete g.SpeechSynthesisUtterance;
});

describe("speechSupported #86 #87", () => {
  test("false bila window/speechSynthesis tak ada (SSR, headless lama)", () => {
    delete g.window;
    assert.equal(speechSupported(), false);
    g.window = {};
    assert.equal(speechSupported(), false);
  });

  test("true bila speechSynthesis tersedia", () => {
    stubSpeech({ utter: null });
    assert.equal(speechSupported(), true);
  });
});

describe("speakLatin #86 #87", () => {
  test("no-op tanpa throw bila tak didukung", () => {
    delete g.window;
    assert.doesNotThrow(() => speakLatin("Om Swastiastu"));
    assert.doesNotThrow(() => cancelSpeech());
  });

  test("Putar membacakan jawaban Latin (lang id-ID, rate 0.9)", () => {
    const calls: { utter: Spoken | null } = { utter: null };
    stubSpeech(calls);
    speakLatin("Om Swastiastu");
    assert.ok(calls.utter);
    assert.equal(calls.utter.text, "Om Swastiastu");
    assert.equal(calls.utter.lang, "id-ID");
    assert.equal(calls.utter.rate, 0.9);
  });
});
