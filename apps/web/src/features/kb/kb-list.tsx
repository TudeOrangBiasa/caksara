import { BookOpen, FilterX, Library, Search, WifiOff } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { EmptyState } from "../../components/empty-state";
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
      <EmptyState
        illustration={<WifiOff className="size-7" />}
        title="Gagal memuat daftar"
        body="Ada masalah saat mengambil data KB. Cek koneksimu lalu coba sekali lagi."
        tone="danger"
        action={
          <Button
            className="h-11 w-full rounded-full font-semibold"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </Button>
        }
      />
    );
  }

  if (simulateEmpty) {
    return (
      <EmptyState
        illustration={<Library className="size-7" />}
        title="Belum ada isi KB"
        body="Kamus aksara & budaya masih kosong. Sumbernya sedang disusun pelan-pelan."
        action={
          <Button
            className="h-11 w-full rounded-full font-semibold"
            onClick={() => setCategory("semua")}
          >
            Buka Semua
          </Button>
        }
      />
    );
  }

  const showNoResults = filtered.length === 0 && hasActiveFilter;
  const showEmpty = filtered.length === 0 && !hasActiveFilter;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-5 md:max-w-2xl lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-[320px_1fr] lg:gap-10 lg:items-start">
      {/* Left Column (Sticky Sidebar on Desktop) */}
      <div className="lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-6">
        <header className="relative mb-6 lg:mb-0 overflow-hidden rounded-[1.75rem] min-h-[200px] flex flex-col justify-end p-6 shadow-md group">
          <img
            src="/assets/bali_lontar_2d_1788968315337.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

          <div className="relative z-10 flex-1 flex flex-col justify-end">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                Kamus & Pustaka
              </p>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
                {KB_ENTRIES.length} Entri
              </span>
            </div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-white md:text-[32px] leading-tight">
              Basis Pengetahuan
            </h1>
            <p className="mt-1.5 text-[13px] font-medium text-white/80 max-w-[350px] leading-relaxed">
              Semua materi dasar kuis & referensi Guru Virtual.
            </p>
          </div>
        </header>

        <div className="bg-card rounded-[1.75rem] p-5 shadow-sm border border-border/50">
          <label className="flex items-center gap-2 rounded-full bg-background px-4 py-3 ring-1 ring-border/50 focus-within:ring-primary focus-within:ring-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari aksara, kata..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Cari KB"
            />
          </label>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Kategori
              </p>
              <div className="flex flex-wrap gap-2">
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
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Tingkat Kesulitan
              </p>
              <div className="flex flex-wrap gap-2">
                <LevelChipFilter active={level === "semua"} onClick={() => setLevel("semua")}>
                  Semua Level
                </LevelChipFilter>
                {kbLevelSchema.options.map((l) => (
                  <LevelChipFilter
                    key={l}
                    active={level === l}
                    onClick={() => setLevel(l)}
                    level={l}
                  >
                    {LEVEL_LABEL[l]}
                  </LevelChipFilter>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Grid of Items) */}
      <div className="lg:min-h-[80vh] lg:pb-12 mt-6 lg:mt-0">
        {showNoResults ? (
          <EmptyState
            illustration={<FilterX className="size-7" />}
            title="Tidak ketemu"
            body="Coba kata lain atau bersihkan filter biar hasilnya keluar semua."
            action={
              <Button
                className="h-11 w-full rounded-full font-semibold max-w-[200px] mt-2"
                onClick={() => {
                  setQuery("");
                  setCategory("semua");
                  setLevel("semua");
                }}
              >
                Reset Filter
              </Button>
            }
          />
        ) : showEmpty ? (
          <EmptyState
            illustration={<Bedawang className="size-12" mood="sedih" />}
            title="KB masih kosong"
            body="Belum ada entri untuk filter ini. Coba buka semua kategori."
            action={
              <Button
                className="h-11 w-full rounded-full font-semibold max-w-[200px] mt-2"
                onClick={() => setCategory("semua")}
              >
                Buka Semua
              </Button>
            }
          />
        ) : (
          <div className="space-y-10">
            {(Object.keys(KB_CATEGORY_META) as KbCategory[]).map((cat) => {
              const items = filtered.filter((e) => e.category === cat);
              if (items.length === 0) return null;
              const meta = KB_CATEGORY_META[cat];
              return (
                <section key={cat} aria-labelledby={`kb-sec-${cat}`}>
                  <header className="mb-4 flex flex-col gap-1 border-b border-border/40 pb-4">
                    <div className="flex items-center gap-2">
                      <h2
                        id={`kb-sec-${cat}`}
                        className="text-lg font-bold tracking-tight text-foreground"
                      >
                        {meta.label}
                      </h2>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        {items.length}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground max-w-[600px]">
                      {meta.desc}
                    </p>
                  </header>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
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
    </div>
  );
}

function KbCard({ entry, onOpen }: { entry: KbEntry; onOpen: (e: KbEntry) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="flex flex-col items-center gap-1.5 rounded-3xl bg-card px-2 py-3.5 text-center shadow-sm transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
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
