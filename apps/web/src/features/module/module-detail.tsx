import { ArrowLeft, ChevronsRight, Clock, ListChecks, Play } from "lucide-react";

import type { CourseModule } from "./module-data";

export function ModuleDetail({
  mod,
  onBack,
  onStart,
}: {
  mod: CourseModule;
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 md:max-w-2xl lg:max-w-5xl pt-5 pb-10">
      <button
        type="button"
        onClick={onBack}
        aria-label="Kembali"
        className="mb-4 flex size-10 items-center justify-center rounded-full bg-card"
      >
        <ArrowLeft className="size-4" />
      </button>

      <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Modul {mod.order} · {mod.theme}
          </p>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            {mod.order}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{mod.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/85">{mod.description}</p>
        <div className="mt-4 flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            <ListChecks className="size-3.5" /> {mod.jumlahSoal} soal
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            <Clock className="size-3.5" /> ±{mod.estimasiMenit} menit
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-card p-5 lg:max-w-3xl">
        <p className="mb-4 text-sm font-bold">Yang bakal kamu pelajari</p>
        <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
          {mod.poinBelajar.map((item, i) => (
            <li key={item} className="relative flex items-start gap-3 pl-1">
              <span
                aria-hidden
                className={`relative z-10 mt-1 size-2.5 shrink-0 rounded-full ${
                  i === 0 ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-full bg-card p-2 pr-4 text-left transition-transform active:scale-[0.98] lg:max-w-3xl"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Play className="size-4 fill-current" />
        </span>
        <span className="flex-1 text-center text-sm font-semibold">Mulai Belajar</span>
        <ChevronsRight className="size-5 shrink-0 text-muted-foreground" />
      </button>
    </div>
  );
}
