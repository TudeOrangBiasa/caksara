import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@caksara/ui/components/button";

import { speakLatin, useSpeechSupported } from "../../lib/speech";

interface QuizAudioProps {
  audioUrl?: string;
  label?: string;
  audioType?: "original" | "latin";
  /** Teks Latin yang dibaca saat audio asli belum terkurasi (ADR-0005). */
  latinText?: string;
  /** True setelah jawaban dikunci — jawaban Latin baru boleh tampil. */
  showFeedback?: boolean;
}

export function QuizAudio({ audioUrl, label, audioType, latinText, showFeedback }: QuizAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const speech = useSpeechSupported();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
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
    };
  }, []);

  const isFallback = error || !audioUrl || audioType === "latin";
  const latin = label ?? latinText;
  const hasAudio = Boolean(audioUrl) && !error;
  const canSpeak = speech && Boolean(latin);
  const showLatin = showFeedback && Boolean(latin);

  if (!hasAudio && !canSpeak) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        size="lg"
        onClick={() => {
          if (hasAudio) {
            const audio = audioRef.current;
            if (!audio) return;
            if (playing) {
              audio.pause();
              setPlaying(false);
            } else {
              void audio.play().catch(() => setError(true));
              setPlaying(true);
            }
          } else if (latin) {
            speakLatin(latin);
          }
        }}
        // Label generik pra-jawaban: aria-label berisi jawaban ikut bocor ke DOM.
        aria-label={showLatin ? `Dengarkan: ${latin}` : "Putar audio"}
        className="h-11 gap-2 rounded-full bg-sky-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-sky-700 lg:h-10 lg:gap-1.5 lg:rounded-xl lg:px-[18px] lg:text-[13px] lg:shadow-none"
      >
        <Volume2
          className={playing ? "size-5 animate-pulse lg:size-5" : "size-5 lg:size-5"}
          aria-hidden
        />
        {playing ? "Memutar…" : "Putar"}
      </Button>
      {showLatin && (
        <span
          lang={isFallback ? "id" : "ban"}
          className="font-balinese text-center text-2xl font-bold break-words"
        >
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
    </div>
  );
}
