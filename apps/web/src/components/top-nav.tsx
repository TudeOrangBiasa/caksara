import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@caksara/ui/lib/utils";

import { loadProfile, subscribeProfile } from "@/lib/profile-store";
import { ProfileAvatar } from "./profile-avatar";
import { useTheme } from "./theme-provider";
import { tabs } from "./nav-tabs";
import type { NavTab } from "./nav-tabs";

function NavThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className="flex size-9 items-center justify-center rounded-full bg-muted transition-all duration-150 hover:bg-muted/80 active:scale-90"
    >
      {isDark ? <Sun className="size-4 text-primary" /> : <Moon className="size-4 text-primary" />}
    </button>
  );
}

export function TopNav({ active, onSelect }: { active: NavTab; onSelect: (t: NavTab) => void }) {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, loadProfile);
  const name = profile?.name || "Teman Belajar";
  const xp = profile?.xp ?? 0;
  const level = Math.floor(xp / 50) + 1;

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-lg items-center gap-6 px-4 md:max-w-2xl lg:max-w-7xl lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onSelect("beranda")}
          aria-label="CAKSARA Beranda"
          className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80 active:scale-95"
        >
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:bg-primary/15"
          >
            <span className="font-balinese text-xl leading-none text-primary">ᬳ</span>
          </span>
          <span className="text-[15px] font-bold tracking-tight">CAKSARA</span>
        </button>

        {/* Nav tabs — centered */}
        <nav
          aria-label="Navigasi utama"
          className="flex flex-1 items-center justify-center gap-0.5"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right — level pill + theme + avatar */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary lg:inline-flex">
            Lv {level} · {xp} XP
          </span>
          <NavThemeToggle />
          <button
            type="button"
            onClick={() => onSelect("profil")}
            aria-label="Buka profil"
            className="rounded-full transition-all duration-150 hover:ring-2 hover:ring-primary/30 active:scale-90"
          >
            <ProfileAvatar name={name} avatar={profile?.avatar} className="size-9 text-sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
