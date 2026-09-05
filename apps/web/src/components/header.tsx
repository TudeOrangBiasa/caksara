import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { loadProfile, subscribeProfile } from "@/lib/profile-store";
import { useTheme } from "./theme-provider";
import { ProfileAvatar } from "./profile-avatar";

export default function Header() {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, loadProfile);
  const { resolvedTheme, setTheme } = useTheme();
  const name = profile?.name || "Teman Belajar";
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 50) + 1;
  const isDark = resolvedTheme !== "light";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-lg md:max-w-2xl lg:max-w-4xl items-center justify-between px-4">
        <a href="/" className="flex min-w-0 items-center gap-3" aria-label="CAKSARA Beranda">
          <ProfileAvatar
            name={name}
            avatar={profile?.avatar}
            className="size-11 text-lg ring-2 ring-primary/20"
          />
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight">{name}</span>
            <span className="mt-0.5 block text-xs font-semibold text-primary">
              Level {level} · {xp} XP
            </span>
          </span>
        </a>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          className="flex size-10 items-center justify-center rounded-full bg-card transition-transform active:scale-95"
        >
          {isDark ? (
            <Sun className="size-4 text-primary" />
          ) : (
            <Moon className="size-4 text-primary" />
          )}
        </button>
      </div>
    </header>
  );
}
