import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { speakLatin, useSpeechSupported } from "../../lib/speech";

interface KbAudioProps {
  /** Rekaman native (/audio/*.mp3 lokal atau URL Storage); absen → Web Speech Latin. */
  audioUrl?: string;
  /** Teks Latin untuk fallback Web Speech (ADR-0005: jangan bacakan glyph aksara). */
  latin: string;
}

/**
 * Tombol Putar KB #105: <audio> asli diutamakan, Web Speech (#86/#87) fallback.
 * Error audio (file hilang) otomatis jatuh ke Web Speech agar tombol tak mati.
 */
export function KbAudio({ audioUrl, latin }: KbAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const speech = useSpeechSupported();

  useEffect(() => {
    setError(false);
    setPlaying(false);
  }, [audioUrl]);

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

  const hasAudio = Boolean(audioUrl) && !error;
  const canSpeak = speech && !hasAudio;
  if (!hasAudio && !canSpeak) return null;

  return (
    <>
      <button
        type="button"
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
          } else {
            speakLatin(latin);
          }
        }}
        aria-label={`Dengarkan: ${latin}`}
        className="flex size-8 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
      >
        <Volume2 className={playing ? "size-4 animate-pulse" : "size-4"} aria-hidden />
      </button>
      {audioUrl && !error && <audio ref={audioRef} src={audioUrl} preload="none" />}
    </>
  );
}
