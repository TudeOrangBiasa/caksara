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
  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Progres kurikulum</span>
        <span className="tabular-nums text-muted-foreground">
          {totalSelesai} dari {courseModules.length} modul
        </span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", progress === 1 ? "bg-success" : "bg-primary")}
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
        "relative z-10 flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-sm",
        isHero
          ? "bg-primary text-primary-foreground"
          : status === "selesai"
            ? "bg-card"
            : "bg-card opacity-60",
        !disabled && !isHero && "transition-colors hover:bg-muted/60",
        !disabled && isHero && "transition-transform active:scale-[0.99]",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
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

      <span className="min-w-0 flex-1">
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
        <Play className="size-4 shrink-0 text-muted-foreground/60" />
      ) : status === "aktif" ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary">
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
    <li className="relative pb-3 lg:pb-0">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[1.25rem] top-14 h-[calc(100%-1rem)] w-px bg-border lg:hidden"
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
    <div className="mx-auto w-full max-w-lg px-4 md:max-w-2xl lg:max-w-5xl pt-7 pb-12">
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

      <div className="mt-5">
        <ProgresCard totalSelesai={totalSelesai} progress={progress} />
      </div>

      <div className="mt-7 space-y-6 border-t border-border/60 pt-6">
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
        <ol className="relative mt-3 px-0.5 lg:grid lg:grid-cols-2 lg:gap-3 lg:px-0">
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

      <div className="mt-8 space-y-6 rounded-3xl bg-card p-5 shadow-sm">
        <MasteryGrid mastery={mastery} />
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Selesaikan kuis tiap modul untuk menaikkan status tiap aksara dari Belum menjadi Ahli.
        </p>
      </div>

      <div className="mt-8 space-y-6 rounded-3xl bg-primary/10 p-5 shadow-sm ring-1 ring-primary/20">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Repeat className="size-4.5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Latihan mandiri
            </p>
            <h2 className="text-base font-bold tracking-tight">Latihan</h2>
            <p className="text-xs text-muted-foreground">
              Ulangi materi yang sudah dihafal, tanpa mengulang dari awal.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onLatihan}
            disabled={!canLatihan}
            className={cn(
              "flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-sm transition-colors",
              canLatihan ? "bg-card hover:bg-muted/60" : "bg-card opacity-60",
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
                  className="flex w-full items-center gap-3 rounded-2xl bg-card p-2.5 text-left transition-colors hover:bg-muted/60"
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
  );
}
