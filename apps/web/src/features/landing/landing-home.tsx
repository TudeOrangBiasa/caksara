import {
  ArrowRight,
  ChevronDown,
  Gift,
  HeartHandshake,
  Layers,
  Play,
  Quote,
  Send,
  Sparkles,
  Star,
  Swords,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { avatarClass } from "../../components/profile-avatar";
import { defaultAvatarUri } from "../../lib/default-avatar";
import type { NavTab } from "../../components/nav-tabs";

const SOURCES = ["Parasali", "Balai Bahasa Provinsi Bali", "Unicode U+1B00–U+1B7F"];

const FEATURES: {
  tab: NavTab;
  visual: React.ReactNode;
  title: string;
  desc: string;
}[] = [
  {
    tab: "belajar",
    visual: <span className="font-balinese text-6xl leading-none text-primary">ᬳ</span>,
    title: "Modul Interaktif",
    desc: "4 modul berurutan: sapaan, wresastra, bahasa, dan tradisi.",
  },
  {
    tab: "belajar",
    visual: <Swords className="size-14 text-primary" />,
    title: "Kuis & Hati",
    desc: "Uji pemahaman lewat kuis. Salah mengurangi hati, benar menambah XP.",
  },
  {
    tab: "guru",
    visual: <Bedawang mood="senang" className="size-16" />,
    title: "Guru Virtual",
    desc: "Tanya apa saja soal aksara & budaya, selalu dengan sumber rujukan.",
  },
  {
    tab: "kb",
    visual: <span className="font-balinese text-6xl leading-none text-primary">ᬓ</span>,
    title: "KB Entri",
    desc: "Kamus 27 entri aksara, kosakata, dan budaya yang bisa ditelusuri.",
  },
];

const WHY_US: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: <Gift className="size-5" />,
    title: "100% Gratis",
    desc: "Semua materi terbuka, tanpa paywall.",
  },
  {
    icon: <Zap className="size-5" />,
    title: "Tanpa Daftar",
    desc: "Profil anonim langsung jadi, privasi aman.",
  },
  {
    icon: <Layers className="size-5" />,
    title: "Terstruktur",
    desc: "Alur 4 modul dari nol sampai tradisi.",
  },
  {
    icon: <HeartHandshake className="size-5" />,
    title: "Ada Pendamping",
    desc: "Bedawang Nala menemani tiap langkah.",
  },
];

/* Nama & kutipan di bawah ini placeholder untuk demo, ganti dengan testimoni asli. */
const REVIEWS = {
  featured: {
    name: "Made Wirawan",
    role: "Guru Bahasa Bali · Denpasar",
    color: "terakota" as const,
    text: "Akhirnya ada cara mengajar aksara yang bikin murid betah. Modulnya runtut, kuisnya bikin nagih, dan Guru Virtual selalu bisa jawab pertanyaan anak-anak lengkap dengan sumbernya. Nilai harian kelas saya naik sejak pakai CAKSARA.",
  },
  items: [
    {
      name: "Ni Luh Sari",
      role: "Mahasiswa",
      color: "emas" as const,
      text: "Belajar wresastra otodidak selalu gagal, di sini 10 menit sehari langsung nempel.",
    },
    {
      name: "Putu Eka",
      role: "Pelajar SMA",
      color: "daun" as const,
      text: "Kuis hatinya bikin deg-degan tapi seru. Streak saya sudah 12 hari!",
    },
    {
      name: "Wayan Kerta",
      role: "Pekerja",
      color: "laut" as const,
      text: "Pulang kerja sempatkan buka satu materi. Bedawang Nala lucu, Betul-betul menemani.",
    },
  ],
};

function Stars() {
  return (
    <p className="flex gap-0.5" aria-label="Rating 5 dari 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-3.5 fill-accent text-accent" />
      ))}
    </p>
  );
}

const FAQS = [
  {
    q: "Apakah CAKSARA gratis?",
    a: "Ya, seluruh materi, kuis, dan Guru Virtual gratis tanpa akun.",
  },
  {
    q: "Perlu daftar akun?",
    a: "Tidak. Profil anonim dibuat otomatis dan tersimpan di perangkatmu.",
  },
  {
    q: "Apa itu aksara wresastra?",
    a: "18 aksara dasar penulisan bahasa Bali, dipelajari di Modul 2 langkah demi langkah.",
  },
  {
    q: "Bagaimana sistem hati bekerja?",
    a: "Tiap jawaban salah mengurangi 1 hati. Hati penuh lagi keesokan harinya, jadi belajar tetap santai.",
  },
  {
    q: "Dari mana materinya?",
    a: "Disusun dari Parasali, Balai Bahasa Provinsi Bali, dan standar Unicode, lalu diringkas jadi modul.",
  },
];

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold">{q}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  );
}

export function LandingHome({
  onStart,
  onOpenKb,
  onOpenGuru,
  onOpenTab,
}: {
  onStart: () => void;
  onOpenKb: () => void;
  onOpenGuru: () => void;
  onOpenTab: (t: NavTab) => void;
}) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  function subscribeNews() {
    if (!/.+@.+\..+/.test(email.trim())) {
      setEmailMsg("Isi alamat email yang valid ya.");
      return;
    }
    setEmail("");
    setEmailMsg("Siap! Kabar aksara akan mampir ke emailmu. (demo)");
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-10 pb-10 md:max-w-2xl lg:max-w-5xl">
      {/* HERO */}
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> Web Edukasi Aksara Bali
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-bold tracking-tight lg:text-5xl">
            Pelajari Aksara Bali, Pelan tapi Pasti.
          </h1>
          <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground lg:text-base">
            Dari sapaan sehari-hari sampai filosofi wresastra. Modul interaktif, kuis seru, dan guru
            virtual yang selalu siap membantu.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              <Play className="size-4 fill-current" /> Mulai Belajar
            </button>
            <button
              type="button"
              onClick={onOpenKb}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-card px-6 text-sm font-semibold transition-transform active:scale-95"
            >
              Jelajahi KB <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
        <div className="rounded-3xl bg-primary p-8 text-center text-primary-foreground">
          <p className="font-balinese text-7xl leading-none">ᬳᬓ᭄ᬱᬭ</p>
          <p className="mt-4 text-sm font-semibold text-white/85">aksara · tulisan · warisan</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              ["18", "Aksara"],
              ["4", "Modul"],
              ["27", "Entri KB"],
            ].map(([num, label]) => (
              <div key={label} className="rounded-2xl bg-white/15 px-2 py-3">
                <p className="text-2xl font-bold">{num}</p>
                <p className="text-[11px] text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUMBER */}
      <section className="mt-12 text-center">
        <p className="text-xs text-muted-foreground">Disusun dari sumber resmi</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {SOURCES.map((s) => (
            <span key={s} className="text-sm font-bold text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section className="mt-14">
        <h2 className="text-center text-2xl font-bold tracking-tight">Kenapa Belajar di Sini?</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Semua yang kamu butuhkan untuk menguasai aksara & budaya Bali.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <button
              key={f.title}
              type="button"
              onClick={() => onOpenTab(f.tab)}
              className="rounded-3xl bg-card p-5 text-left transition-transform active:scale-[0.99]"
            >
              <span className="flex items-center justify-center rounded-2xl bg-primary/10 py-8">
                {f.visual}
              </span>
              <p className="mt-4 text-base font-bold">{f.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Buka <ArrowRight className="size-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="mt-14">
        <h2 className="text-center text-2xl font-bold tracking-tight">Kenapa CAKSARA?</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {WHY_US.map((w) => (
            <div key={w.title} className="rounded-3xl bg-card p-5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                {w.icon}
              </span>
              <p className="mt-3 text-sm font-bold">{w.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEW */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight">Kata Mereka</h2>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <figure className="flex flex-col rounded-3xl bg-primary p-6 text-primary-foreground lg:p-8">
            <Quote className="size-7 text-white/60" />
            <blockquote className="mt-3 flex-1 text-base leading-relaxed lg:text-lg">
              “{REVIEWS.featured.text}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-full bg-white/20 text-base font-bold"
              >
                {REVIEWS.featured.name.charAt(0)}
              </span>
              <span>
                <span className="block text-sm font-bold">{REVIEWS.featured.name}</span>
                <span className="block text-xs text-white/75">{REVIEWS.featured.role}</span>
              </span>
            </figcaption>
          </figure>
          <div className="grid gap-3">
            {REVIEWS.items.map((r) => (
              <figure key={r.name} className="rounded-3xl bg-card p-5">
                <Stars />
                <blockquote className="mt-2 text-sm leading-relaxed">“{r.text}”</blockquote>
                <figcaption className="mt-3 flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-9 items-center justify-center overflow-hidden rounded-full",
                      avatarClass({ kind: "color", value: r.color }),
                    )}
                  >
                    <img
                      src={defaultAvatarUri(r.name)}
                      alt=""
                      className="size-[92%] rounded-full object-cover"
                    />
                  </span>
                  <span>
                    <span className="block text-xs font-bold">{r.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-14 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sering Ditanyakan</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Masih ragu? Jawaban singkat untuk hal yang paling sering ditanyakan.
          </p>
        </div>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <FaqItem
              key={f.q}
              q={f.q}
              a={f.a}
              open={faqOpen === i}
              onToggle={() => setFaqOpen(faqOpen === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 grid items-center gap-6 rounded-3xl bg-primary p-8 text-primary-foreground lg:grid-cols-2 lg:p-12">
        <div>
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Siap Memulai Petualangan Aksara?
          </h2>
          <p className="mt-2 max-w-[44ch] text-sm text-white/85">
            Lima menit sehari cukup. Bedawang Nala akan menemanimu dari aksara pertama.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-primary transition-transform active:scale-95"
            >
              <Play className="size-4 fill-current" /> Mulai Sekarang
            </button>
            <button
              type="button"
              onClick={onOpenGuru}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white/20 px-6 text-sm font-semibold text-white transition-transform active:scale-95"
            >
              Tanya Guru Dulu
            </button>
          </div>
        </div>
        <div aria-hidden className="relative hidden items-center justify-center lg:flex">
          <div className="rounded-3xl bg-white/15 px-12 py-10">
            <p className="font-balinese text-8xl leading-none">ᬳ</p>
          </div>
          <div className="absolute -right-2 -bottom-4 rounded-2xl bg-card px-4 py-3 text-card-foreground shadow-lg">
            <p className="text-xs font-bold">+10 XP</p>
            <p className="text-[11px] text-muted-foreground">tiap jawaban benar</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-14 border-t border-border/60 pt-8 pb-4">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="flex items-center gap-2 text-base font-bold tracking-tight">
              <span aria-hidden className="font-balinese text-2xl leading-none text-primary">
                ᬳ
              </span>
              CAKSARA
            </p>
            <p className="mt-2 max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
              Web edukasi aksara & budaya Bali. Belajar pelan-pelan, sedikit demi sedikit.
            </p>
            <form
              className="mt-4 flex max-w-sm items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                subscribeNews();
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailMsg) setEmailMsg(null);
                }}
                placeholder="Email untuk kabar aksara"
                aria-label="Email untuk kabar aksara"
                className="h-11 w-full rounded-full bg-card px-4 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
              >
                <Send className="size-4" /> Kirim
              </button>
            </form>
            {emailMsg && <p className="mt-2 text-xs text-muted-foreground">{emailMsg}</p>}
          </div>
          <nav aria-label="Tautan" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Belajar
              </p>
              {(
                [
                  ["belajar", "Modul"],
                  ["kb", "KB Entri"],
                  ["guru", "Guru Virtual"],
                ] as [NavTab, string][]
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onOpenTab(tab)}
                  className="text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Akun
              </p>
              {(
                [
                  ["profil", "Profil"],
                  ["beranda", "Beranda"],
                ] as [NavTab, string][]
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onOpenTab(tab)}
                  className="text-left text-sm text-muted-foreground hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Bantuan
              </p>
              <button
                type="button"
                onClick={() => onOpenGuru()}
                className="text-left text-sm text-muted-foreground hover:text-foreground"
              >
                Tanya Guru
              </button>
              <button
                type="button"
                onClick={() => onOpenTab("kb")}
                className="text-left text-sm text-muted-foreground hover:text-foreground"
              >
                Cari di KB
              </button>
            </div>
          </nav>
        </div>
        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          CAKSARA · Aksara Bali untuk semua.
        </p>
      </footer>
    </div>
  );
}
