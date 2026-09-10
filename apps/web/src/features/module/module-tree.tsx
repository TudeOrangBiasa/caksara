import { Check, Clock, ListChecks, Lock, Play, Repeat } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@caksara/ui/lib/utils";

import { loadProfile, subscribeProfile } from "../../lib/profile-store";
import { courseModules, deriveStatus } from "./module-data";
import type { CourseModule, ModuleStatus } from "./module-data";
import { MasteryGrid } from "../../components/mastery-grid";
import { BannerBudaya, SumberList, TipsBelajar } from "./belajar-extra";

const statusMeta: Record<ModuleStatus, { label: string; dot: string }> = {
  selesai: { label: "Selesai", dot: "bg-success" },
  aktif: { label: "Aktif", dot: "bg-primary" },
  terkunci: { label: "Terkunci", dot: "bg-muted-foreground/40" },
};

function StatusBadge({ status, onHero }: { status: ModuleStatus; onHero?: boolean }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        onHero
          ? "bg-white/20 text-white"
          : status === "aktif" && "bg-primary text-primary-foreground",
        !onHero && status === "selesai" && "bg-success/15 text-success",
        !onHero && status === "terkunci" && "bg-muted text-muted-foreground",
      )}
    >
      {!onHero && <span className={cn("size-1.5 rounded-full", meta.dot)} />}
      {meta.label}
    </span>
  );
}

function ProgresCard({ totalSelesai, progress }: { totalSelesai: number; progress: number }) {
  const percentage = Math.round(progress * 100);
  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Progres kurikulum</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalSelesai < courseModules.length
              ? `Modul ${totalSelesai + 1} berikutnya`
              : "Semua modul selesai!"}
          </p>
        </div>
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-primary">
          {percentage}%
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>{totalSelesai} selesai</span>
        <span>{courseModules.length} total</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            progress === 1 ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </section>
  );
}

function NodeButton({
  mod,
  status,
  onOpenDetail,
}: {
  mod: CourseModule;
  status: ModuleStatus;
  onOpenDetail: (mod: CourseModule) => void;
}) {
  const disabled = status === "terkunci";
  const isHero = status === "aktif";
  return (
    <button
      type="button"
      onClick={() => onOpenDetail(mod)}
      disabled={disabled}
      className={cn(
        "group relative z-10 flex w-full overflow-hidden items-center gap-3 rounded-3xl p-4 text-left shadow-sm",
        isHero
          ? "bg-primary text-primary-foreground"
          : status === "selesai"
            ? "bg-card hover:bg-muted/60"
            : "bg-card opacity-60",
        !disabled && !isHero && "transition-all duration-200",
        !disabled && !isHero && status === "selesai" && "hover:-translate-y-0.5 hover:shadow-sm",
        !disabled && isHero && "transition-transform active:scale-[0.99]",
      )}
    >
      {!disabled && !isHero && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-balinese text-5xl opacity-0 transition-opacity group-hover:text-primary/15 group-hover:opacity-100 group-hover:scale-110 duration-500">
          ᬳ
        </span>
      )}
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full relative z-10",
          isHero
            ? "bg-white/20 text-white"
            : status === "selesai"
              ? "bg-success/15 text-success"
              : "bg-muted text-muted-foreground",
        )}
      >
        {status === "terkunci" ? (
          <Lock className="size-4" />
        ) : status === "selesai" ? (
          <Check className="size-4.5" strokeWidth={2.5} />
        ) : (
          <span className="text-sm font-bold">{mod.order}</span>
        )}
      </span>

      <span className="min-w-0 flex-1 relative z-10">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-bold">{mod.title}</span>
          <StatusBadge status={status} onHero={isHero} />
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-xs",
            isHero ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {mod.theme}
        </span>
        <span
          className={cn(
            "mt-2 flex items-center gap-3 text-[11px]",
            isHero ? "text-white/80" : "text-muted-foreground",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3" /> {mod.jumlahSoal} soal
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> ±{mod.estimasiMenit} mnt
          </span>
        </span>
      </span>

      {status === "selesai" ? (
        <Play className="relative z-10 size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary/60" />
      ) : status === "aktif" ? (
        <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary">
          <Play className="size-4 fill-current" />
        </span>
      ) : null}
    </button>
  );
}

function ModuleNode({
  mod,
  status,
  isLast,
  onOpenDetail,
}: {
  mod: CourseModule;
  status: ModuleStatus;
  isLast: boolean;
  onOpenDetail: (mod: CourseModule) => void;
}) {
  return (
    <li className="relative pb-3 lg:pb-5">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[1.25rem] top-14 h-[calc(100%-1rem)] w-px bg-border lg:h-full lg:top-8"
        />
      )}
      <NodeButton mod={mod} status={status} onOpenDetail={onOpenDetail} />
    </li>
  );
}

export function ModuleTree({
  selesai,
  onOpenDetail,
  onLatihan,
  onLatihanMod,
}: {
  selesai: ReadonlySet<string>;
  onOpenDetail: (mod: CourseModule) => void;
  onLatihan: () => void;
  onLatihanMod: (mod: CourseModule) => void;
}) {
  const statuses = deriveStatus(selesai);
  const mastery = useSyncExternalStore(subscribeProfile, loadProfile, loadProfile)?.mastery;
  const totalSelesai = courseModules.filter((m) => selesai.has(m.id)).length;
  const progress = totalSelesai / courseModules.length;
  const selesaiMods = courseModules.filter((m) => selesai.has(m.id));
  const canLatihan = selesaiMods.length > 0;

  return (
    <div className="mx-auto w-full max-w-lg px-4 md:max-w-2xl lg:max-w-7xl lg:px-8 pt-7 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <header className="mb-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Kurikulum
        </p>
        <span className="flex items-center gap-2">
          <span aria-hidden className="font-balinese text-3xl leading-none text-primary">
            ᬳᬓ᭄ᬱᬭ
          </span>
          <h1 className="text-[28px] font-extrabold tracking-tight md:text-[32px]">Belajar</h1>
        </span>
        <p className="mt-1.5 max-w-[44ch] text-sm text-muted-foreground">
          Digali dari materi dulu, baru diuji lewat kuis seru.
        </p>
      </header>

      <BannerBudaya />

      {/* ProgresCard for Mobile */}
      <div className="mt-5 lg:hidden">
        <ProgresCard totalSelesai={totalSelesai} progress={progress} />
      </div>

      <div className="mt-7 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <div>
          <div className="space-y-6 border-t border-border/60 pt-6 lg:border-t-0 lg:pt-0">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Daftar modul
                </p>
                <h2 className="text-base font-semibold tracking-tight">Modul</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {totalSelesai}/{courseModules.length} selesai
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Selesaikan berurutan untuk membuka jalan ke modul berikutnya.
            </p>
            <ol className="relative mt-3 px-0.5 lg:px-0">
              {courseModules.map((mod, i) => {
                const isLast = i === courseModules.length - 1;
                return (
                  <ModuleNode
                    key={mod.id}
                    mod={mod}
                    status={statuses[i]}
                    isLast={isLast}
                    onOpenDetail={onOpenDetail}
                  />
                );
              })}
            </ol>
          </div>

          <div className="mt-8 space-y-6 rounded-[1.75rem] bg-primary/5 p-6 shadow-sm ring-1 ring-border/50 animate-in fade-in zoom-in-95 duration-500 delay-200 fill-mode-both">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-sm text-primary-foreground">
                  <Repeat className="size-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Latihan Mandiri
                  </p>
                  <h2 className="text-lg font-extrabold tracking-tight">Kuis Campuran</h2>
                </div>
              </div>
              <img 
                src="/assets/feature_quiz_2d_1788968425885.jpg" 
                alt="Ilustrasi Kuis" 
                className="size-20 rounded-2xl object-cover shadow-sm ring-1 ring-border/50 hidden sm:block" 
              />
            </div>
            <p className="text-[13px] font-medium leading-relaxed text-muted-foreground mb-4">
              Ulangi materi yang sudah dihafal, tanpa mengulang dari awal. Semakin sering diulang, semakin nempel di ingatan.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onLatihan}
                disabled={!canLatihan}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-[1.5rem] p-5 text-left shadow-sm transition-all duration-200 border-l-4 hover:-translate-y-1 hover:shadow-md",
                  canLatihan
                    ? "bg-card hover:bg-muted/60 border-primary"
                    : "bg-card opacity-60 border-transparent",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">Latihan campuran</span>
                  <span className="block text-xs text-muted-foreground">
                    {canLatihan
                      ? `Soal acak dari ${selesaiMods.length} modul yang sudah beres`
                      : "Selesaikan satu modul dulu, baru latihan ini terbuka"}
                  </span>
                </span>
                {canLatihan && (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play className="size-4 fill-current" />
                  </span>
                )}
              </button>

              {selesaiMods.length > 0 && (
                <div className="space-y-1.5">
                  {selesaiMods.map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => onLatihanMod(mod)}
                      className="group flex w-full items-center gap-3 rounded-2xl bg-background p-3 text-left transition-all shadow-sm ring-1 ring-border/50 duration-200 hover:bg-muted/60 border-l-4 border-transparent hover:border-primary/40 hover:-translate-y-0.5"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                        <Check className="size-3.5" strokeWidth={2.5} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{mod.title}</span>
                        <span className="block text-[11px] text-muted-foreground">Ulang lagi</span>
                      </span>
                      <Play className="size-3.5 shrink-0 text-muted-foreground/60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-6 border-t border-border/60 pt-6">
            <SumberList />
            <TipsBelajar />
          </div>
        </div>

        <div className="hidden lg:block lg:sticky lg:top-24 space-y-6">
          <ProgresCard totalSelesai={totalSelesai} progress={progress} />

          <div className="space-y-6 rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/50 animate-in fade-in slide-in-from-right-8 duration-500 delay-100 fill-mode-both">
            <MasteryGrid mastery={mastery} />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Selesaikan kuis tiap modul untuk menaikkan status tiap aksara dari Belum menjadi Ahli.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile only MasteryGrid */}
      <div className="mt-8 space-y-6 rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/50 lg:hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both">
        <MasteryGrid mastery={mastery} />
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Selesaikan kuis tiap modul untuk menaikkan status tiap aksara dari Belum menjadi Ahli.
        </p>
      </div>
    </div>
  );
}
