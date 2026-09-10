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
import { AnimatedNumber } from "../../components/animated-number";
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
    <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-6 md:max-w-2xl lg:max-w-6xl lg:grid lg:grid-cols-[340px_1fr] lg:gap-8 lg:items-start animate-in fade-in duration-500">
      {/* Left Column (Sticky Sidebar on Desktop) */}
      <div className="lg:sticky lg:top-24 flex flex-col gap-6">
        <header className="relative overflow-hidden rounded-[1.75rem] min-h-[220px] p-6 shadow-md flex flex-col justify-between group">
          <img 
            src="/assets/review_family_2d_1788968477297.jpg" 
            alt="Profil background" 
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          
          <div className="relative z-10 flex items-center gap-4">
            <span className="relative flex shrink-0 items-center justify-center rounded-full bg-white/20 p-1.5 shadow-sm backdrop-blur-md">
              <ProfileAvatar
                name={profile?.name ?? "Teman Baru"}
                avatar={profile?.avatar}
                className="size-16 text-2xl shadow-inner"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-2xl font-extrabold tracking-tight text-white">
                {profile?.name ?? "Teman Baru"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
                {profile?.id?.startsWith("anon_") || profile?.isAnon
                  ? "Profil anonim"
                  : "Petualang Caksara"}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 mt-8 grid grid-cols-3 gap-3">
            <StatMini label="XP" value={profile?.xp ?? 0} color="bg-white/10 text-white border border-white/20" />
            <StatMini label="Hati" value={profile?.hearts ?? 5} color="bg-white/10 text-white border border-white/20" />
            <StatMini label="Streak" value={profile?.streak ?? 0} color="bg-white/10 text-white border border-white/20" />
          </div>
        </header>

        <div className="hidden lg:grid gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenShare}
            className="flex w-full items-center gap-3 rounded-[1.5rem] bg-card px-4 py-4 text-left shadow-sm transition-transform active:scale-[0.99] ring-1 ring-border/50 hover:bg-muted/40"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Share2 className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Bagikan Capaian</p>
              <p className="truncate text-[11px] font-medium text-muted-foreground mt-0.5">
                Pamerkan kartu prestasimu
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex w-full items-center gap-3 rounded-[1.5rem] bg-card px-4 py-4 text-left shadow-sm transition-transform active:scale-[0.99] ring-1 ring-border/50 hover:bg-muted/40"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted shadow-inner ring-1 ring-border/50">
              <Settings className="size-6 text-muted-foreground" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">Pengaturan</p>
              <p className="truncate text-[11px] font-medium text-muted-foreground mt-0.5">
                Tema, audio & preferensi
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Right Column (Main content) */}
      <div className="mt-8 lg:mt-0 flex flex-col gap-6">
        <div className="rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/50 border border-border/40">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Trophy className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Progres Belajar</p>
              <h2 className="text-lg font-extrabold tracking-tight">Level {level}</h2>
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs font-bold">
            <span>{intoLevel} XP</span>
            <span className="text-muted-foreground">Butuh {50 - intoLevel} XP lagi</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted shadow-inner">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${(intoLevel / 50) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-xs font-semibold text-muted-foreground">
            <span className="text-foreground">{selesaiCount} dari {courseModules.length}</span> modul telah diselesaikan
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-card p-6 shadow-sm ring-1 ring-border/50 border border-border/40">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Pencapaian</p>
                <h2 className="text-xl font-extrabold tracking-tight">Koleksi Lencana</h2>
              </div>
            </div>
            <span className="rounded-2xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary tabular-nums shadow-sm border border-primary/20">
              {unlockedCount} / {badges.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.title}
                className={`flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center transition-all ${
                  b.unlocked ? "bg-primary/5 ring-1 ring-primary/20 shadow-sm" : "bg-muted/40 opacity-60 grayscale-[50%]"
                }`}
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-full shadow-sm ${
                    b.unlocked
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground ring-1 ring-border/50"
                  }`}
                >
                  {b.icon}
                </span>
                <div>
                  <p className="text-xs font-bold">{b.title}</p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground leading-snug max-w-[120px]">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile-only share & settings (hidden on desktop) */}
        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:hidden">
          <button
            type="button"
            onClick={onOpenShare}
            className="flex w-full items-center gap-3 rounded-[1.5rem] bg-card px-4 py-4 text-left shadow-sm transition-transform active:scale-[0.99] ring-1 ring-border/50"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Share2 className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Bagikan Capaian</p>
              <p className="truncate text-[11px] font-medium text-muted-foreground mt-0.5">
                Buat kartu prestasi
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex w-full items-center gap-3 rounded-[1.5rem] bg-card px-4 py-4 text-left shadow-sm transition-transform active:scale-[0.99] ring-1 ring-border/50"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted shadow-inner ring-1 ring-border/50">
              <Settings className="size-6 text-muted-foreground" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">Pengaturan</p>
              <p className="truncate text-[11px] font-medium text-muted-foreground mt-0.5">
                Tema, audio & preferensi
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[1.25rem] px-2 py-3 shadow-sm backdrop-blur-md ${color || 'bg-white/15'}`}>
      <p className="text-2xl leading-none font-extrabold tracking-tight">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 text-[11px] font-bold opacity-90">{label}</p>
    </div>
  );
}
