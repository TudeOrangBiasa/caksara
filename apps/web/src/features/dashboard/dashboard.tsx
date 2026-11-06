import { Flame, Target, BookOpen, LibraryBig, MessageCircleQuestion, Trophy } from "lucide-react";

import { courseModules, deriveStatus } from "../module/module-data";
import type { CourseModule, ModuleStatus } from "../module/module-data";
import type { UserProfile } from "../../lib/zod/profile";

import { MasteryGrid } from "../../components/mastery-grid";
import { usePrefersReducedMotion } from "../../lib/use-prefers-reduced-motion";
import { ModulCard } from "../module/modul-card";

function TargetHarian({ profile }: { profile: UserProfile | null }) {
  const current = Math.min(50, profile?.xp ?? 0);
  const progress = Math.round((current / 50) * 100);

  return (
    <div className="flex items-center gap-4 rounded-3xl bg-card p-5 border border-border/50 shadow-sm">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Target className="size-7" />
      </div>
      <div className="flex-1">
        <h3 className="text-[15px] font-bold text-foreground">Kumpulkan 50 XP</h3>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          {current} / 50 XP hari ini
        </p>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button type="button" className="text-xs font-bold text-primary px-1 hover:underline">
        Ubah
      </button>
    </div>
  );
}

function LatihanCepat({
  onOpenKb,
  onOpenGuru,
  onOpenPeringkat,
  onStart,
}: {
  onOpenKb: () => void;
  onOpenGuru: () => void;
  onOpenPeringkat: () => void;
  onStart: () => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <button onClick={onOpenKb} className="group flex flex-col items-center gap-2">
        <div className="flex size-[4.25rem] items-center justify-center rounded-3xl bg-blue-500/15 text-blue-600 shadow-sm transition-transform active:scale-95 group-hover:-translate-y-1 dark:bg-blue-500/20 dark:text-blue-400">
          <LibraryBig className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground">Kamus</span>
      </button>
      <button onClick={onStart} className="group flex flex-col items-center gap-2">
        <div className="flex size-[4.25rem] items-center justify-center rounded-3xl bg-rose-500/15 text-rose-600 shadow-sm transition-transform active:scale-95 group-hover:-translate-y-1 dark:bg-rose-500/20 dark:text-rose-400">
          <BookOpen className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground">Latihan</span>
      </button>
      <button onClick={onOpenGuru} className="group flex flex-col items-center gap-2">
        <div className="flex size-[4.25rem] items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 shadow-sm transition-transform active:scale-95 group-hover:-translate-y-1 dark:bg-emerald-500/20 dark:text-emerald-400">
          <MessageCircleQuestion className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground">Guru AI</span>
      </button>
      <button onClick={onOpenPeringkat} className="group flex flex-col items-center gap-2">
        <div className="flex size-[4.25rem] items-center justify-center rounded-3xl bg-amber-500/15 text-amber-600 shadow-sm transition-transform active:scale-95 group-hover:-translate-y-1 dark:bg-amber-500/20 dark:text-amber-400">
          <Trophy className="size-6" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground">Papan</span>
      </button>
    </div>
  );
}

export function Dashboard({
  profile,
  selesai,
  onStart,
  onOpenGuru,
  onOpenKb,
  onOpenPeringkat,
  onOpenDetail,
}: {
  profile: UserProfile | null;
  selesai: ReadonlySet<string>;
  onStart: () => void;
  onOpenGuru: () => void;
  onOpenKb: (query: string) => void;
  onOpenPeringkat: () => void;
  onOpenDetail: (mod: CourseModule) => void;
}) {
  const statuses = deriveStatus(selesai);
  const totalSelesai = courseModules.filter((m) => selesai.has(m.id)).length;
  const activeIdx = statuses.findIndex((s) => s === "aktif");
  const featured = courseModules[activeIdx >= 0 ? activeIdx : courseModules.length - 1];
  const featuredStatus: ModuleStatus =
    activeIdx >= 0 ? "aktif" : (statuses[statuses.length - 1] ?? "terkunci");

  const userName = profile?.name ? profile.name.split(" ")[0] : "Penjelajah";
  const reduceMotion = usePrefersReducedMotion();
  const streakPulse = (profile?.streak ?? 0) > 0 && !reduceMotion;

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-6 pb-28 font-sans bg-background/50">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">
            Rahajeng, {userName}! 👋
          </h1>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">
            Mau belajar apa hari ini?
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 shadow-sm">
          <Flame
            className={`size-[18px] text-warning${streakPulse ? " animate-pulse" : ""}`}
            strokeWidth={2.5}
          />
          <span className="text-sm font-bold text-warning">{profile?.streak ?? 0}</span>
        </div>
      </header>

      {/* Featured Banner */}
      {featured && (
        <ModulCard
          variant="featured"
          mod={featured}
          status={featuredStatus}
          totalSelesai={totalSelesai}
          onStart={onStart}
        />
      )}

      {/* My Courses */}
      <section className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-foreground tracking-tight">Modul Saya</h2>
          <button onClick={onStart} className="text-[13px] font-bold text-primary hover:underline">
            Lihat Semua
          </button>
        </div>
        <div className="space-y-3">
          {courseModules.slice(0, 3).map((mod, i) => (
            <ModulCard
              key={mod.id}
              variant="row"
              mod={mod}
              status={statuses[i] ?? "terkunci"}
              onOpen={() => onOpenDetail(mod)}
            />
          ))}
        </div>
      </section>

      {/* Today's Goal */}
      <section className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-foreground tracking-tight">Target Harian</h2>
          <button className="text-[13px] font-bold text-primary hover:underline">
            Ubah Target
          </button>
        </div>
        <TargetHarian profile={profile} />
      </section>

      {/* Quick Practice */}
      <section className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
        <div className="mb-4">
          <h2 className="text-[17px] font-bold text-foreground tracking-tight">Latihan Cepat</h2>
          <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">
            Asah kemampuanmu kapan saja
          </p>
        </div>
        <LatihanCepat
          onOpenKb={() => onOpenKb("")}
          onOpenGuru={onOpenGuru}
          onOpenPeringkat={onOpenPeringkat}
          onStart={onStart}
        />
      </section>

      {/* Mastery 18 Wresastra */}
      <section className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/50">
        <MasteryGrid mastery={profile?.mastery} />
      </section>
    </div>
  );
}
