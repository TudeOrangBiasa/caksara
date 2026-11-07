import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Feather,
  Gamepad2,
  Layers,
  LibraryBig,
  Mail,
  MessageCircle,
  MessageCircleQuestion,
  Mic,
  Phone,
  Search,
  Star,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { cn } from "@caksara/ui/lib/utils";

import { Bedawang } from "../../components/bedawang";
import { usePrefersReducedMotion } from "../../lib/use-prefers-reduced-motion";
import type { NavTab } from "../../components/nav-tabs";
import { LANDING_CONTACTS, LANDING_TESTIMONIES } from "./landing-data";

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
    <div
      className={cn(
        "rounded-2xl border-2 bg-card transition-colors lg:flex lg:flex-col lg:gap-3.5 lg:[row-gap:14px]",
        open
          ? "border-primary shadow-[0_4px_0_0_var(--primary)] lg:shadow-none"
          : "border-border shadow-[0_4px_0_0_var(--border)] lg:shadow-none",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left lg:gap-4 lg:px-[26px] lg:py-[22px] lg:[padding:22px_26px]"
      >
        <span className="text-[15px] font-extrabold text-foreground lg:leading-[20px]">{q}</span>
        {open ? (
          <ChevronUp className="size-[18px] shrink-0 text-primary" />
        ) : (
          <ChevronDown className="size-[18px] shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <p className="px-6 pb-6 text-sm leading-relaxed text-foreground/75 lg:px-[26px] lg:pb-6 lg:leading-[22px] lg:[padding:0_26px_22px]">
          {a}
        </p>
      )}
    </div>
  );
}

function PhoneMock({ reduceMotion }: { reduceMotion: boolean }) {
  const floatCls = (dur: string) =>
    reduceMotion ? undefined : `animate-[bounce_${dur}_infinite_alternate]`;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] lg:aspect-auto lg:h-[520px] lg:max-w-[520px]">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-8 ring-primary/15 lg:size-[420px]"
      />
      <div className="absolute left-1/2 top-1/2 w-[46%] max-w-60 -translate-x-1/2 -translate-y-1/2 rotate-6 rounded-[36px] bg-foreground p-3 shadow-lg lg:w-[240px] lg:max-w-none lg:rotate-6 lg:rounded-[36px]">
        <div className="flex flex-col items-center gap-3 rounded-[26px] bg-card p-4 lg:gap-3 lg:p-4">
          <div className="flex w-full items-center gap-1.5">
            <span className="text-xs text-muted-foreground" aria-hidden>
              ✕
            </span>
            <div className="h-2 flex-1 rounded-full bg-muted" aria-hidden />
            <span className="text-xs text-destructive" aria-hidden>
              ♥
            </span>
          </div>
          <p className="text-[11px] font-extrabold tracking-[0.6px] text-muted-foreground">
            TEBAK AKSARA
          </p>
          <p className="text-center text-[19px] font-extrabold text-foreground">Aksara apa ini?</p>
          <div className="w-full rounded-2xl border-[2.5px] border-border bg-card px-[18px] py-4 text-center shadow-[0_12px_28px_var(--color-border)]">
            <span
              lang="ban"
              className="font-balinese text-[38px] font-bold leading-none text-foreground"
            >
              ᬩ
            </span>
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <span className="flex items-center gap-2.5 rounded-[14px] border-2 border-cta bg-cta/10 px-[15px] py-[13px] text-[15px] shadow-[0_10px_22px_var(--color-border)]">
              <span className="font-bold text-cta">A</span>
              <span className="font-semibold text-foreground">Ba</span>
            </span>
            <span className="flex items-center gap-2.5 rounded-[14px] border-2 border-border bg-card px-[15px] py-[13px] text-[15px] shadow-[0_10px_22px_var(--color-border)]">
              <span className="font-semibold text-muted-foreground">B</span>
              <span className="font-normal text-foreground">Da</span>
            </span>
            <span className="w-full rounded-full bg-cta px-3 py-[14px] text-center text-sm font-bold text-primary-foreground">
              PERIKSA
            </span>
          </div>
        </div>
      </div>
      {[
        { Icon: Mic, cls: "left-[6%] top-[12%]", iconCls: "text-primary" },
        { Icon: BookOpen, cls: "right-[6%] top-[8%]", iconCls: "text-accent" },
        { Icon: Feather, cls: "right-[8%] bottom-[10%]", iconCls: "text-success" },
        { Icon: MessageCircle, cls: "left-[4%] bottom-[16%]", iconCls: "text-cta" },
      ].map(({ Icon, cls, iconCls }, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "absolute flex size-14 items-center justify-center rounded-[20px] border-2 border-b-[5px] border-primary/20 bg-card shadow-sm",
            cls,
            floatCls(i % 2 ? "5s" : "6s"),
          )}
        >
          <Icon className={cn("size-6", iconCls)} />
        </span>
      ))}
      <span aria-hidden className="absolute left-[36%] top-[10%] text-[28px] text-accent">
        ✦
      </span>
      <span aria-hidden className="absolute right-[26%] top-[52%] text-[36px] text-accent">
        ✦
      </span>
      <span aria-hidden className="absolute left-[40%] top-[54%] text-base text-accent">
        ✦
      </span>
      <Bedawang
        mood="semangat"
        className={cn(
          "absolute bottom-[6%] left-[16%] size-20 lg:bottom-[10%] lg:left-[8%] lg:size-40",
          floatCls("7s"),
        )}
      />
    </div>
  );
}
function DemoKuis() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[20px] border-2 border-border bg-card p-5 shadow-[0_4px_0_0_var(--border)]">
      <p className="text-[15px] font-semibold text-foreground">Susun menjadi sapaan swastiastu</p>
      <div className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-2">
        <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
          swa
        </span>
        <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
          stu
        </span>
      </div>
      <div className="flex gap-2">
        {["swa", "s", "ti"].map((t) => (
          <span
            key={t}
            className="rounded-lg border-2 border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function DemoChat({ onOpenKb }: { onOpenKb?: () => void }) {
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-[20px] border-2 border-border bg-card p-5 shadow-[0_4px_0_0_var(--border)]">
      <div className="flex items-center gap-2">
        <Bedawang mood="senang" className="size-8 shrink-0" />
        <div className="flex flex-col">
          <p className="text-[11px] font-extrabold tracking-[0.8px] text-muted-foreground">
            GURU VIRTUAL
          </p>
          <p className="text-base font-extrabold text-foreground">Bedawang Nala</p>
        </div>
        <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
          Online · jawab pakai sumber
        </span>
      </div>
      <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
        Jelaskan hari raya Nyepi
      </p>
      <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm leading-relaxed text-foreground">
        <p className="font-bold">Nyepi</p>
        <p className="text-muted-foreground">
          Tahun Baru Saka. Sehari penuh hening: tidak menyalakan api, tidak bekerja, tidak
          bepergian, dan tidak bersenang-senang.
        </p>
      </div>
      <div className="flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-background px-3 py-2.5">
        <p className="text-[11px] font-extrabold tracking-[0.8px] text-muted-foreground">
          SUMBER RUJUKAN
        </p>
        <p className="text-xs font-medium text-foreground">Parasali · Tradisi dan hari raya</p>
        <p className="text-xs font-medium text-foreground">
          Balai Bahasa Provinsi Bali · Istilah keagamaan
        </p>
        {onOpenKb ? (
          <button
            type="button"
            onClick={onOpenKb}
            className="mt-1 w-fit text-xs font-bold text-primary transition-colors hover:text-cta"
          >
            Buka di Basis Pengetahuan →
          </button>
        ) : (
          <p className="mt-1 w-fit text-xs font-bold text-primary">Buka di Basis Pengetahuan →</p>
        )}
      </div>
    </div>
  );
}

function DemoKamus() {
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-[20px] border-2 border-border bg-card p-5 shadow-[0_4px_0_0_var(--border)]">
      <div className="flex items-center gap-2 rounded-full bg-muted px-3.5 py-2.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">Cari: suksma...</p>
      </div>
      {[
        { g: "ᬫᬢᬸᬃᬲᬸᬓ᭄ᬱ᭄ᬫ", l: "matur suksma" },
        { g: "ᬒᬁ ᬲ᭄ᬯᬲ᭄ᬢᬶᬬᬲ᭄ᬢᬸ", l: "om swastiastu" },
        { g: "ᬭᬳᬚᭂᬂ", l: "rahajeng" },
      ].map((e) => (
        <div key={e.l} className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5">
          <span lang="ban" className="font-balinese text-2xl leading-none text-primary">
            {e.g}
          </span>
          <span className="text-sm font-semibold text-foreground">{e.l}</span>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">+ 24 entri lainnya dan masih banyak lagi</p>
    </div>
  );
}

function ZigzagRow({
  title,
  desc,
  art,
  artFirst,
  reduceMotion,
  action,
}: {
  title: string;
  desc: string;
  art: React.ReactNode;
  artFirst: boolean;
  reduceMotion: boolean;
  action?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reduceMotion);
  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center gap-10 lg:flex-row lg:gap-10 lg:[column-gap:40px]",
        !reduceMotion && "transition-all duration-700 ease-out",
        !reduceMotion && !visible && "translate-y-8 opacity-0",
      )}
    >
      <div className={cn("flex flex-1 flex-col gap-3", artFirst && "lg:order-2")}>
        <h3 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
          {title}
        </h3>
        <p className="text-lg leading-relaxed text-muted-foreground lg:text-[21px] lg:leading-[34px]">
          {desc}
        </p>
        {action}
      </div>
      <div className={cn("w-full max-w-[460px] flex-col items-center", artFirst && "lg:order-1")}>
        {art}
      </div>
    </div>
  );
}

const APPROACH = [
  {
    icon: Layers,
    title: "Terstruktur",
    desc: "Alur 4 modul dari nol sampai mahir tradisi.",
    tilt: "lg:rotate-3",
    dark: false,
  },
  {
    icon: Gamepad2,
    title: "Menyenangkan",
    desc: "Kuis seru dan interaktif bikin ketagihan.",
    tilt: "lg:-rotate-2",
    dark: true,
  },
  {
    icon: LibraryBig,
    title: "Kamus Lengkap",
    desc: "Lebih dari 27 entri budaya dan aksara.",
    tilt: "lg:-rotate-2",
    dark: false,
  },
  {
    icon: MessageCircleQuestion,
    title: "Pendamping",
    desc: "Guru virtual siap membantumu kapan saja.",
    tilt: "lg:rotate-2",
    dark: true,
  },
];

export function LandingHome({
  onStart,
  onOpenKb,
  onOpenTab,
}: {
  onStart: () => void;
  onOpenKb: () => void;
  onOpenTab: (t: NavTab) => void;
}) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const reduceMotion = usePrefersReducedMotion();
  const floatCls = (dur: string, reverse = false) =>
    reduceMotion
      ? undefined
      : `animate-[bounce_${dur}_infinite_alternate${reverse ? "-reverse" : ""}]`;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-12 pb-16 md:max-w-2xl lg:max-w-7xl lg:px-8">
      {/* HERO */}
      <section
        data-parity="hero"
        className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-12"
      >
        <div className="flex flex-col gap-7 text-center lg:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-5xl lg:leading-[53px] lg:tracking-[-1.6px]">
            Cara paling seru belajar Aksara Bali!
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground lg:text-[17px] lg:leading-[28px]">
            Pelajaran singkat yang seru, dapat poin dan naik level sambil belajar komunikasi nyata
            sehari-hari.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start lg:gap-7">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-cta px-16 py-4 text-[15px] font-bold text-white shadow-[0_10px_20px_0_var(--color-cta-edge)] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none lg:px-16 lg:py-4 lg:text-[15px]"
            >
              MULAI BELAJAR
            </button>
            <button
              type="button"
              onClick={onOpenKb}
              aria-label="Jelajahi kamus budaya"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 border-cta/40 bg-card px-[54px] py-[14px] text-[13px] font-bold text-cta transition-all hover:bg-cta/10"
            >
              JELAJAHI KB
            </button>
          </div>
        </div>

        <PhoneMock reduceMotion={reduceMotion} />
      </section>

      {/* WHY US */}
      <section
        data-parity="pendekatan"
        className="mt-12 bg-background px-2 pt-12 pb-14 lg:px-8 lg:pt-12 lg:pb-14"
      >
        <h2 className="text-center text-[30px] font-extrabold text-cta lg:leading-[36px]">
          Pendekatan Kami
        </h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-6 md:flex-row md:flex-wrap lg:flex-nowrap lg:mt-8 lg:gap-6">
          {APPROACH.map((w) => (
            <div
              key={w.title}
              className={cn(
                "flex h-[184px] w-full max-w-57 flex-col gap-2 rounded-[20px] border-2 p-[18px] transition-transform hover:-translate-y-1 lg:h-[184px] lg:w-[228px] lg:max-w-none lg:gap-2 lg:rounded-[20px] lg:border-2 lg:p-[18px] lg:[row-gap:8px]",
                w.tilt,
                w.dark
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--primary)] lg:shadow-none"
                  : "border-border bg-card shadow-[0_4px_0_0_var(--border)] lg:shadow-none",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  w.dark ? "bg-white/20" : "bg-primary/10",
                )}
              >
                <w.icon className={cn("size-5", w.dark ? "text-white" : "text-primary")} />
              </span>
              <h3
                className={cn(
                  "text-sm font-extrabold lg:text-sm lg:leading-[18px]",
                  w.dark ? undefined : "text-foreground",
                )}
              >
                {w.title}
              </h3>
              <p
                className={cn(
                  "text-xs leading-relaxed lg:leading-[18px]",
                  w.dark ? "text-primary-foreground/80" : "text-foreground/80",
                )}
              >
                {w.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-full bg-cta px-11 py-3.5 text-sm font-extrabold text-primary-foreground shadow-duo transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            Mulai Perjalananmu
          </button>
        </div>
      </section>

      {/* ZIGZAG */}
      <section data-parity="zigzag" className="mt-12 px-2 pt-14 pb-16 lg:px-8 lg:pt-24 lg:pb-16">
        <h2 className="text-center text-[40px] font-extrabold tracking-[-1px] text-cta lg:leading-[48px]">
          Kenapa Belajar di Sini?
        </h2>
        <div className="mt-16 flex flex-col gap-16 lg:mt-24 lg:gap-32 lg:[row-gap:128px]">
          <ZigzagRow
            title="Kuis Seru & Menantang"
            desc="Belajar aksara Bali jadi lebih menyenangkan! Susun kata, kumpulkan XP, dan taklukkan bentuk gantungan yang rumit. Jaga streak harianmu dan lihat progresmu setiap hari!"
            art={<DemoKuis />}
            artFirst={false}
            reduceMotion={reduceMotion}
          />
          <ZigzagRow
            title="Guru Virtual Cerdas"
            desc="Punya pertanyaan? Tanya kapan saja! Guru virtual siap memberikan penjelasan praktis lengkap dengan contoh penggunaan sehari-hari, aktif 24/7."
            art={<DemoChat onOpenKb={onOpenKb} />}
            artFirst
            reduceMotion={reduceMotion}
          />
          <ZigzagRow
            title="Kamus Budaya"
            desc="Bukan sekadar kamus biasa. Pelajari konteks kata, waktu pengucapan, hingga gestur yang tepat dari penutur asli Bali agar kamu makin percaya diri."
            art={<DemoKamus />}
            artFirst={false}
            reduceMotion={reduceMotion}
            action={
              <button
                type="button"
                onClick={onOpenKb}
                className="mt-2 inline-flex w-fit items-center gap-2 text-[15px] font-bold text-primary transition-colors hover:text-cta"
              >
                Jelajahi Kamus Budaya <ArrowRight className="size-4" />
              </button>
            }
          />
        </div>
      </section>

      {/* TESTIMONI */}
      <section data-parity="testimoni" className="mt-12 px-2 pt-14 pb-16 lg:px-8 lg:pt-32 lg:pb-16">
        <h2 className="text-center text-[40px] font-extrabold tracking-[-1px] text-foreground lg:text-[44px] lg:leading-[52px]">
          Dipercaya 1200+ pelajar Indonesia
        </h2>
        <p className="mt-3.5 text-center text-base text-muted-foreground lg:mt-3.5 lg:leading-[24px]">
          Nilai 5.0 dari ribuan ulasan, gabung dan rasakan mudahnya belajar aksara Bali.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:mt-14 lg:gap-6 lg:[column-gap:24px]">
          {LANDING_TESTIMONIES.map((t, i) => (
            <figure
              key={t.id}
              className={
                i === 1
                  ? "relative rounded-3xl border-2 border-cta bg-cta/10 px-7 pt-14 pb-6 text-center shadow-sm lg:rounded-3xl lg:border-2 lg:bg-cta/10 lg:px-7 lg:pt-14 lg:pb-6 lg:shadow-none"
                  : "relative rounded-3xl border border-border/50 bg-card px-7 pt-14 pb-6 text-center shadow-sm lg:rounded-3xl lg:border lg:px-7 lg:pt-14 lg:pb-6 lg:shadow-none"
              }
            >
              <img
                src={t.avatar}
                alt=""
                className="absolute -top-8 left-1/2 size-16 -translate-x-1/2 rounded-full border-2 border-card shadow-md lg:size-16"
              />
              <figcaption className="text-[15px] font-extrabold text-foreground lg:leading-[20px]">
                {t.name}
              </figcaption>
              <p className="text-[13px] text-muted-foreground lg:leading-[18px]">{t.role}</p>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 lg:mt-2.5">
                <span className="flex gap-0.5" aria-label="Rating 5 dari 5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-[15px] fill-accent text-accent" aria-hidden />
                  ))}
                </span>
                <span className="text-[13px] font-bold text-foreground">5.0</span>
              </p>
              <blockquote className="mt-2.5 text-sm leading-relaxed text-foreground/85 lg:leading-[22px]">
                {t.quote}
              </blockquote>
            </figure>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex gap-2" aria-hidden>
            <span className="h-2 w-6 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-muted" />
            <span className="size-2 rounded-full bg-muted" />
          </div>
          <div className="flex gap-3">
            <span className="flex size-12 items-center justify-center rounded-full border border-border bg-card">
              <ChevronLeft className="size-5 text-muted-foreground" />
            </span>
            <span className="flex size-12 items-center justify-center rounded-full bg-foreground">
              <ChevronRight className="size-5 text-background" />
            </span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        data-parity="faq"
        className="mt-12 flex flex-col gap-8 bg-background px-2 pt-16 lg:flex-row lg:gap-[90px] lg:px-8"
      >
        <div className="flex flex-col gap-5 lg:w-[340px] lg:shrink-0">
          <h2 className="text-[40px] leading-[46px] font-extrabold tracking-[-1px] text-cta">
            Sering Ditanyakan
          </h2>
          <p className="text-[15px] leading-[25px] text-muted-foreground">
            Masih ragu? Jawaban singkat untuk hal yang paling sering ditanyakan saat memulai belajar
            bersama CAKSARA.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-4">
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

      {/* OVERLAPPING CTA & FOOTER */}
      <div data-parity="cta-footer" className="relative mt-32 w-full lg:mt-32">
        {/* CTA - Scattered Avatars Design */}
        <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:max-w-none lg:px-8 lg:[padding:0_32px]">
          <section className="relative overflow-hidden rounded-[3rem] bg-card border border-border/50 py-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] lg:rounded-[48px] lg:p-[84px_64px] lg:mx-auto lg:w-[976px] lg:shadow-none">
            {/* Scattered Floating Avatars (Desktop only) */}
            <div className="pointer-events-none absolute inset-0 hidden md:block">
              <img
                src="/assets/Userpics/PNG/Circle/3DDD-1.png"
                alt=""
                className={cn(
                  "absolute left-[8%] top-[25%] size-20 rounded-full shadow-md transition-transform duration-700 hover:scale-110",
                  floatCls("6s"),
                )}
              />
              <img
                src="/assets/Userpics/PNG/Circle/Afterclap-1.png"
                alt=""
                className={cn(
                  "absolute left-[22%] top-[55%] size-12 rounded-full shadow-sm",
                  floatCls("5s", true),
                )}
              />
              <img
                src="/assets/Userpics/PNG/Circle/OSLO-1.png"
                alt=""
                className={cn(
                  "absolute left-[12%] bottom-[15%] size-16 rounded-full shadow-md",
                  floatCls("7s"),
                )}
              />
              <img
                src="/assets/Userpics/PNG/Circle/Cranks-1.png"
                alt=""
                className={cn(
                  "absolute left-[4%] top-[65%] size-10 rounded-full shadow-sm",
                  floatCls("4s", true),
                )}
              />
              <img
                src="/assets/Userpics/PNG/Circle/Guacamole-1.png"
                alt=""
                className={cn(
                  "absolute right-[8%] top-[20%] size-16 rounded-full shadow-md",
                  floatCls("6s", true),
                )}
              />
              <img
                src="/assets/Userpics/PNG/Circle/3DDD-2.png"
                alt=""
                className={cn(
                  "absolute right-[24%] top-[40%] size-10 rounded-full shadow-sm",
                  floatCls("5s"),
                )}
              />
              <img
                src="/assets/Userpics/PNG/Circle/Juicy-1.png"
                alt=""
                className={cn(
                  "absolute right-[14%] bottom-[18%] size-20 rounded-full shadow-md",
                  floatCls("7s", true),
                )}
              />
              <img
                src="/assets/Userpics/PNG/Circle/Cranks-2.png"
                alt=""
                className={cn(
                  "absolute right-[5%] bottom-[45%] size-12 rounded-full shadow-sm",
                  floatCls("4s"),
                )}
              />
            </div>

            {/* Center Content */}
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-[22px] px-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground lg:w-[520px] lg:text-5xl lg:leading-[55px] lg:tracking-[-1.5px]">
                Siap Untuk Mulai Belajar?
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground lg:w-[540px]">
                Bergabung bersama pengguna lainnya dan mulai langkah pertamamu mempelajari aksara
                Bali dengan mudah.
              </p>
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center rounded-full bg-cta px-[34px] py-[17px] text-[15px] font-bold text-primary-foreground shadow-duo transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
              >
                Mulai Belajar Sekarang
              </button>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="relative z-10 -mt-24 rounded-[3rem] bg-secondary/30 px-8 pb-12 pt-40 sm:px-12 lg:-mt-40 lg:rounded-[48px] lg:px-16 lg:pb-11 lg:pt-[170px] lg:[padding:170px_64px_44px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr] lg:gap-12 lg:[column-gap:48px]">
            {/* Column 1: Brand */}
            <div className="max-w-sm">
              <p className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-xl bg-primary/10 font-balinese text-2xl leading-none text-primary"
                >
                  ᬳ
                </span>
                CAKSARA
              </p>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Platform web edukasi interaktif untuk mempelajari aksara dan budaya kuno Bali dengan
                metode modern, langkah demi langkah, dan gratis untuk semua kalangan.
              </p>
            </div>

            {/* Column 2: Belajar */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-foreground">Belajar</h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTab("belajar")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Daftar Modul
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTab("kb")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Kamus Budaya
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTab("guru")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Tanya Guru Virtual
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onStart}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Latihan Kuis
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Akun & Bantuan */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-foreground">Akun & Bantuan</h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTab("profil")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Profil Siswa
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTab("beranda")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTab("guru")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Pusat Bantuan
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenTab("profil")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Pengaturan
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Kontak Kami */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-foreground">Kontak Kami</h3>
              <ul className="flex flex-col gap-3">
                {LANDING_CONTACTS.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.href}
                      className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        {c.id === "telp" ? (
                          <Phone className="size-4 text-primary" />
                        ) : (
                          <Mail className="size-4 text-primary" />
                        )}
                      </span>
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/50 pt-8 sm:flex-row lg:mt-12 lg:gap-6 lg:pt-8">
            <p className="text-sm font-medium text-muted-foreground lg:text-[13px] lg:leading-[18px]">
              © 2026 CAKSARA. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex gap-6">
              <span className="text-[13px] font-medium text-muted-foreground">
                Kebijakan Privasi
              </span>
              <span className="text-[13px] font-medium text-muted-foreground">
                Syarat Penggunaan
              </span>
              <span className="text-[13px] font-medium text-muted-foreground">Peta Situs</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
