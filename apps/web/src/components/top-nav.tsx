import { Moon, Sun } from "lucide-react";

import { cn } from "@caksara/ui/lib/utils";

import { loadProfile, subscribeProfile } from "@/lib/profile-store";
import { useSyncExternalStore } from "react";
import { ProfileAvatar } from "./profile-avatar";
import { useTheme } from "./theme-provider";
import { tabs } from "./nav-tabs";
import type { NavTab } from "./nav-tabs";

export function TopNav({ active, onSelect }: { active: NavTab; onSelect: (t: NavTab) => void }) {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, loadProfile);
  const { resolvedTheme, setTheme } = useTheme();
  const name = profile?.name || "Teman Belajar";
  const isDark = resolvedTheme !== "light";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-lg items-center gap-6 px-4 md:max-w-2xl lg:max-w-5xl">
        <button
          type="button"
          onClick={() => onSelect("beranda")}
          className="flex shrink-0 items-center gap-2"
          aria-label="CAKSARA Beranda"
        >
          <span aria-hidden className="font-balinese text-2xl leading-none text-primary">
            ᬳ
          </span>
          <span className="text-base font-bold tracking-tight">CAKSARA</span>
        </button>

        <nav aria-label="Navigasi utama" className="flex flex-1 items-center justify-center gap-1">
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
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
          <button
            type="button"
            onClick={() => onSelect("profil")}
            aria-label="Buka profil"
            className="transition-transform active:scale-95"
          >
            <ProfileAvatar name={name} avatar={profile?.avatar} className="size-10 text-base" />
          </button>
        </div>
      </div>
    </header>
  );
}
