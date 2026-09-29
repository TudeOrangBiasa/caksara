import {
  ArrowLeft,
  ChevronRight,
  Info,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Type,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import * as React from "react";

import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { useTheme } from "../../components/theme-provider";
import { playPreview } from "../../lib/sound";
import { notifyProgressReset } from "../../lib/notify";
import {
  initSettings,
  loadSettings,
  resetAllProgress,
  setSoundEnabled,
  setWresastraFontSize,
  subscribeSettings,
  WRESASTRA_FONT_SIZES,
} from "./settings-store";
import { ProfileSection } from "./profile-section";

const PREVIEW_GLYPH = "ᬳᬦᬘᬭᬓ";

type ThemeMode = "system" | "light" | "dark";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Sistem", icon: Monitor },
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
];

function Swing({ checked, onChecked }: { checked: boolean; onChecked: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChecked(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

type SettingsSection = "profil" | "tampilan" | "aksara" | "suara" | "data" | "tentang";

const SECTION_META: Record<SettingsSection, { title: string; desc: string; icon: typeof Sun }> = {
  profil: { title: "Profil", desc: "Foto, warna avatar, nama", icon: User },
  tampilan: { title: "Tampilan", desc: "Tema terang, gelap, sistem", icon: Sun },
  aksara: { title: "Ukuran Aksara", desc: "Besar huruf Wresastra", icon: Type },
  suara: { title: "Suara", desc: "Efek bunyi jawaban", icon: Volume2 },
  data: { title: "Data & Reset", desc: "Hapus progres", icon: Trash2 },
  tentang: { title: "Tentang", desc: "Versi app, bantuan", icon: Info },
};

const SECTION_ORDER: SettingsSection[] = [
  "profil",
  "tampilan",
  "aksara",
  "suara",
  "data",
  "tentang",
];

function MenuList({
  onSelect,
  summary,
}: {
  onSelect: (s: SettingsSection) => void;
  summary: Record<SettingsSection, string>;
}) {
  return (
    <div className="space-y-2">
      {SECTION_ORDER.map((key) => {
        const meta = SECTION_META[key];
        const Icon = meta.icon;
        const danger = key === "data";
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="flex w-full items-center gap-3 rounded-3xl bg-card px-4 py-3 text-left shadow-sm transition-transform active:scale-[0.99]"
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                danger ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-sm font-semibold", danger && "text-destructive")}>
                {meta.title}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{meta.desc}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">{summary[key]}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}

export function SettingsPage({ onBack }: { onBack: () => void }) {
  const { setTheme, theme: themeSetting, resolvedTheme } = useTheme();
  const [settings, setSettingsState] = React.useState(loadSettings);
  const [section, setSection] = React.useState<SettingsSection | null>(null);

  React.useEffect(() => {
    initSettings();
    setSettingsState(loadSettings());
    return subscribeSettings(() => setSettingsState(loadSettings()));
  }, []);

  // Radio mencerminkan setting ("system" tetap "system"); preview memakai hasil resolved.
  const theme: ThemeMode =
    themeSetting === "light" || themeSetting === "dark" ? themeSetting : "system";
  const preview: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  function pickTheme(next: ThemeMode) {
    if (next === "system") setTheme("system");
    else setTheme(next);
  }

  const themeLabel = THEME_OPTIONS.find((o) => o.value === theme)?.label ?? "Sistem";
  const summary: Record<SettingsSection, string> = {
    profil: "",
    tampilan: themeLabel,
    aksara: String(settings.wresastraFontSize),
    suara: settings.soundEnabled ? "Aktif" : "Mati",
    data: "",
    tentang: "v0.1.0",
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col md:max-w-2xl lg:max-w-5xl">
      <header className="flex items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={section ? () => setSection(null) : onBack}
          aria-label={section ? "Kembali ke daftar pengaturan" : "Kembali ke profil"}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card shadow-sm"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight md:text-[32px]">
          {section ? SECTION_META[section].title : "Pengaturan"}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 lg:[&>*]:mx-auto lg:[&>*]:w-full lg:[&>*]:max-w-3xl">
        {section === null && <MenuList onSelect={setSection} summary={summary} />}
        {section === "profil" && <ProfileSection />}
        {section === "tampilan" && (
          <ThemeSection theme={theme} preview={preview} pickTheme={pickTheme} />
        )}
        {section === "aksara" && <AksaraSection fontSize={settings.wresastraFontSize} />}
        {section === "suara" && <SoundSection enabled={settings.soundEnabled} />}
        {section === "data" && <DataSection />}
        {section === "tentang" && <AboutSection />}
      </div>
    </div>
  );
}

function ThemeSection({
  theme,
  preview,
  pickTheme,
}: {
  theme: ThemeMode;
  preview: "light" | "dark";
  pickTheme: (next: ThemeMode) => void;
}) {
  return (
    <section aria-labelledby="theme-heading" className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Tampilan
        </p>
        <h2 id="theme-heading" className="text-base font-bold tracking-tight">
          Tema
        </h2>
      </div>
      <div
        role="radiogroup"
        aria-label="Pilih tema"
        className="flex rounded-full bg-card p-1.5 shadow-sm"
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pickTheme(opt.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {opt.label}
            </button>
          );
        })}
      </div>
      <div
        aria-label="Pratinjau tema"
        className="overflow-hidden rounded-3xl border bg-card shadow-sm transition-colors duration-300"
      >
        <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground transition-colors duration-300">
          <Bedawang mood="senang" className="size-10 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Bedawang Nala</p>
            <p className="text-xs opacity-80">Pratinjau langsung tema {preview}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="font-balinese text-2xl leading-none text-primary transition-colors duration-300">
            ᬳᬦᬘᬭᬓ
          </span>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-cta">
            +10 XP
          </span>
        </div>
      </div>
      <p className="rounded-3xl bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-sm">
        Ikuti sistem artinya tampilan menyesuaikan pengaturan terang/gelap di perangkatmu secara
        otomatis.
      </p>
    </section>
  );
}

function AksaraSection({ fontSize }: { fontSize: number }) {
  return (
    <section aria-labelledby="font-heading" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Aksara
          </p>
          <h2 id="font-heading" className="text-base font-bold tracking-tight">
            Ukuran Aksara Wresastra
          </h2>
        </div>
        <Type className="size-4 text-muted-foreground" />
      </div>

      <div
        className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl bg-card px-4 py-6 text-center shadow-sm"
        data-fontsize={fontSize}
      >
        <span
          lang="ban"
          className="font-balinese leading-none transition-[font-size] duration-300"
          style={{ fontSize }}
          aria-label="Pratinjau aksara Wresastra"
        >
          {PREVIEW_GLYPH}
        </span>
        <span className="text-xs text-muted-foreground">hanacaraka · {fontSize}px</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Pilih ukuran font aksara"
        className="mt-3 grid grid-cols-3 gap-2"
      >
        {WRESASTRA_FONT_SIZES.map((size) => {
          const active = fontSize === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setWresastraFontSize(size)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-3xl border py-2.5 text-sm transition-colors",
                active
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="font-balinese leading-none" style={{ fontSize: size - 6 }}>
                ᬳ
              </span>
              {size}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Ukuran ganti hidup di layar pratinjau di atas. Tanpa tofu (karakter kotak), pakai Noto Sans
        Balinese.
      </p>
    </section>
  );
}

function SoundSection({ enabled }: { enabled: boolean }) {
  return (
    <section
      aria-labelledby="sound-heading"
      className="flex items-center justify-between rounded-3xl bg-card px-4 py-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted">
          {enabled ? (
            <Volume2 className="size-4 text-muted-foreground" />
          ) : (
            <VolumeX className="size-4 text-muted-foreground" />
          )}
        </span>
        <div>
          <p id="sound-heading" className="text-sm font-medium">
            Efek suara
          </p>
          <p className="text-xs text-muted-foreground">Bunyi saat jawab benar / salah</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => playPreview("success")}
          className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          Coba
        </button>
        <Swing checked={enabled} onChecked={setSoundEnabled} />
      </div>
    </section>
  );
}

function DataSection() {
  return (
    <section
      aria-labelledby="reset-heading"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-destructive/10">
          <RotateCcw className="size-4 text-destructive" />
        </span>
        <div className="flex-1">
          <h2 id="reset-heading" className="text-sm font-semibold">
            Reset progres
          </h2>
          <p className="text-xs text-muted-foreground">
            Hapus XP, hati, streak, modul selesai, dan tawaran lanjut kuis. Tema, ukuran aksara, dan
            suara tidak ikut terhapus.
          </p>
        </div>
      </div>
      <ResetConfirm
        trigger={
          <button
            type="button"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="size-4" />
            Reset sekarang
          </button>
        }
      />
    </section>
  );
}
function AboutSection() {
  const [open, setOpen] = React.useState<"bantuan" | "privasi" | "ketentuan" | null>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open !== null);

  const copy: Record<string, { title: string; body: string }> = {
    bantuan: {
      title: "Bantuan",
      body: "Butuh bantuan? Tanya Bedawang Nala di tab Guru, atau ulangi modul dari awal lewat pohon modul. Semua progres tersimpan otomatis di perangkat ini.",
    },
    privasi: {
      title: "Privasi",
      body: "CAKSARA menyimpan profil, XP, dan progres belajar hanya di perangkatmu (local storage). Tidak ada data pribadi yang dikirim tanpa persetujuanmu.",
    },
    ketentuan: {
      title: "Ketentuan",
      body: "Konten belajar aksara Bali untuk tujuan edukasi. Audio pelafalan saat ini memakai label Latin sementara; audio Bali asli di luar scope MVP.",
    },
  };

  return (
    <section aria-labelledby="tentang-heading" className="space-y-3">
      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Tentang
        </p>
        <h2 id="tentang-heading" className="text-base font-bold tracking-tight">
          CAKSARA · v0.1.0
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Web edukasi aksara Bali — pola Duo, rasa Caksara.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Audio pelafalan: subset terkurasi dari &ldquo;Balinese Text-to-Speech Dataset&rdquo;
          (Mendeley Data, CC BY 4.0) —{" "}
          <a
            href="https://data.mendeley.com/datasets/6syjwz24v5/2"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            data.mendeley.com/datasets/6syjwz24v5/2
          </a>
          . Selama belum terkurasi, soal dengar_pilih memakai badge Audio Latin (sementara); audio
          Bali asli di luar scope MVP.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Avatar IP oleh s1dashu (MIT) via ipaslogo.com —{" "}
          <a href="/assets/ip-as-logo-LICENSE" className="underline underline-offset-2">
            lihat lisensi
          </a>
          .
        </p>
      </div>
      {(
        [
          ["bantuan", "Bantuan"],
          ["privasi", "Privasi"],
          ["ketentuan", "Ketentuan"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setOpen(id)}
          className="flex w-full items-center gap-3 rounded-3xl bg-card px-4 py-3 text-left shadow-sm transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Info className="size-5" />
          </span>
          <span className="min-w-0 flex-1 text-sm font-semibold">{label}</span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>
      ))}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tentang-dialog-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(null);
            }}
            className="w-full max-w-sm animate-modal-in rounded-3xl border bg-card p-5 shadow-lg"
          >
            <h2 id="tentang-dialog-title" className="text-lg font-semibold">
              {copy[open].title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy[open].body}</p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              autoFocus
              className="mt-5 w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
  const previousFocus = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;
    const el = containerRef.current;
    if (!el) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const focusables = Array.from(
      el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((n) => !n.hasAttribute("disabled"));
    focusables[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [active, containerRef]);
}

function ResetConfirm({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function confirm() {
    resetAllProgress();
    setOpen(false);
    notifyProgressReset();
  }

  return (
    <>
      {React.isValidElement(trigger) &&
        React.cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, {
          onClick: () => setOpen(true),
        })}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            aria-describedby="reset-dialog-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm animate-modal-in rounded-3xl border bg-card p-5 shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <Bedawang mood="sedih" className="size-16" />
              <h2 id="reset-dialog-title" className="mt-3 text-lg font-semibold">
                Reset semua progres?
              </h2>
              <p id="reset-dialog-desc" className="mt-1 text-sm text-muted-foreground">
                Tindakan ini menghapus seluruh progresmu dan tidak bisa dibatalkan. Yakin mau
                lanjut?
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border bg-background px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirm}
                className="rounded-xl bg-destructive px-3 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Ya, reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
