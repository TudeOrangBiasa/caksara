import { ArrowLeft, BookMarked, ShieldCheck } from "lucide-react";

import { Button } from "@caksara/ui/components/button";

import { LevelBadge } from "./kb-list";
import { KB_CATEGORY_META } from "./kb-data";
import type { KbEntry } from "./kb-data";

interface KbDetailProps {
  entry: KbEntry;
  onBack: () => void;
}

export function KbDetail({ entry, onBack }: KbDetailProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col px-4 md:max-w-2xl lg:max-w-5xl py-5">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke daftar KB"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card"
        >
          <ArrowLeft className="size-4" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {KB_CATEGORY_META[entry.category].label}
        </p>
        <span className="ml-auto">
          <LevelBadge level={entry.level} />
        </span>
      </div>

      <div className="rounded-3xl bg-primary px-5 py-8 text-center text-primary-foreground">
        {entry.glyph ? (
          <p className="font-balinese text-6xl leading-none">{entry.glyph}</p>
        ) : (
          <p className="text-5xl font-bold leading-none">{entry.title.slice(0, 1)}</p>
        )}
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{entry.title}</h1>
        {entry.latin && <p className="mt-1 text-sm text-white/80">{entry.latin}</p>}
      </div>

      <div className="lg:max-w-3xl">
        <div className="mt-4 rounded-3xl bg-card p-5">
          <p className="text-sm leading-relaxed">{entry.body}</p>
        </div>

        <div className="mt-4 rounded-3xl bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <BookMarked className="size-4 text-primary" />
            Sumber rujukan
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Isi ini dipakai sebagai dasar soal kuis dan jawaban Guru Virtual, jadi bisa ditelusuri.
          </p>
          <ul className="mt-3 space-y-2">
            {entry.sources.map((s, i) => (
              <li
                key={s.nama}
                className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5 text-xs"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold">{s.nama}</span>
                  <span className="text-muted-foreground"> · {s.ket}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-success/10 px-3 py-2.5 text-xs leading-relaxed text-success">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Soal tidak diracik sembarangan. Semua konten dirujuk ke sumber resmi biar akurat &amp;
          bisa dipercaya.
        </div>
      </div>

      <div className="mt-auto pt-4 lg:max-w-3xl">
        <Button className="h-12 w-full rounded-full text-base font-semibold" onClick={onBack}>
          Kembali ke Daftar KB
        </Button>
      </div>
    </div>
  );
}
