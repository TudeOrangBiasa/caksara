import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@caksara/ui/lib/utils";

import type { NavTab } from "../../components/nav-tabs";
import { ArtGuru, ArtLontar, ArtPath, ArtQuiz } from "./approach-art";

/* Nama & kutipan di bawah ini placeholder untuk demo, ganti dengan testimoni asli. */

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
    <div className="rounded-2xl bg-card shadow-sm">
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
    <div className="mx-auto w-full max-w-lg px-4 pt-12 pb-16 md:max-w-3xl lg:max-w-[1400px] lg:px-12">
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
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              Mulai Belajar
            </button>
            <button
              type="button"
              onClick={onOpenKb}
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-card ring-1 ring-border px-8 text-base font-bold text-foreground transition-all hover:bg-muted active:scale-95"
            >
              Jelajahi KB
            </button>
          </div>
        </div>

        {/* Hero Masonry Right Side */}
        <div className="relative hidden h-[600px] w-full grid-cols-[1fr_0.8fr] gap-4 lg:grid">
          <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-muted shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"
              alt="Balinese Temple Gate"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="grid h-full grid-rows-2 gap-4">
            <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-muted shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80"
                alt="Bali Rice Terraces"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-muted shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1557939403-1760a0e47505?auto=format&fit=crop&w=600&q=80"
                alt="Balinese Dancer"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
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
              art: <ArtPath />,
              title: "Terstruktur",
              desc: "Alur 4 modul dari nol sampai tradisi.",
            },
            {
              art: <ArtQuiz />,
              title: "Menyenangkan",
              desc: "Belajar lewat kuis seru dan interaktif.",
            },
            { art: <ArtLontar />, title: "Kamus Lengkap", desc: "Lebih dari 27+ entri budaya." },
            {
              art: <ArtGuru />,
              title: "Pendamping",
              desc: "Guru virtual siap membantu kapan saja.",
            },
          ].map((w, i) => (
            <div
              key={i}
              className="group flex flex-col overflow-hidden rounded-[2rem] bg-transparent"
            >
              <div className="mb-4 h-64 w-full overflow-hidden rounded-[2rem] shadow-sm ring-1 ring-border/50 transition-transform duration-700 group-hover:scale-[1.02]">
                {w.art}
              </div>
              <h3 className="text-lg font-bold">{w.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
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
          <div className="group relative flex flex-col justify-end overflow-hidden rounded-[2.5rem] bg-muted shadow-sm lg:col-span-7 lg:min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80"
              alt="Modul Interaktif"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 p-8 text-white">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary/80">
                Edukasi & Budaya
              </p>
              <h3 className="text-2xl font-bold">Modul Interaktif yang Runtut</h3>
              <p className="mt-2 max-w-lg text-base text-white/80">
                Belajar tidak melompat-lompat. Mulai dari pengenalan wresastra hingga mahir,
                dirancang khusus agar mudah dipahami.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            {[
              {
                img: "https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=300&q=80",
                title: "Kuis Seru & Menantang",
                desc: "Uji kemampuan membaca dan menyusun aksara dengan gamifikasi.",
              },
              {
                img: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=300&q=80",
                title: "Guru Virtual Cerdas",
                desc: "Tanya apa saja seputar aksara dan budaya, kapan saja.",
              },
              {
                img: "https://images.unsplash.com/photo-1604999335501-1e96a2d9c10f?auto=format&fit=crop&w=300&q=80",
                title: "Kamus Budaya",
                desc: "Eksplorasi entri kebudayaan dan filosofi Bali terdalam.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group flex flex-1 items-center gap-6 rounded-[2rem] bg-card p-4 pr-6 shadow-sm ring-1 ring-border/50 transition-all hover:bg-muted/50"
              >
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[1.5rem] bg-muted">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Fitur {i + 2}
                  </p>
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEW */}
      <section className="mt-32 border-t border-border/60 pt-20">
        <h2 className="mb-12 text-3xl font-bold tracking-tight lg:text-[2.5rem]">Kisah Pengguna</h2>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-base font-bold text-muted-foreground">
                BA
              </div>
              <div>
                <p className="font-bold text-lg">Bli Agung</p>
                <p className="text-sm text-muted-foreground">Siswa SMA</p>
              </div>
            </div>
            <h3 className="mb-4 text-2xl font-bold">Cara Baru Menikmati Budaya</h3>
            <p className="text-lg leading-relaxed text-muted-foreground">
              "Akhirnya ada cara mengajar aksara yang bikin murid betah. Modulnya runtut, kuisnya
              bikin nagih, dan Guru Virtual selalu bisa jawab pertanyaan anak-anak lengkap dengan
              sumbernya."
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="h-64 w-full overflow-hidden rounded-[2.5rem] bg-muted shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80"
                alt="Bali Review Visual"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col rounded-[2rem] bg-card p-6 shadow-sm ring-1 ring-border/50">
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  "Awalnya mikir aksara itu susah, tapi kuisnya bikin berasa main game..."
                </p>
                <p className="font-bold text-sm">Ayu Saraswati</p>
                <p className="text-xs text-muted-foreground">Mahasiswa</p>
              </div>
              <div className="flex flex-col rounded-[2rem] bg-card p-6 shadow-sm ring-1 ring-border/50">
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  "Pulang kerja sempatkan buka satu materi. Sangat membantu."
                </p>
                <p className="font-bold text-sm">Bapak Wayan</p>
                <p className="text-xs text-muted-foreground">Pekerja</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-32 flex flex-col items-center justify-center rounded-[3rem] bg-secondary/30 px-6 py-24 text-center shadow-inner lg:px-12 lg:py-32">
        <h2 className="text-3xl font-bold tracking-tight lg:text-[3rem]">Terus Terinspirasi</h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
          Dapatkan tips belajar aksara, cerita budaya, dan update modul baru langsung ke kotak
          masukmu.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            subscribeNews();
          }}
          className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailMsg) setEmailMsg(null);
            }}
            placeholder="Masukkan email..."
            aria-label="Email"
            className="h-14 w-full flex-1 rounded-full bg-card px-6 text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border transition-all focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-primary px-8 font-bold text-primary-foreground transition-transform active:scale-95"
          >
            Berlangganan
          </button>
        </form>
        {emailMsg && <p className="mt-6 text-sm font-medium text-primary">{emailMsg}</p>}
      </section>

      {/* FAQ */}
      <section className="mt-24 grid gap-8 border-t border-border/60 pt-16 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sering Ditanyakan</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Masih ragu? Jawaban singkat untuk hal yang paling sering ditanyakan saat memulai
            belajar.
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

      {/* FOOTER */}
      <footer className="mt-24 border-t border-border/60 pt-12 pb-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-24">
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
              Web edukasi aksara & budaya Bali. Dirancang untuk membuat belajar aksara kuno menjadi
              modern, pelan-pelan, sedikit demi sedikit.
            </p>
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
