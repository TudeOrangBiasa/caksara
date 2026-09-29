import { BookOpen, FilterX, RefreshCw, Search, WifiOff } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

import { Button } from "@caksara/ui/components/button";
import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { EmptyState } from "../../components/empty-state";
import { useOnlineStatus } from "../../lib/use-online-status";
import { kbLevelSchema, KB_CATEGORY_META } from "./kb-data";
import type { KbCategory, KbEntry, KbLevel } from "./kb-data";
import { kbMatchesFilter } from "./kb-filter";
import { fetchKbEntries } from "./kb-source";

type CategoryFilter = "semua" | KbCategory;
type LevelFilter = "semua" | KbLevel;

interface KbListProps {
  onOpenEntry: (entry: KbEntry) => void;
  initialQuery?: string;
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

export function KbList({ onOpenEntry, initialQuery }: KbListProps) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<CategoryFilter>("semua");
  const [level, setLevel] = useState<LevelFilter>("semua");
  const [entries, setEntries] = useState<KbEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const online = useOnlineStatus();
  const deferred = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setLoadError(false);
    void fetchKbEntries({}).then((res) => {
      if (cancelled) return;
      setEntries(res.entries);
      setLoadError(res.loadError);
    });
    return () => {
      cancelled = true;
    };
    // V10: muat ulang saat koneksi pulih agar cache KB tersinkron.
  }, [retryKey, online]);

  const list = entries ?? [];
  const filtered = list.filter((e) => kbMatchesFilter(e, { category, level, query: deferred }));

  const hasActiveFilter = category !== "semua" || level !== "semua" || deferred !== "";

  const showNoResults = entries !== null && filtered.length === 0 && hasActiveFilter;
  const showEmpty = entries !== null && filtered.length === 0 && !hasActiveFilter;
  const loading = entries === null;

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
                {loading ? "Memuat…" : `${list.length} Entri`}
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
                <Chip active={level === "semua"} onClick={() => setLevel("semua")}>
                  Semua Level
                </Chip>
                {kbLevelSchema.options.map((l) => (
                  <Chip
                    key={l}
                    active={level === l}
                    onClick={() => setLevel(l)}
                    activeClass={LEVEL_CHIP[l].active}
                    dotClass={LEVEL_CHIP[l].dot}
                  >
                    {LEVEL_LABEL[l]}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Grid of Items) */}
      <div className="lg:min-h-[80vh] lg:pb-12 mt-6 lg:mt-0">
        {!loading && (loadError || !online) && (
          <KbNotice
            tone={!online ? "offline" : "server"}
            onRetry={() => setRetryKey((k) => k + 1)}
          />
        )}
        {loading ? (
          <div className="space-y-10" aria-busy="true" aria-label="Memuat Basis Pengetahuan">
            {(Object.keys(KB_CATEGORY_META) as KbCategory[]).slice(0, 2).map((cat) => (
              <section key={cat} aria-hidden="true">
                <div className="mb-4 h-6 w-40 animate-pulse rounded-full bg-muted" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 rounded-3xl bg-card px-2 py-3.5"
                    >
                      <div className="size-10 animate-pulse rounded-2xl bg-muted" />
                      <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
                      <div className="h-3 w-10 animate-pulse rounded-full bg-muted" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : showNoResults ? (
          <EmptyState
            illustration={<FilterX className="size-7" />}
            title="Tidak ketemu"
            body="Coba kata lain atau bersihkan filter biar hasilnya keluar semua."
            action={
              <Button
                variant="cta"
                className="mx-auto mt-2 h-11 w-full max-w-[200px] text-sm font-bold tracking-wide"
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
                variant="cta"
                className="mx-auto mt-2 h-11 w-full max-w-[200px] text-sm font-bold tracking-wide"
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
      aria-label={`${entry.title}, ${LEVEL_LABEL[entry.level]}`}
      className="relative flex flex-col items-center gap-1.5 rounded-3xl bg-card px-2 py-3.5 text-center shadow-sm transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="absolute top-2 right-2">
        <LevelBadge level={entry.level} />
      </span>
      {entry.glyph ? (
        entry.category === "wresastra" ? (
          <span
            lang="ban"
            className="flex size-10 items-center justify-center font-balinese text-2xl leading-none text-primary"
          >
            {entry.glyph}
          </span>
        ) : (
          <span
            lang="ban"
            className="flex min-h-10 w-full items-center justify-center px-1 text-center font-balinese text-base leading-snug text-primary line-clamp-2"
          >
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
        {entry.category === "wresastra" ? entry.latin : KB_CATEGORY_META[entry.category].label}
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

function KbNotice({ tone, onRetry }: { tone: "offline" | "server"; onRetry: () => void }) {
  const offline = tone === "offline";
  const Icon = offline ? WifiOff : RefreshCw;
  return (
    <div
      role="alert"
      className={
        offline
          ? "mb-4 flex items-center gap-3 rounded-3xl bg-destructive/10 px-4 py-3"
          : "mb-4 flex items-center gap-3 rounded-3xl bg-warning/15 px-4 py-3"
      }
    >
      <span
        className={
          offline
            ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive text-white"
            : "flex size-9 shrink-0 items-center justify-center rounded-full bg-warning text-white"
        }
      >
        <Icon className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-xs leading-relaxed">
        <span className="block font-bold">
          {offline ? "Kamu sedang offline" : "KB server belum bisa dimuat"}
        </span>
        <span className="text-muted-foreground">
          {offline
            ? "Menampilkan materi tersimpan. Sambungkan internet lalu muat ulang."
            : "Menampilkan materi tersimpan di perangkat. Coba muat ulang."}
        </span>
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-semibold transition-transform active:scale-95"
      >
        Coba lagi
      </button>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  activeClass,
  dotClass,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  activeClass?: string;
  dotClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? (activeClass ?? "bg-primary/10 text-primary border-primary/30")
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {dotClass && <span className={cn("size-1.5 rounded-full", dotClass)} />}
      {children}
    </button>
  );
}
