import { BookOpen, FilterX, Library, Search, WifiOff } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { KB_CATEGORY_META, KB_ENTRIES, kbLevelSchema } from "./kb-data";
import type { KbCategory, KbEntry, KbLevel } from "./kb-data";

type CategoryFilter = "semua" | KbCategory;
type LevelFilter = "semua" | KbLevel;

interface KbListProps {
  onOpenEntry: (entry: KbEntry) => void;
  initialQuery?: string;
  simulateError?: boolean;
  simulateEmpty?: boolean;
}

const LEVEL_LABEL: Record<KbLevel, string> = { "1": "Level 1", "2": "Level 2", "3": "Level 3" };

const LEVEL_CHIP: Record<KbLevel, { active: string; dot: string; badge: string }> = {
  "1": {
    active: "bg-primary/10 text-primary border-primary/30",
    dot: "bg-primary",
    badge: "bg-primary/10 text-primary",
  },
  "2": {
    active: "bg-accent/15 text-accent border-accent/40",
    dot: "bg-accent",
    badge: "bg-accent/15 text-accent",
  },
  "3": {
    active: "bg-muted/80 text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    badge: "bg-secondary text-secondary-foreground",
  },
};

const CATEGORY_CHIP: Record<CategoryFilter, string> = {
  semua: "bg-primary/10 text-primary border-primary/30",
  wresastra: "bg-primary/10 text-primary border-primary/30",
  kosakata: "bg-accent/15 text-accent border-accent/40",
  budaya: "bg-success/10 text-success border-success/30",
};

export function KbList({ onOpenEntry, initialQuery, simulateError, simulateEmpty }: KbListProps) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<CategoryFilter>("semua");
  const [level, setLevel] = useState<LevelFilter>("semua");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = KB_ENTRIES.filter((e) => {
    if (category !== "semua" && e.category !== category) return false;
    if (level !== "semua" && e.level !== level) return false;
    if (deferred) {
      const hay = `${e.title} ${e.latin ?? ""} ${e.body}`.toLowerCase();
      if (!hay.includes(deferred)) return false;
    }
    return true;
  });

  const hasActiveFilter = category !== "semua" || level !== "semua" || deferred !== "";

  if (simulateError) {
    return (
      <StatePanel
        icon={<WifiOff className="size-10 text-destructive" />}
        title="Gagal memuat daftar"
        body="Ada masalah saat mengambil data KB. Cek koneksimu lalu coba sekali lagi."
      >
        <Button className="h-11" onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </StatePanel>
    );
  }

  if (simulateEmpty) {
    return (
      <StatePanel
        icon={<Library className="size-10 text-muted-foreground" />}
        title="Belum ada isi KB"
        body="Kamus aksara & budaya masih kosong. Sumbernya sedang disusun pelan-pelan."
      >
        <Button className="h-11" onClick={() => setCategory("semua")}>
          Buka Semua
        </Button>
      </StatePanel>
    );
  }

  const showNoResults = filtered.length === 0 && hasActiveFilter;
  const showEmpty = filtered.length === 0 && !hasActiveFilter;

  return (
    <div className="mx-auto max-w-lg px-4 py-5 md:max-w-2xl lg:max-w-5xl">
      <header className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Kamus</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {KB_ENTRIES.length} Entri
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">KB Entri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua materi yang jadi dasar soal & Guru Virtual, bisa ditelusuri sumbernya.
        </p>
      </header>

      <label className="flex items-center gap-2 rounded-full bg-card px-4 py-3 lg:max-w-3xl">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari aksara, kata, atau budaya…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Cari KB"
        />
      </label>

      <div className="mt-3 space-y-2 lg:max-w-3xl">
        <div
          className="flex gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter kategori"
        >
          <Chip active={category === "semua"} onClick={() => setCategory("semua")}>
            Semua
          </Chip>
          {(Object.keys(KB_CATEGORY_META) as KbCategory[]).map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              activeClass={CATEGORY_CHIP[c]}
            >
              {KB_CATEGORY_META[c].label}
            </Chip>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter level">
          <LevelChipFilter active={level === "semua"} onClick={() => setLevel("semua")}>
            Semua Level
          </LevelChipFilter>
          {kbLevelSchema.options.map((l) => (
            <LevelChipFilter key={l} active={level === l} onClick={() => setLevel(l)} level={l}>
              {LEVEL_LABEL[l]}
            </LevelChipFilter>
          ))}
        </div>
      </div>

      {showNoResults ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl bg-card px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            <FilterX className="size-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-semibold">Tidak ketemu</h2>
          <p className="mt-1 max-w-[34ch] text-sm text-muted-foreground">
            Coba kata lain atau bersihkan filter biar hasilnya keluar semua.
          </p>
          <Button
            className="mt-5 h-11"
            onClick={() => {
              setQuery("");
              setCategory("semua");
              setLevel("semua");
            }}
          >
            Reset Filter
          </Button>
        </div>
      ) : showEmpty ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl bg-card px-6 py-10 text-center">
          <Bedawang className="size-24" mood="sedih" />
          <h2 className="mt-3 text-base font-semibold">KB masih kosong</h2>
          <p className="mt-1 max-w-[34ch] text-sm text-muted-foreground">
            Belum ada entri untuk filter ini. Coba buka semua kategori.
          </p>
          <Button className="mt-5 h-11" onClick={() => setCategory("semua")}>
            Buka Semua
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-8">
          {(Object.keys(KB_CATEGORY_META) as KbCategory[]).map((cat) => {
            const items = filtered.filter((e) => e.category === cat);
            if (items.length === 0) return null;
            const meta = KB_CATEGORY_META[cat];
            return (
              <section key={cat} aria-labelledby={`kb-sec-${cat}`}>
                <header className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h2 id={`kb-sec-${cat}`} className="text-sm font-semibold tracking-tight">
                    {meta.label}
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {items.length}
                  </span>
                  <span className="w-full text-xs text-muted-foreground sm:w-auto">
                    {meta.desc}
                  </span>
                </header>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
                  {items.map((e) => (
                    <KbCard key={e.id} entry={e} onOpen={onOpenEntry} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KbCard({ entry, onOpen }: { entry: KbEntry; onOpen: (e: KbEntry) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="flex flex-col items-center gap-1.5 rounded-3xl bg-card px-2 py-3.5 text-center transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
    >
      {entry.glyph ? (
        entry.category === "wresastra" ? (
          <span className="flex size-10 items-center justify-center font-balinese text-2xl leading-none text-primary">
            {entry.glyph}
          </span>
        ) : (
          <span className="flex min-h-10 w-full items-center justify-center px-1 text-center font-balinese text-base leading-snug text-primary line-clamp-2">
            {entry.glyph}
          </span>
        )
      ) : (
        <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary">
          <BookOpen className="size-5 text-primary" />
        </span>
      )}
      <span className="truncate text-xs font-medium">{entry.title}</span>
      <span className="text-[11px] text-muted-foreground">
        {entry.category === "wresastra" ? entry.latin : `Level ${entry.level}`}
      </span>
    </button>
  );
}

export function LevelBadge({ level }: { level: KbLevel }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
        LEVEL_CHIP[level].badge,
      )}
    >
      {LEVEL_LABEL[level]}
    </span>
  );
}

function Chip({
  children,
  active,
  onClick,
  activeClass,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? (activeClass ?? "bg-primary/10 text-primary border-primary/30")
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function LevelChipFilter({
  children,
  active,
  onClick,
  level,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  level?: KbLevel;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? level
            ? LEVEL_CHIP[level].active
            : "bg-primary/10 text-primary border-primary/30"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {level && <span className={cn("size-1.5 rounded-full", LEVEL_CHIP[level].dot)} />}
      {children}
    </button>
  );
}

function StatePanel({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center md:max-w-2xl px-6 py-24 text-center">
      {icon}
      <h1 className="mt-4 text-lg font-semibold">{title}</h1>
      <p className="mt-1 max-w-[34ch] text-sm text-muted-foreground">{body}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
