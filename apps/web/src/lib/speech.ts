import { useEffect, useState } from "react";

// ADR-0005: Web Speech hanya membaca teks Latin — jangan pernah membacakan glyph aksara.
const SPEECH_LANG = "id-ID";
const SPEECH_RATE = 0.9;

/** True bila browser menyediakan Web Speech (selalu false saat SSR). */
export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Bacakan teks Latin; no-op bila tak didukung. Antrean dibatalkan dulu
 * agar tap Putar beruntun mengulang, bukan menumpuk bacaan.
 */
export function speakLatin(text: string): void {
  if (!speechSupported()) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG;
    utterance.rate = SPEECH_RATE;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech diblokir: diam, jangan ganggu belajar.
  }
}

/** Hentikan bacaan; no-op bila tak didukung. */
export function cancelSpeech(): void {
  if (!speechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Sama: diam.
  }
}

/** Versi render-aman dari speechSupported (false saat render pertama agar SSR/hidrasi cocok). */
export function useSpeechSupported(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(speechSupported());
  }, []);
  return supported;
}
