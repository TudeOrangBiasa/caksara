import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@caksara/ui/components/button";

interface QuizAudioProps {
  audioUrl?: string;
  label?: string;
  audioType?: "original" | "latin";
  /** Teks Latin yang dibaca saat audio asli belum terkurasi (ADR-0005). */
  latinText?: string;
}

export function QuizAudio({ audioUrl, label, audioType, latinText }: QuizAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

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

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={!audioUrl && !latin}
        onClick={() => {
          const audio = audioRef.current;
          if (!audio) return;
          if (playing) {
            audio.pause();
            setPlaying(false);
          } else {
            void audio.play().catch(() => setError(true));
            setPlaying(true);
          }
        }}
        aria-label={latin ? `Dengarkan: ${latin}` : "Putar audio"}
      >
        <Volume2 className={playing ? "size-5 animate-pulse" : "size-5"} aria-hidden />
        {playing ? "Memutar…" : "Putar"}
      </Button>
      {latin && (
        <span lang={isFallback ? "id" : "ban"} className="font-balinese text-3xl">
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
        Audio: Mendeley CC BY 4.0 · Latin sementara bila belum terkurasi
      </span>
    </div>
  );
}
