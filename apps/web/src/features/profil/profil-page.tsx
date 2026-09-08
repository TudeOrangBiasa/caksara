import {
  CalendarCheck,
  ChevronRight,
  Flame,
  Footprints,
  Map,
  Settings,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";

import { cn } from "@caksara/ui/lib/utils";

import { ProfileAvatar } from "../../components/profile-avatar";
import { loadProfile } from "../../lib/profile-store";
import { courseModules } from "../module/module-data";

interface Badge {
  icon: React.ReactNode;
  title: string;
  desc: string;
  unlocked: boolean;
}

function buildBadges(
  selesaiCount: number,
  totalModul: number,
  xp: number,
  streak: number,
): Badge[] {
  return [
    {
      icon: <Footprints className="size-5" />,
      title: "Langkah Pertama",
      desc: "Selesaikan 1 modul",
      unlocked: selesaiCount >= 1,
    },
    {
      icon: <Map className="size-5" />,
      title: "Penjelajah",
      desc: "Selesaikan 2 modul",
      unlocked: selesaiCount >= 2,
    },
    {
      icon: <Trophy className="size-5" />,
      title: "Paripurna",
      desc: `Tuntaskan ${totalModul} modul`,
      unlocked: selesaiCount >= totalModul,
    },
    {
      icon: <Flame className="size-5" />,
      title: "Pejuang Streak",
      desc: "Belajar 3 hari beruntun",
      unlocked: streak >= 3,
    },
    {
      icon: <CalendarCheck className="size-5" />,
      title: "Konsisten",
      desc: "Belajar 7 hari beruntun",
      unlocked: streak >= 7,
    },
    {
      icon: <Sparkles className="size-5" />,
      title: "Kolektor XP",
      desc: "Kumpulkan 100 XP",
      unlocked: xp >= 100,
    },
  ];
}

export function ProfilPage({
  selesai,
  onOpenSettings,
  onOpenShare,
}: {
  selesai: ReadonlySet<string>;
  onOpenSettings: () => void;
  onOpenShare: () => void;
}) {
  const profile = loadProfile();
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 50) + 1;
  const intoLevel = xp % 50;
  const selesaiCount = courseModules.filter((m) => selesai.has(m.id)).length;
  const badges = buildBadges(selesaiCount, courseModules.length, xp, profile?.streak ?? 0);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 md:max-w-2xl lg:max-w-5xl">
      <header className="hero-texture surface-raised rounded-3xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/20 p-1">
            <ProfileAvatar
              name={profile?.name ?? "Teman Baru"}
              avatar={profile?.avatar}
              className="size-14 text-xl"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold tracking-tight">
              {profile?.name ?? "Teman Baru"}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
              {profile?.id?.startsWith("anon_") || profile?.isAnon
                ? "Profil anonim"
                : "Petualang Caksara"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatMini label="XP" value={profile?.xp ?? 0} />
          <StatMini label="Hati" value={profile?.hearts ?? 5} />
          <StatMini label="Streak" value={profile?.streak ?? 0} />
        </div>
      </header>

      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Progres
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-bold">Level {level}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {intoLevel}/50 XP ke Level {level + 1}
          </p>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(intoLevel / 50) * 100}%` }}
          />
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground tabular-nums">
          {selesaiCount}/{courseModules.length} modul selesai
        </p>
      </div>

      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pencapaian
        </p>
        <div className="mt-1 mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Lencana</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary tabular-nums">
            {unlockedCount}/{badges.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.title}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center",
                b.unlocked ? "bg-primary/10" : "bg-muted/50 opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  b.unlocked
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {b.icon}
              </span>
              <p className="mt-1 text-xs font-bold">{b.title}</p>
              <p className="text-[11px] text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-t border-border/60 pt-6 lg:grid-cols-2">
        <button
          type="button"
          onClick={onOpenShare}
          className="flex w-full items-center gap-3 rounded-3xl bg-card px-4 py-3 text-left shadow-sm transition-transform active:scale-[0.99]"
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Share2 className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Bagikan Capaian</p>
            <p className="truncate text-xs text-muted-foreground">
              Buat kartu prestasi 1080×1350 dan bagikan
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-3xl bg-card px-4 py-3 text-left shadow-sm hover:bg-muted"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted">
            <Settings className="size-5 text-muted-foreground" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">Pengaturan</p>
            <p className="text-xs text-muted-foreground">
              Tema, ukuran aksara, suara, dan reset progres
            </p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2.5 text-center">
      <p className="text-lg leading-none font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-white/80">{label}</p>
    </div>
  );
}
