import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { loadProfile, subscribeProfile } from "@/lib/profile-store";
import { useTheme } from "./theme-provider";
import { ProfileAvatar } from "./profile-avatar";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted transition-transform active:scale-90"
    >
      {isDark ? <Sun className="size-4 text-primary" /> : <Moon className="size-4 text-primary" />}
    </button>
  );
}

export default function Header() {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, loadProfile);
  const name = profile?.name || "Teman Belajar";
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 50) + 1;

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid h-14 w-full max-w-lg grid-cols-[auto_1fr_auto] items-center gap-3 px-4 md:max-w-2xl">
        {/* Kiri — avatar ke profil */}
        <a
          href="/"
          aria-label={`Profil ${name}`}
          className="shrink-0 transition-transform active:scale-90"
        >
          <ProfileAvatar
            name={name}
            avatar={profile?.avatar}
            className="size-9 text-sm ring-2 ring-primary/25"
          />
        </a>

        {/* Tengah — branding + stats ringkas */}
        <div className="flex min-w-0 flex-col items-center">
          <p className="flex items-center gap-1 text-sm font-bold leading-none tracking-tight">
            <span aria-hidden className="font-balinese text-lg leading-none text-primary">
              ᬳ
            </span>
            CAKSARA
          </p>
          <p className="mt-0.5 truncate text-[10px] font-semibold tabular-nums text-muted-foreground">
            {name} · Lv {level} · {xp} XP
          </p>
        </div>

        {/* Kanan — theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
