import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@caksara/ui/components/button";

interface QuizAudioProps {
  audioUrl?: string;
  label?: string;
  audioType?: "original" | "latin";
  /** Teks Latin yang dibaca saat audio asli belum terkurasi (ADR-0005). */
  latinText?: string;
  /** Glyph aksara Bali untuk prompt (U+1B00–U+1B7F) — render sebagai prompt. */
  glyph?: string;
}

export function QuizAudio({ audioUrl, label, audioType, latinText, glyph }: QuizAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  /** Transkrip Latin baru dibuka setelah Putar ditekan — anti bocoran jawaban. */
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onEnd = () => setPlaying(false);
      const onError = () => {
        setPlaying(false);
        setError(true);
      };
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onError);
      return () => {
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onError);
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isFallback = error || !audioUrl || audioType === "latin";
  const latin = label ?? latinText;
  const ttsReady = typeof window !== "undefined" && "speechSynthesis" in window;
  const stopTts = () => {
    if (ttsReady) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  const speakLatin = () => {
    if (!latin || !ttsReady) {
      setError(true);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(latin);
    utter.lang = "id-ID";
    utter.onend = () => setPlaying(false);
    utter.onerror = () => {
      setPlaying(false);
      setError(true);
    };
    window.speechSynthesis.speak(utter);
    setPlaying(true);
    setRevealed(true);
  };

  const toggle = () => {
    if (playing) {
      const audio = audioRef.current;
      if (audio && audioUrl && !error) audio.pause();
      else stopTts();
      setPlaying(false);
      return;
    }
    const audio = audioRef.current;
    if (audio && audioUrl && !error) {
      void audio.play().catch(() => setError(true));
      setPlaying(true);
      setRevealed(true);
      return;
    }
    speakLatin();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {glyph && (
        <p
          lang="ban"
          className="font-balinese wresastra-flow text-center leading-loose break-words"
        >
          {glyph}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={!audioUrl && (!latin || !ttsReady)}
        onClick={toggle}
        aria-label="Putar audio soal"
      >
        <Volume2 className={playing ? "size-5 animate-pulse" : "size-5"} aria-hidden />
        {playing ? "Memutar…" : "Putar"}
      </Button>
      {revealed && latin && (
        <span lang="id" className="text-center text-sm text-muted-foreground">
          {latin}
        </span>
      )}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="none" />}
      {isFallback && (
        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
          Audio Latin (sementara)
        </span>
      )}
      <span className="text-center text-[11px] text-muted-foreground">
        Audio: Mendeley Data CC BY 4.0 · Latin sementara bila belum terkurasi
      </span>
      {isFallback && !ttsReady && !audioUrl && (
        <span role="alert" className="text-center text-xs text-destructive">
          Peramban tidak mendukung audio Latin otomatis.
        </span>
      )}
    </div>
  );
}
