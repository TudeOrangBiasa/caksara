import { Check, ChevronRight, Clock, ListChecks, Lock, Play } from "lucide-react";

import { cn } from "@caksara/ui/lib/utils";

import { notifyModuleLocked } from "../../lib/notify";
import { courseModules } from "./module-data";
import type { CourseModule, ModuleStatus } from "./module-data";

/** #51: satu-satunya peta label + dot status modul; dashboard & tree baca dari sini. */
export const statusMeta: Record<ModuleStatus, { label: string; dot: string }> = {
  selesai: { label: "Selesai", dot: "bg-success" },
  aktif: { label: "Aktif", dot: "bg-primary" },
  terkunci: { label: "Terkunci", dot: "bg-muted-foreground/40" },
};

export function StatusBadge({ status, onHero }: { status: ModuleStatus; onHero?: boolean }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        onHero
          ? "bg-white/20 text-white"
          : status === "aktif" && "bg-primary text-primary-foreground",
        !onHero && status === "selesai" && "bg-success/15 text-success",
        !onHero && status === "terkunci" && "bg-secondary text-muted-foreground",
      )}
    >
      {!onHero && <span className={cn("size-1.5 rounded-full", meta.dot)} />}
      {meta.label}
    </span>
  );
}

export type ModulCardProps =
  | {
      variant: "featured";
      mod: CourseModule;
      status: ModuleStatus;
      totalSelesai: number;
      onStart: () => void;
    }
  | { variant: "row"; mod: CourseModule; status: ModuleStatus; onOpen: () => void }
  | {
      variant: "tree";
      mod: CourseModule;
      status: ModuleStatus;
      onOpenDetail: (mod: CourseModule) => void;
    };

/**
 * #51: satu komponen kartu modul (SSOT) untuk dashboard + tree belajar.
 * Tiga varian visual reskin T2 dipertahankan apa adanya; beda varian = beda wadah,
 * status & klik-terkunci ditangani di satu tempat.
 */
export function ModulCard(props: ModulCardProps) {
  switch (props.variant) {
    case "featured":
      return (
        <FeaturedCard
          mod={props.mod}
          status={props.status}
          totalSelesai={props.totalSelesai}
          onStart={props.onStart}
        />
      );
    case "row":
      return <RowCard mod={props.mod} status={props.status} onOpen={props.onOpen} />;
    case "tree":
      return <TreeCard mod={props.mod} status={props.status} onOpenDetail={props.onOpenDetail} />;
  }
}

function FeaturedCard({
  mod,
  status,
  totalSelesai,
  onStart,
}: {
  mod: CourseModule;
  status: ModuleStatus;
  totalSelesai: number;
  onStart: () => void;
}) {
  const done = status === "selesai";
  const progressPercent = done ? 100 : Math.round((totalSelesai / courseModules.length) * 100);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/20 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
      {/* Decorative avatar on the right */}
      <img
        src="/assets/Userpics/PNG/Circle/3DDD-1.png"
        className="absolute -bottom-2 right-0 w-[120px] drop-shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both sm:right-4 sm:w-[130px]"
        alt=""
      />
      <div className="absolute right-5 bottom-[6.5rem] sm:right-6 sm:bottom-[7rem] rounded-2xl rounded-br-sm bg-primary-foreground/20 px-3 py-1.5 text-[11px] font-bold backdrop-blur-md shadow-sm animate-in zoom-in fade-in duration-500 delay-500 fill-mode-both">
        Swastiastu!
      </div>

      {/* Content wrapper limited to left side to prevent overlap */}
      <div className="relative z-10 w-[65%]">
        <p className="text-[11px] font-medium text-primary-foreground/80">Lanjutkan belajarmu</p>
        <h3 className="mt-1 text-lg font-bold leading-tight">{mod.title}</h3>

        <div className="mt-5 flex items-center justify-between text-xs font-semibold">
          <span>{progressPercent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
          <div
            className="h-full rounded-full bg-primary-foreground transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <button
          onClick={onStart}
          className="mt-5 flex h-10 w-max items-center justify-center gap-1.5 rounded-full bg-primary-foreground px-4 text-xs font-bold text-primary shadow-sm transition-transform active:scale-95"
        >
          Lanjutkan Belajar <ChevronRight className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function RowCard({
  mod,
  status,
  onOpen,
}: {
  mod: CourseModule;
  status: ModuleStatus;
  onOpen: () => void;
}) {
  const locked = status === "terkunci";
  const done = status === "selesai";
  const progress = done ? 100 : locked ? 0 : 35; // Visual demo progress

  // Choose a glyph based on module theme to act as the "flag"
  const iconGlyph = mod.theme === "pengenalan" ? "ᬳ" : mod.theme === "pengangge" ? "ᬵ" : "ᬓ";

  return (
    <button
      onClick={() => {
        if (locked) {
          notifyModuleLocked();
          return;
        }
        onOpen();
      }}
      aria-disabled={locked}
      className={`flex w-full items-center gap-4 rounded-3xl bg-card p-4 text-left shadow-sm border border-border/50 transition-all ${
        locked ? "opacity-60 grayscale-[0.5]" : "active:scale-[0.98]"
      }`}
    >
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-full text-2xl font-balinese ${
          done
            ? "bg-success/15 text-success"
            : locked
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary"
        }`}
      >
        {iconGlyph}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-foreground">{mod.title}</h3>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">{progress}% Selesai</p>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${done ? "bg-success" : "bg-primary"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground/40" />
    </button>
  );
}

function TreeCard({
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
      onClick={() => {
        if (disabled) {
          notifyModuleLocked();
          return;
        }
        onOpenDetail(mod);
      }}
      aria-disabled={disabled}
      className={cn(
        "group relative z-10 flex w-full items-center gap-3 overflow-hidden border-2 p-4 text-left transition-all duration-150 ease-out",
        isHero
          ? "rounded-[1.25rem] border-transparent bg-cta text-primary-foreground"
          : status === "selesai"
            ? "tile-duo rounded-2xl border-border bg-card hover:bg-muted/60"
            : "rounded-2xl border-border bg-card",
        !disabled && !isHero && "transition-all duration-200",
        !disabled && !isHero && status === "selesai" && "hover:-translate-y-0.5",
        !disabled && isHero && "transition-transform active:scale-[0.99]",
      )}
    >
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
          <span className={cn("truncate text-[15px]", isHero ? "font-extrabold" : "font-bold")}>
            {mod.title}
          </span>
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
        <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-cta">
          <Play className="size-4 fill-current" />
        </span>
      ) : null}
    </button>
  );
}
