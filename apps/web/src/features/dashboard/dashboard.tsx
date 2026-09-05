import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  Flame,
  Heart,
  Lock,
  MessageCircleQuestion,
  Play,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import { courseModules, deriveStatus } from "../module/module-data";
import type { CourseModule, ModuleStatus } from "../module/module-data";
import type { UserProfile } from "../../lib/zod/profile";

const CULTURAL_TIDBITS = [
  {
    glyph: "ᬲᬧᬢ",
    title: "Sapata",
    body: "Aksara Bali ditulis tanpa spasi, garis pengkal jadi penanda antar kata. Itu sebabnya 'ᬳᬓ᭄ᬱᬭ' tampil menyambung, seperti senyum yang tak putus.",
  },
  {
    glyph: "ᬮᬶᬂᬕ",
    title: "Lingga",
    body: "Ada 18 aksara wresastra dasar. Bentuknya terinspirasi gerak tubuh dan benda alam, jadi tiap aksara punya cerita sendiri.",
  },
];

const FEATURED_AKSARA = [
  {
    glyph: "ᬅ",
    latin: "a",
    makna: "Aksara pertama, suara 'a', lambang awal & sumber segala sesuatu.",
  },
  { glyph: "ᬦ", latin: "na", makna: "Suara 'na', dekat dengan kata 'narasi', sarana bercerita." },
  { glyph: "ᬘ", latin: "ca", makna: "Suara 'ca', bagian dari urutan spiritual wresastra." },
  { glyph: "ᬭ", latin: "ra", makna: "Suara 'ra', banyak dipakai di nama & doa pembuka." },
  { glyph: "ᬓ", latin: "ka", makna: "Suara 'ka', fondasi dari kata 'kawi' (puisi/sastra)." },
  { glyph: "ᬤ", latin: "da", makna: "Suara 'da', sering muncul dalam sapaan & penanda." },
  { glyph: "ᬢ", latin: "ta", makna: "Suara 'ta', dasar dari kata 'tutur' (pengajaran)." },
  { glyph: "ᬲ", latin: "sa", makna: "Suara 'sa', muncul di 'santi' & 'suksma', bernuansa damai." },
];

function AksaraCard({
  glyph,
  latin,
  selected,
  onSelect,
}: {
  glyph: string;
  latin: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-1 rounded-3xl bg-card p-3 transition-colors ${
        selected ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted/60"
      }`}
    >
      <span className="font-balinese text-2xl leading-none text-primary">{glyph}</span>
      <span className="text-xs text-muted-foreground">{latin}</span>
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-card p-4">
      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-primary">
        {icon}
      </span>
      <span className="mt-1.5 text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

type StatusFilter = "semua" | ModuleStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "aktif", label: "Aktif" },
  { id: "selesai", label: "Selesai" },
  { id: "terkunci", label: "Terkunci" },
];

function FeaturedModul({
  mod,
  status,
  totalSelesai,
  onStart,
}: {
  mod: CourseModule;
  status: ModuleStatus;
  totalSelesai: number;
  onStart: () => void;
}) {
  const done = status === "selesai";
  return (
    <article className="rounded-3xl bg-primary p-5 text-primary-foreground">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
          Modul {mod.order}
        </p>
        <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
          {done ? "Selesai" : "Aktif"}
        </span>
      </div>
      <h3 className="mt-1 text-xl font-bold tracking-tight">{mod.title}</h3>
      <p className="mt-1 text-xs text-white/80">
        {mod.materi.length} materi · {mod.jumlahSoal} soal
      </p>
      <div className="mt-3">
        <p className="text-[11px] text-white/80">
          {totalSelesai} dari {courseModules.length} modul beres
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${(totalSelesai / courseModules.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-white/85">
          <Clock className="size-3.5" /> ±{mod.estimasiMenit} mnt
        </span>
        <button
          type="button"
          onClick={onStart}
          aria-label={done ? "Ulas modul di peta belajar" : "Mulai modul di peta belajar"}
          className="flex size-11 items-center justify-center rounded-full bg-white text-primary transition-transform active:scale-95"
        >
          <Play className="size-5 fill-current" />
        </button>
      </div>
    </article>
  );
}

function ModulRow({
  mod,
  status,
  onOpen,
  onStart,
}: {
  mod: CourseModule;
  status: ModuleStatus;
  onOpen: () => void;
  onStart: () => void;
}) {
  const locked = status === "terkunci";
  const done = status === "selesai";
  return (
    <button
      type="button"
      onClick={locked ? undefined : onOpen}
      disabled={locked}
      className={`flex w-full items-center gap-3 rounded-3xl bg-card p-3.5 text-left transition-transform ${
        locked ? "opacity-60" : "active:scale-[0.99]"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done
            ? "bg-success/15 text-success"
            : locked
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground"
        }`}
      >
        {done ? (
          <Check className="size-5" strokeWidth={2.5} />
        ) : locked ? (
          <Lock className="size-4" />
        ) : (
          mod.order
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {mod.theme}
        </span>
        <span className="block truncate text-sm font-bold">{mod.title}</span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {mod.jumlahSoal} soal · ±{mod.estimasiMenit} mnt
        </span>
      </span>
      {!done && !locked && (
        <span
          role="button"
          tabIndex={-1}
          aria-label={`Mulai ${mod.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onStart();
            }
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Play className="size-4 fill-current" />
        </span>
      )}
      {done && (
        <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
          Selesai
        </span>
      )}
    </button>
  );
}

function ModulBerjalan({
  selesai,
  onStart,
  onOpenDetail,
}: {
  selesai: ReadonlySet<string>;
  onStart: () => void;
  onOpenDetail: (mod: CourseModule) => void;
}) {
  const statuses = deriveStatus(selesai);
  const [filter, setFilter] = useState<StatusFilter>("semua");
  const totalSelesai = courseModules.filter((m) => selesai.has(m.id)).length;
  const activeIdx = statuses.findIndex((s) => s === "aktif");
  const featured = courseModules[activeIdx >= 0 ? activeIdx : courseModules.length - 1];
  const featuredStatus: ModuleStatus =
    activeIdx >= 0 ? "aktif" : (statuses[statuses.length - 1] ?? "terkunci");

  return (
    <section aria-label="Modul berjalan" className="mt-6 lg:col-start-1">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-base font-bold tracking-tight">Modul Berjalan</h2>
        <button
          type="button"
          onClick={onStart}
          className="text-xs font-medium text-muted-foreground hover:text-primary"
        >
          Lihat Semua
        </button>
      </div>

      {featured && (
        <FeaturedModul
          mod={featured}
          status={featuredStatus}
          totalSelesai={totalSelesai}
          onStart={onStart}
        />
      )}

      <div
        className="mt-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter modul"
      >
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {courseModules.map((mod, i) => {
          const status = statuses[i] ?? "terkunci";
          if (filter !== "semua" && status !== filter) return null;
          return (
            <ModulRow
              key={mod.id}
              mod={mod}
              status={status}
              onOpen={() => onOpenDetail(mod)}
              onStart={onStart}
            />
          );
        })}
      </div>
    </section>
  );
}

export function Dashboard({
  profile,
  selesai,
  onStart,
  onOpenGuru,
  onOpenKb,
  onOpenDetail,
}: {
  profile: UserProfile | null;
  selesai: ReadonlySet<string>;
  onStart: () => void;
  onOpenGuru: () => void;
  onOpenKb: (query: string) => void;
  onOpenDetail: (mod: CourseModule) => void;
}) {
  const dailyProgress = Math.min(100, Math.round(((profile?.xp ?? 0) % 50) * 2));
  const [selectedAksara, setSelectedAksara] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const aksara = FEATURED_AKSARA.find((a) => a.latin === selectedAksara);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-6 pb-10 md:max-w-2xl lg:max-w-4xl lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-x-8">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight lg:col-start-1">
        Mau Belajar
        <br />
        Apa Hari Ini?
      </h1>

      <form
        className="mt-4 flex items-center gap-2 lg:col-start-1"
        onSubmit={(e) => {
          e.preventDefault();
          onOpenKb(search.trim());
        }}
      >
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aksara, kata, budaya…"
            aria-label="Cari di KB"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <button
          type="button"
          onClick={onOpenGuru}
          aria-label="Tanya Guru Virtual"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
        >
          <MessageCircleQuestion className="size-5" />
        </button>
      </form>

      <ModulBerjalan selesai={selesai} onStart={onStart} onOpenDetail={onOpenDetail} />

      <div className="mt-6 rounded-3xl bg-card p-5 lg:col-start-2 lg:mt-0">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Target className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Target harian</p>
            <p className="text-xs text-muted-foreground">
              {Math.min(50, profile?.xp ?? 0)} / 50 XP
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-primary">{dailyProgress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 lg:col-start-2">
        <StatCard label="XP" value={profile?.xp ?? 0} icon={<Sparkles className="size-4" />} />
        <StatCard label="Streak" value={profile?.streak ?? 0} icon={<Flame className="size-4" />} />
        <StatCard label="Hati" value={profile?.hearts ?? 0} icon={<Heart className="size-4" />} />
      </div>

      <div className="mt-6 lg:col-start-1">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Aksara Wresastra</h2>
            <p className="text-xs text-muted-foreground">Kenalan lewat bentuk &amp; bunyinya.</p>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            Lebih banyak <ArrowRight className="size-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {FEATURED_AKSARA.map((a) => (
            <AksaraCard
              key={a.latin}
              glyph={a.glyph}
              latin={a.latin}
              selected={selectedAksara === a.latin}
              onSelect={() => setSelectedAksara(a.latin)}
            />
          ))}
        </div>
        {aksara && (
          <div className="mt-3 rounded-3xl bg-primary/10 p-4 ring-1 ring-primary/30">
            <div className="flex items-center gap-3">
              <span className="font-balinese text-3xl leading-none text-primary">
                {aksara.glyph}
              </span>
              <div>
                <p className="text-sm font-semibold">Aksara “{aksara.latin}”</p>
                <p className="text-xs text-muted-foreground">Wresastra</p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{aksara.makna}</p>
            <button
              type="button"
              onClick={onStart}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Pelajari di modul <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3 lg:col-start-1">
        <h2 className="text-base font-semibold tracking-tight">Tahukah kamu?</h2>{" "}
        {CULTURAL_TIDBITS.map((t) => (
          <div key={t.title} className="rounded-3xl bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="font-balinese text-2xl leading-none text-primary">{t.glyph}</span>
              <span className="text-sm font-semibold">{t.title}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
