import { cn } from "@caksara/ui/lib/utils";

import { tabs } from "./nav-tabs";
import type { NavTab } from "./nav-tabs";

export type { NavTab };

export function BottomNav({ active, onSelect }: { active: NavTab; onSelect: (t: NavTab) => void }) {
  return (
    <nav aria-label="Navigasi utama" className="bg-transparent px-4 pb-4">
      <div className="mx-auto grid w-full max-w-lg md:max-w-2xl lg:max-w-4xl grid-cols-5 gap-1 rounded-3xl bg-card p-2">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "bg-transparent",
                )}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
