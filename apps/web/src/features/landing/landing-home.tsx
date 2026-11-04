import {
  BookOpen,
  Gamepad2,
  LibraryBig,
  MessageCircleQuestion,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";

import { cn } from "@caksara/ui/lib/utils";

import type { NavTab } from "../../components/nav-tabs";

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
    <div className="rounded-3xl border border-border/50 bg-card shadow-sm transition-colors hover:border-primary/50">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left lg:px-8 lg:py-6"
      >
        <span className="text-base font-bold text-foreground lg:text-lg">{q}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180 text-primary",
          )}
        />
      </button>
      {open && (
        <p className="px-6 pb-6 text-base leading-relaxed text-muted-foreground lg:px-8 lg:pb-8 lg:text-lg">
          {a}
        </p>
      )}
    </div>
  );
}

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

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-12 pb-16 md:max-w-2xl lg:max-w-7xl lg:px-8">
      {/* HERO */}
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[4rem] lg:leading-[1.1]">
            Pelajari Aksara Bali, Pelan tapi Pasti.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground lg:text-lg">
            Temukan kekayaan warisan budaya Bali melalui modul interaktif dan kuis seru. Dari sapaan
            sehari-hari hingga wresastra yang bermakna.
          </p>
          <div className="mt-10 flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              Mulai Belajar
            </button>
          </div>
        </div>

        {/* Hero Interactive Hanacaraka - Clean, Consistent, No Gradients */}
        <div className="relative hidden w-full lg:flex items-center justify-center">
          <div className="w-full max-w-lg rounded-[2.5rem] border border-border/60 bg-secondary/30 p-6 shadow-sm">
            <div className="grid grid-cols-6 gap-3">
              {[
                { bal: "ᬳ", lat: "Ha" },
                { bal: "ᬦ", lat: "Na" },
                { bal: "ᬘ", lat: "Ca" },
                { bal: "ᬭ", lat: "Ra" },
                { bal: "ᬓ", lat: "Ka" },
                { bal: "ᬤ", lat: "Da" },
                { bal: "ᬢ", lat: "Ta" },
                { bal: "ᬲ", lat: "Sa" },
                { bal: "ᬯ", lat: "Wa" },
                { bal: "ᬮ", lat: "La" },
                { bal: "ᬫ", lat: "Ma" },
                { bal: "ᬕ", lat: "Ga" },
                { bal: "ᬩ", lat: "Ba" },
                { bal: "ᬗ", lat: "Nga" },
                { bal: "ᬧ", lat: "Pa" },
                { bal: "ᬚ", lat: "Ja" },
                { bal: "ᬬ", lat: "Ya" },
                { bal: "ᬜ", lat: "Nya" },
              ].map((aksara, i) => (
                <div
                  key={i}
                  className="group relative flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:shadow-md"
                >
                  <span className="absolute font-balinese text-3xl font-bold text-foreground transition-all duration-200 group-hover:scale-75 group-hover:opacity-0 lg:text-4xl">
                    {aksara.bal}
                  </span>
                  <span className="absolute text-lg font-bold text-primary-foreground opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 lg:text-xl">
                    {aksara.lat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="mt-32 border-t border-border/60 pt-20">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight lg:text-[2.5rem]">Pendekatan Kami</h2>
          <button
            onClick={onStart}
            className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted active:scale-95"
          >
            Jelajahi modul
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <BookOpen className="size-8 text-primary" />,
              title: "Terstruktur",
              desc: "Alur 4 modul dari nol sampai mahir tradisi.",
            },
            {
              icon: <Gamepad2 className="size-8 text-warning" />,
              title: "Menyenangkan",
              desc: "Belajar lewat kuis seru dan interaktif.",
            },
            {
              icon: <LibraryBig className="size-8 text-success" />,
              title: "Kamus Lengkap",
              desc: "Lebih dari 27+ entri budaya dan aksara.",
            },
            {
              icon: <MessageCircleQuestion className="size-8 text-destructive" />,
              title: "Pendamping",
              desc: "Guru virtual siap membantu kapan saja.",
            },
          ].map((w, i) => (
            <div
              key={i}
              className="group flex flex-col rounded-[2rem] bg-card p-8 shadow-sm ring-1 ring-border/50 transition-all hover:bg-muted/50 hover:-translate-y-1"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border/30">
                {w.icon}
              </div>
              <h3 className="text-xl font-bold">{w.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-32 border-t border-border/60 pt-20">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight lg:text-[2.5rem]">
            Kenapa Belajar di Sini?
          </h2>
          <button
            onClick={onOpenKb}
            className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted active:scale-95"
          >
            Lihat semua fitur
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="group flex flex-col justify-center rounded-[2.5rem] bg-primary/5 p-10 lg:col-span-7 lg:p-14">
            <Sparkles className="mb-6 size-10 text-primary" />
            <h3 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              Modul Interaktif yang Runtut
            </h3>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Belajar tidak melompat-lompat. Mulai dari pengenalan wresastra hingga mahir, dirancang
              khusus agar mudah dipahami oleh siapa saja, kapan saja.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            {[
              {
                icon: <Gamepad2 className="size-6 text-warning" />,
                title: "Kuis Seru & Menantang",
                desc: "Uji kemampuan membaca dan menyusun aksara dengan gamifikasi.",
              },
              {
                icon: <MessageCircleQuestion className="size-6 text-primary" />,
                title: "Guru Virtual Cerdas",
                desc: "Tanya apa saja seputar aksara dan budaya, kapan saja.",
              },
              {
                icon: <LibraryBig className="size-6 text-success" />,
                title: "Kamus Budaya",
                desc: "Eksplorasi entri kebudayaan dan filosofi Bali terdalam.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group flex flex-1 items-center gap-6 rounded-[2rem] bg-card p-6 shadow-sm ring-1 ring-border/50 transition-all hover:bg-muted/50"
              >
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border/30">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-32 grid gap-8 border-t border-border/60 pt-16 lg:grid-cols-[350px_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Sering Ditanyakan</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
            Masih ragu? Jawaban singkat untuk hal yang paling sering ditanyakan saat memulai belajar
            bersama CAKSARA.
          </p>
        </div>
        <div className="space-y-3">
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
      <div className="relative mt-32 w-full">
        {/* CTA - Scattered Avatars Design */}
        <div className="relative z-20 mx-auto w-full max-w-5xl px-4 sm:px-6">
          <section className="relative overflow-hidden rounded-[3rem] bg-card border border-border/50 py-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] lg:py-28">
            {/* Scattered Floating Avatars (Desktop only) */}
            <div className="pointer-events-none absolute inset-0 hidden md:block">
              {/* Kiri */}
              <img
                src="/assets/Userpics/PNG/Circle/3DDD-1.png"
                alt=""
                className="absolute left-[8%] top-[25%] size-20 rounded-full shadow-md transition-transform duration-700 hover:scale-110 animate-[bounce_6s_infinite_alternate]"
              />
              <img
                src="/assets/Userpics/PNG/Circle/Afterclap-1.png"
                alt=""
                className="absolute left-[22%] top-[55%] size-12 rounded-full shadow-sm animate-[bounce_5s_infinite_alternate-reverse]"
              />
              <img
                src="/assets/Userpics/PNG/Circle/OSLO-1.png"
                alt=""
                className="absolute left-[12%] bottom-[15%] size-16 rounded-full shadow-md animate-[bounce_7s_infinite_alternate]"
              />
              <img
                src="/assets/Userpics/PNG/Circle/Cranks-1.png"
                alt=""
                className="absolute left-[4%] top-[65%] size-10 rounded-full shadow-sm animate-[bounce_4s_infinite_alternate-reverse]"
              />

              {/* Kanan */}
              <img
                src="/assets/Userpics/PNG/Circle/Guacamole-1.png"
                alt=""
                className="absolute right-[8%] top-[20%] size-16 rounded-full shadow-md animate-[bounce_6s_infinite_alternate-reverse]"
              />
              <img
                src="/assets/Userpics/PNG/Circle/3DDD-2.png"
                alt=""
                className="absolute right-[24%] top-[40%] size-10 rounded-full shadow-sm animate-[bounce_5s_infinite_alternate]"
              />
              <img
                src="/assets/Userpics/PNG/Circle/Juicy-1.png"
                alt=""
                className="absolute right-[14%] bottom-[18%] size-20 rounded-full shadow-md animate-[bounce_7s_infinite_alternate-reverse]"
              />
              <img
                src="/assets/Userpics/PNG/Circle/Cranks-2.png"
                alt=""
                className="absolute right-[5%] bottom-[45%] size-12 rounded-full shadow-sm animate-[bounce_4s_infinite_alternate]"
              />
            </div>

            {/* Center Content */}
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-[4rem] lg:leading-tight">
                Siap Untuk Mulai Belajar?
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
                Bergabung bersama pengguna lainnya dan mulai langkah pertamamu mempelajari aksara
                Bali dengan mudah.
              </p>
              <button
                onClick={onStart}
                className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-lg font-bold text-primary-foreground shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 lg:h-16 lg:text-xl"
              >
                Mulai Belajar Sekarang
              </button>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="relative z-10 -mt-24 rounded-[3rem] bg-secondary/30 px-8 pb-12 pt-40 sm:px-12 lg:-mt-40 lg:px-20 lg:pt-64">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr] lg:gap-12">
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
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/50 pt-8 sm:flex-row">
            <p className="text-sm font-medium text-muted-foreground">
              © 2026 CAKSARA. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
