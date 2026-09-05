import { ArrowLeft, ArrowRight, ChevronsRight, GraduationCap } from "lucide-react";
import { useState } from "react";

import type { CourseModule, ModuleMateri } from "./module-data";

function MateriCard({ item }: { item: ModuleMateri }) {
  return (
    <div className="rounded-3xl bg-card p-5">
      {item.aksara && (
        <div className="mb-4 flex flex-col items-center rounded-3xl bg-primary px-4 py-8 text-primary-foreground">
          <span className="font-balinese text-6xl leading-none">{item.aksara}</span>
          {item.labelAksara && (
            <span className="mt-3 text-xs font-semibold text-white/85">{item.labelAksara}</span>
          )}
        </div>
      )}

      <h2 className="text-lg font-bold tracking-tight">{item.judul}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.isi}</p>
    </div>
  );
}

export function ModuleMateri({
  mod,
  onBack,
  onStart,
}: {
  mod: CourseModule;
  onBack: () => void;
  onStart: () => void;
}) {
  const [index, setIndex] = useState(0);
  const items = mod.materi;
  const current = items[index];
  const isLast = index === items.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 md:max-w-xl pt-5 pb-10">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card"
        >
          <ArrowLeft className="size-4" />
        </button>
        <p className="flex-1 truncate text-sm font-bold">
          {mod.title} · {index + 1}/{items.length}
        </p>
        <div className="flex shrink-0 items-center gap-1" aria-hidden>
          {items.map((m, i) => (
            <span
              key={m.id}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-5 bg-primary"
                  : i < index
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div key={current.id} className="animate-fade flex-1">
        <MateriCard item={current} />
      </div>

      {isLast ? (
        <button
          type="button"
          onClick={onStart}
          className="mt-6 flex w-full cursor-pointer items-center gap-3 rounded-full bg-primary p-2 pr-4 text-left text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <GraduationCap className="size-5" />
          </span>
          <span className="flex-1 text-center text-sm font-semibold">
            Kerjakan {mod.jumlahSoal} soal
          </span>
          <ChevronsRight className="size-5 shrink-0 text-white/80" />
        </button>
      ) : (
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            aria-label="Halaman sebelumnya"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card transition-transform active:scale-95 disabled:opacity-40"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex(index + 1)}
            className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Lanjut <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
