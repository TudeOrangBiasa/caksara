import { Check, Play, Repeat } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Progress } from "@caksara/ui/components/progress";
import { cn } from "@caksara/ui/lib/utils";

import { loadProfile, subscribeProfile } from "../../lib/profile-store";
import { courseModules, deriveStatus } from "./module-data";
import type { CourseModule, ModuleStatus } from "./module-data";
import { MasteryGrid } from "../../components/mastery-grid";
import { BannerBudaya, SumberList, TipsBelajar } from "./belajar-extra";

import { ModulCard } from "./modul-card";

function ProgresCard({ totalSelesai, progress }: { totalSelesai: number; progress: number }) {
  const percentage = Math.round(progress * 100);
  return (
    <section className="rounded-[1.25rem] bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold">Progres kurikulum</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalSelesai < courseModules.length
              ? `Modul ${totalSelesai + 1} berikutnya`
              : "Semua modul selesai!"}
          </p>
        </div>
        <span className="text-[28px] font-extrabold tabular-nums tracking-tight text-primary">
          {percentage}%
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>{totalSelesai} selesai</span>
        <span>{courseModules.length} total</span>
      </div>
      <Progress
        value={progress * 100}
        tone={progress === 1 ? "complete" : "cta"}
        className="mt-2.5"
      />
    </section>
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
    <li>
      <ModulCard variant="tree" mod={mod} status={status} onOpenDetail={onOpenDetail} />
      {!isLast && (
        <span aria-hidden className="flex flex-col items-center gap-1.5 py-0.5">
          <span
            className={cn(
              "w-1 rounded-full",
              status === "aktif" ? "h-[30px] bg-cta" : "h-6 bg-border",
            )}
          />
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-extrabold",
              status === "aktif" ? "bg-cta/15 text-cta" : "bg-muted text-muted-foreground",
            )}
          >
            Langkah {mod.order + 1} · Terkunci
          </span>
        </span>
      )}
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
        <span className="flex items-center gap-2">
          <span aria-hidden className="font-balinese text-[30px] leading-none text-primary">
            ᬳᬓ᭄ᬱᬭ
          </span>
          <h1 className="text-[32px] font-extrabold tracking-tight">Belajar</h1>
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
          <div className="space-y-3 border-t border-border/60 pt-6 lg:border-t-0 lg:pt-0">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Daftar modul
                </p>
                <h2 className="text-base font-bold tracking-tight">Modul</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {totalSelesai}/{courseModules.length} selesai
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Selesaikan berurutan untuk membuka jalan ke modul berikutnya.
            </p>
            <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold">
                  Langkah {Math.min(totalSelesai + 1, courseModules.length)} dari{" "}
                  {courseModules.length}
                </p>
                <span className="text-[13px] font-extrabold text-cta">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div aria-hidden className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-cta"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
            <ol className="relative px-0.5 lg:px-0">
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

          <div className="mt-8 space-y-2.5 rounded-[1.25rem] bg-secondary p-5 shadow-sm ring-1 ring-border animate-in fade-in zoom-in-95 duration-500 delay-200 fill-mode-both">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-sm">
                <Repeat className="size-5" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Latihan Mandiri
                </p>
                <h2 className="text-lg font-extrabold tracking-tight">Kuis Campuran</h2>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ulangi materi yang sudah dihafal, tanpa mengulang dari awal. Semakin sering diulang,
              semakin nempel di ingatan.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onLatihan}
                disabled={!canLatihan}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-pill p-4 text-left shadow-sm ring-1 ring-border transition-all duration-200",
                  canLatihan ? "bg-card hover:bg-muted/60" : "bg-card opacity-60",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold">Latihan campuran</span>
                  <span className="block text-[11px] text-muted-foreground">
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
                      className="group flex w-full items-center gap-3 rounded-pill bg-background p-3 text-left shadow-sm ring-1 ring-border transition-all duration-200 hover:bg-muted/60"
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

          <div className="space-y-2.5 rounded-[1.25rem] bg-card p-5 shadow-sm ring-1 ring-border animate-in fade-in slide-in-from-right-8 duration-500 delay-100 fill-mode-both">
            <MasteryGrid mastery={mastery} />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Selesaikan kuis tiap modul untuk menaikkan status tiap aksara dari Belum menjadi Ahli.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile only MasteryGrid */}
      <div className="mt-8 space-y-2.5 rounded-[1.25rem] bg-card p-5 shadow-sm ring-1 ring-border lg:hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both">
        <MasteryGrid mastery={mastery} />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Selesaikan kuis tiap modul untuk menaikkan status tiap aksara dari Belum menjadi Ahli.
        </p>
      </div>
    </div>
  );
}
