import { ArrowLeft, Clock, ListChecks } from "lucide-react";

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
        <div className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-2xl">
          <img
            src="/assets/hero-modul.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />

          <div className="relative z-10 flex flex-col gap-2 p-6">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-[13px] font-bold uppercase tracking-widest text-white/70">
                Modul {mod.order} · {mod.theme}
              </p>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-white/20 text-sm font-bold text-white shadow-inner backdrop-blur-md">
                {mod.order}
              </span>
            </div>

            <div>
              <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-white md:text-4xl">
                {mod.title}
              </h1>
              <p className="mt-1.5 max-w-[95%] text-sm leading-relaxed text-white/90">
                {mod.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <p className="text-[13px] font-extrabold uppercase tracking-widest text-muted-foreground">
            Yang akan kamu pelajari
          </p>
          <div className="space-y-5">
            {mod.poinBelajar.map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-border"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <span className="text-[11px] font-bold">{i + 1}</span>
                </div>
                <span className="text-sm font-bold leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (Sticky Sidebar on Desktop) */}
      <div className="mt-8 flex flex-col gap-5 bg-card lg:sticky lg:top-24 lg:mt-0 lg:rounded-2xl lg:p-6 lg:shadow-sm lg:ring-1 lg:ring-border">
        <ModuleLevelBadge moduleId={mod.id} />
        <div className="mb-2 flex flex-col gap-3">
          <span className="inline-flex items-center gap-2.5 rounded-2xl bg-muted px-4 py-3 text-[13px] font-bold">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ListChecks className="size-4" />
            </div>
            {mod.jumlahSoal} Pertanyaan Kuis
          </span>
          <span className="inline-flex items-center gap-2.5 rounded-2xl bg-muted px-4 py-3 text-[13px] font-bold">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="size-4" />
            </div>
            Estimasi ±{mod.estimasiMenit} Menit
          </span>
        </div>

        <button
          type="button"
          onClick={onStart}
          aria-label="Mulai belajar"
          className="hidden w-full cursor-pointer items-center justify-center rounded-pill bg-cta p-4 text-center text-base font-bold uppercase tracking-wide text-primary-foreground shadow-duo transition-all duration-150 ease-out hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0.5 active:shadow-none lg:flex"
        >
          Mulai Belajar
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mt-2 hidden text-center text-[13px] font-bold uppercase text-muted-foreground transition-colors hover:text-foreground lg:block"
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
          className="flex w-full cursor-pointer items-center justify-center rounded-pill bg-cta p-4 text-center text-base font-bold uppercase tracking-wide text-primary-foreground shadow-duo transition-all duration-150 ease-out hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0.5 active:shadow-none"
        >
          Mulai Belajar
        </button>
      </div>
    </div>
  );
}
