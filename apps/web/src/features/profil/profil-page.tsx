import {
  CalendarCheck,
  Flame,
  Footprints,
  Map,
  Play,
  Settings,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useSyncExternalStore } from "react";
import { ProfileAvatar } from "../../components/profile-avatar";
import { AnimatedNumber } from "../../components/animated-number";
import { MasteryGrid } from "../../components/mastery-grid";
import { LeaderboardCard } from "../leaderboard/leaderboard";
import { XP_STREAK_BONUS } from "../../lib/game-rules";
import { loadProfile, subscribeProfile, witaTodayStr } from "../../lib/profile-store";
import { courseModules } from "../module/module-data";

const WEEKDAY_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
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
  onContinue,
}: {
  selesai: ReadonlySet<string>;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onContinue?: () => void;
}) {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, loadProfile);
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 50) + 1;
  const intoLevel = xp % 50;
  const selesaiCount = courseModules.filter((m) => selesai.has(m.id)).length;
  const badges = buildBadges(selesaiCount, courseModules.length, xp, profile?.streak ?? 0);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-6 md:max-w-2xl lg:max-w-[1216px] lg:px-0 lg:pt-7 lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <header className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[20px] p-6">
          <img
            src="/assets/review_family_2d_1788968477297.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

          <div className="relative z-10 flex items-center gap-3">
            <span className="relative shrink-0 rounded-full bg-white p-1 shadow-sm">
              <ProfileAvatar
                name={profile?.name ?? "Teman Baru"}
                avatar={profile?.avatar}
                className="size-16 text-2xl"
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <p className="w-full break-words text-2xl font-extrabold leading-tight tracking-tight text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.6)]">
                {profile?.name ?? "Teman Baru"}
              </p>
              <p className="mt-1.5 inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold text-zinc-900">
                {profile?.id?.startsWith("anon_") || profile?.isAnon
                  ? "Profil anonim"
                  : "Petualang Caksara"}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-3 gap-2.5">
            <StatMini label="XP" value={profile?.xp ?? 0} />
            <StatMini label="Hati" value={profile?.hearts ?? 5} />
            <StatMini label="Streak" value={profile?.streak ?? 0} />
          </div>
        </header>

        <div className="hidden flex-col gap-3 lg:flex">
          <SideAction
            onClick={onOpenShare}
            icon={<Share2 className="size-6 text-white" />}
            iconBg="bg-[#1CB0F6]"
            title="Bagikan Capaian"
            desc="Pamerkan kartu prestasimu"
          />
          <SideAction
            onClick={onOpenSettings}
            icon={<Settings className="size-6 text-muted-foreground" />}
            iconBg="bg-muted"
            title="Pengaturan"
            desc="Tema, audio dan preferensi"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 lg:mt-0 lg:gap-5">
        <StreakCard streak={profile?.streak ?? 0} lastActive={profile?.lastActiveDate} />

        <section
          aria-label="Progres belajar"
          className="rounded-[20px] border-2 border-b-[5px] border-border bg-card p-5 lg:p-[22px] lg:border lg:border-b-2 lg:shadow-[0_2px_0_0_var(--border)]"
        >
          <div className="mb-3 flex items-center gap-3 lg:mb-0">
            <span className="flex size-[52px] items-center justify-center rounded-full bg-[#FFF3C4] text-[#FFC800]">
              <Trophy className="size-6" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground lg:leading-[12px]">
                Progres Belajar
              </p>
              <h2 className="text-lg font-extrabold tracking-tight lg:leading-[22px]">
                Level {level}
              </h2>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs lg:mt-0">
            <span className="font-bold lg:leading-[15px]">{intoLevel} XP</span>
            <span className="font-medium text-muted-foreground lg:leading-[15px]">
              Butuh {50 - intoLevel} XP lagi
            </span>
          </div>
          <div
            className="mt-2 h-3.5 overflow-hidden rounded-full bg-muted p-0.5 lg:mt-0 lg:h-[14px] lg:p-0"
            role="progressbar"
            aria-valuenow={intoLevel}
            aria-valuemin={0}
            aria-valuemax={50}
            aria-label={`Progres level ${level}`}
          >
            <div
              className="h-full rounded-full bg-[#FFC800] transition-all duration-1000 ease-out"
              style={{ width: `${(intoLevel / 50) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground lg:mt-0 lg:leading-[15px]">
            <span className="font-bold text-foreground">
              {selesaiCount} dari {courseModules.length}
            </span>{" "}
            modul telah diselesaikan
          </p>
          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-cta px-4 py-3 text-[13px] font-extrabold uppercase tracking-widest text-white shadow-[0_4px_0_0_var(--color-cta-edge)] transition-all duration-150 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0.5 active:shadow-none lg:mt-0 lg:py-2.5 lg:leading-[16px]"
            >
              <Play className="size-4 fill-current" aria-hidden />
              Lanjutkan Belajar
            </button>
          )}
        </section>

        <section
          aria-label="Koleksi lencana"
          className="rounded-[20px] border-2 border-b-[5px] border-border bg-card p-5 lg:p-[22px] lg:border lg:border-b-2 lg:shadow-[0_2px_0_0_var(--border)]"
        >
          <div className="mb-4 flex items-center justify-between lg:mb-0">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground lg:leading-[12px]">
                Pencapaian
              </p>
              <h2 className="text-lg font-extrabold tracking-tight lg:leading-[22px]">
                Koleksi Lencana
              </h2>
            </div>
            <span className="rounded-full bg-[#DDF4FF] px-3 py-1.5 text-xs font-bold text-[#1CB0F6] lg:leading-[15px]">
              {unlockedCount} / {badges.length}
            </span>
          </div>
          <ul className="grid grid-cols-3 gap-3 lg:gap-3">
            {badges.map((b) => (
              <li
                key={b.title}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 border-b-4 px-2 py-4 text-center lg:border lg:shadow-[0_2px_0_0_var(--border)] ${
                  b.unlocked ? "border-cta bg-cta/10" : "border-border/60 bg-muted/30 opacity-70"
                }`}
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-full ${
                    b.unlocked ? "bg-cta text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {b.icon}
                </span>
                <p className="text-xs font-bold leading-tight lg:leading-[15px]">{b.title}</p>
                <p className="text-[10px] font-medium leading-snug text-muted-foreground lg:leading-[15px]">
                  {b.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="Mastery aksara"
          className="rounded-[20px] border-2 border-b-[5px] border-border bg-card p-5 lg:p-[22px] lg:border lg:border-b-2 lg:shadow-[0_2px_0_0_var(--border)]"
        >
          <MasteryGrid mastery={profile?.mastery} />
          <p className="mt-3 text-[11px] font-medium text-muted-foreground lg:mt-0 lg:leading-[13px]">
            Status dihitung dari riwayat jawabanmu.
          </p>
        </section>

        <LeaderboardCard currentProfileId={profile?.id} />

        <div className="grid gap-3 pt-1 sm:grid-cols-2 lg:hidden">
          <SideAction
            onClick={onOpenShare}
            icon={<Share2 className="size-6 text-white" />}
            iconBg="bg-[#1CB0F6]"
            title="Bagikan Capaian"
            desc="Buat kartu prestasi"
          />
          <SideAction
            onClick={onOpenSettings}
            icon={<Settings className="size-6 text-muted-foreground" />}
            iconBg="bg-muted"
            title="Pengaturan"
            desc="Tema, audio dan preferensi"
          />
        </div>
      </div>
    </div>
  );
}

function SideAction({
  onClick,
  icon,
  iconBg,
  title,
  desc,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-[20px] border-2 border-b-[5px] border-border bg-card px-4 py-4 text-left transition-all duration-150 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0.5"
    >
      <span
        className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
          {desc}
        </span>
      </span>
    </button>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/25 bg-white/15 px-2 py-3 backdrop-blur-md">
      <p className="text-[22px] font-extrabold leading-none tracking-tight text-white">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 text-[11px] font-bold text-white/90">{label}</p>
    </div>
  );
}

function activeDates(lastActive: string | undefined, streak: number): Set<string> {
  if (!lastActive || streak <= 0) return new Set();
  const active = new Set<string>();
  const end = new Date(`${lastActive}T00:00:00Z`);
  for (let i = 0; i < Math.min(7, streak); i += 1) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    active.add(d.toISOString().slice(0, 10));
  }
  return active;
}

function StreakCard({ streak, lastActive }: { streak: number; lastActive?: string }) {
  const today = witaTodayStr();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const active = activeDates(lastActive, streak);
  const litCount = days.filter((d) => active.has(d)).length;
  return (
    <section
      aria-label="Streak harian"
      className="overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFA726] to-[#FF7A00] p-5 text-white shadow-[0_4px_0_0_#E87500] lg:rounded-3xl lg:p-[22px] lg:shadow-none"
    >
      <div className="mb-3 flex items-center gap-3 lg:mb-0">
        <span className="flex size-[60px] items-center justify-center rounded-full bg-white">
          <Flame className="size-7 fill-[#FF7A00] text-[#FF7A00]" aria-hidden />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/85 lg:text-white lg:leading-[12px]">
            Streak Harian
          </p>
          <h2 className="text-[26px] font-extrabold leading-tight tracking-tight lg:leading-[31px]">
            <AnimatedNumber value={streak} /> Hari
          </h2>
        </div>
      </div>
      <div
        className="grid grid-cols-7 gap-1.5 lg:gap-2"
        role="img"
        aria-label={`Streak ${streak} hari${lastActive === today ? ", sudah belajar hari ini" : ""}`}
      >
        {days.map((day) => {
          const lit = active.has(day);
          const date = new Date(`${day}T00:00:00Z`);
          const weekday = WEEKDAY_ID[date.getUTCDay()];
          const dayNum = day.slice(8);
          return (
            <div
              key={day}
              title={day}
              className={`flex flex-col items-center gap-0.5 rounded-full border-2 px-1 py-1.5 ${
                lit
                  ? "border-[#E87500] bg-white text-[#B4622D]"
                  : "border-white/30 bg-white/25 text-white"
              }`}
            >
              <span className="text-[9px] font-extrabold uppercase lg:text-[10px] lg:leading-[12px]">
                {weekday}
              </span>
              <span className="text-xs font-extrabold tabular-nums lg:leading-[15px]">
                {lit ? `${dayNum} ✓` : dayNum}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] font-medium text-white/90 lg:mt-0 lg:text-white lg:leading-[16px]">
        {lastActive === today
          ? "Sudah belajar hari ini. Balik lagi besok biar streak jalan terus."
          : "Selesaikan 1 kuis untuk menyalakan streak hari ini."}
      </p>
      {streak > 0 && litCount < 7 && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#B4622D] lg:mt-0 lg:px-4 lg:py-2">
          <Flame className="size-3.5 fill-current" aria-hidden />
          {lastActive === today
            ? `+${XP_STREAK_BONUS} XP bonus streak diklaim`
            : `Besok: +${XP_STREAK_BONUS} XP bonus streak`}
        </p>
      )}
    </section>
  );
}
