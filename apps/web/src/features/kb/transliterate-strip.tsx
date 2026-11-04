import { useState } from "react";
import { ArrowLeftRight, Copy } from "lucide-react";

import { latinToGlyph } from "../../lib/transliterate-bali";
import type { TransliterateResult } from "../../lib/transliterate-bali";

/** Strip transliterasi Latin → aksara: input kecil + preview glyph + salin. */
export function TransliterateStrip() {
  const [latin, setLatin] = useState("");
  const [copied, setCopied] = useState(false);
  const out = latin.trim() ? latinToGlyph(latin) : null;
  const glyph = out?.ok ? out.glyph : "";

  return (
    <div className="mt-4 rounded-3xl bg-card p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <ArrowLeftRight className="size-4 text-primary" />
        Coba transliterasi
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ketik Latin (ha, Om Swastiastu…) untuk melihat glyph Bali.
      </p>
      <input
        type="text"
        value={latin}
        onChange={(e) => {
          setLatin(e.target.value);
          setCopied(false);
        }}
        placeholder="cth. ha / Om Swastiastu"
        aria-label="Teks Latin untuk ditransliterasi"
        className="mt-3 h-11 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm outline-none focus:border-primary"
      />
      {out && (
        <StripResult out={out} copied={copied} glyph={glyph} onCopy={() => setCopied(true)} />
      )}
    </div>
  );
}
interface StripProps {
  out: TransliterateResult;
  copied: boolean;
  glyph: string;
  onCopy: () => void;
}
function StripResult({ out, copied, glyph, onCopy }: StripProps) {
  if (!out.ok) {
    return (
      <p
        className="mt-3 rounded-2xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground"
        aria-live="polite"
      >
        {out.message}
      </p>
    );
  }
  const copy = async () => {
    if (!glyph) return;
    await navigator.clipboard.writeText(glyph);
    onCopy();
  };
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-4 py-3">
      <p lang="ban" className="font-balinese text-2xl leading-snug" aria-live="polite">
        {out.glyph}
      </p>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Tersalin" : "Salin glyph"}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground"
      >
        <Copy className="size-3.5" aria-hidden />
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}
