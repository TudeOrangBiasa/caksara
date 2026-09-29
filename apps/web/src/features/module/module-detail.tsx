import { ArrowLeft, ChevronsRight, Clock, ListChecks, Play } from "lucide-react";

import type { CourseModule } from "./module-data";
import { ModuleLevelBadge } from "./module-level-badge";

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
    <div className="mx-auto w-full max-w-lg px-4 md:max-w-2xl lg:max-w-7xl lg:px-8 pt-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start">
      {/* Back button (Mobile only, desktop uses topnav usually, but let's keep it just in case) */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full bg-card shadow-sm transition-transform active:scale-95"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      {/* Left Column */}
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-primary/20 min-h-[280px] flex flex-col justify-end p-6 group">
          <img
            src="/assets/study_mascot_2d_1788968332573.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                Modul {mod.order} · {mod.theme}
              </p>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold text-white shadow-inner backdrop-blur-md">
                {mod.order}
              </span>
            </div>

            <div>
              <h1 className="text-[28px] font-extrabold tracking-tight leading-tight text-white md:text-[32px]">
                {mod.title}
              </h1>
              <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/80 max-w-[95%]">
                {mod.description}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/50">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Yang akan kamu pelajari
          </p>
          <div className="space-y-3">
            {mod.poinBelajar.map((item, i) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 ring-1 ring-primary/10 transition-colors hover:bg-primary/10"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <span className="text-[11px] font-bold">{i + 1}</span>
                </div>
                <span className="text-[13px] font-medium leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (Sticky Sidebar on Desktop) */}
      <div className="mt-8 lg:mt-0 lg:sticky lg:top-24 flex flex-col gap-5 bg-card lg:p-6 lg:rounded-[1.75rem] lg:shadow-sm lg:ring-1 lg:ring-border/50">
        <ModuleLevelBadge moduleId={mod.id} />
        <div className="flex flex-col gap-3 mb-2">
          <span className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm font-bold shadow-sm">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ListChecks className="size-4" />
            </div>
            {mod.jumlahSoal} Pertanyaan Kuis
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm font-bold shadow-sm">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Clock className="size-4" />
            </div>
            Estimasi ±{mod.estimasiMenit} Menit
          </span>
        </div>

        <button
          type="button"
          onClick={onStart}
          aria-label="Mulai belajar"
          className="hidden w-full cursor-pointer items-center gap-3 rounded-pill border-2 border-transparent bg-cta p-2 pr-5 text-left text-primary-foreground uppercase shadow-duo transition-all duration-150 ease-out hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0.5 active:shadow-none lg:flex"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-white/20 shadow-inner">
            <Play className="size-6 fill-current translate-x-0.5" />
          </span>
          <span className="flex-1 text-center text-base font-bold tracking-wide">
            Mulai Belajar
          </span>
          <ChevronsRight className="size-6 shrink-0 opacity-70" />
        </button>

        <button
          type="button"
          onClick={onBack}
          className="hidden lg:block mt-2 text-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          Kembali ke Kurikulum
        </button>
      </div>
      {/* Mobile sticky CTA (Duo pattern). Desktop unchanged: sidebar CTA above. */}
      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-border/60 bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={onStart}
          aria-label="Mulai belajar"
          className="flex w-full cursor-pointer items-center gap-3 rounded-pill border-2 border-transparent bg-cta p-2 pr-5 text-left text-primary-foreground uppercase shadow-duo transition-all duration-150 ease-out hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0.5 active:shadow-none"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-white/20 shadow-inner">
            <Play className="size-6 fill-current translate-x-0.5" />
          </span>
          <span className="flex-1 text-center text-base font-bold tracking-wide">
            Mulai Belajar
          </span>
          <ChevronsRight className="size-6 shrink-0 opacity-70" />
        </button>
      </div>
    </div>
  );
}
