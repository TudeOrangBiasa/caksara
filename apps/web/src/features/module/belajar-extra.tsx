import { BookMarked, Lightbulb } from "lucide-react";

import { WRESASTRA_AKSARA } from "./aksara-data";

export function BannerBudaya() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Tentang kurikulum
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">
            Aksara Bali, jejak warisan leluhur
          </h2>
          <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-white/80">
            Di sini kamu bakal belajar aksara, bahasa, dan budaya Bali pelan-pelan. Mulai dari
            sapaan sehari-hari sampai filosofi di balik tiap aksara. Tenang, enggak buru-buru kok.
          </p>
        </div>
        <span aria-hidden className="font-balinese text-5xl leading-none text-white">
          ᬩᬮᬶ
        </span>
      </div>
    </div>
  );
}

export function AksaraGrid() {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Aksara Wresastra</h2>
          <p className="text-xs text-muted-foreground">18 aksara dasar yang bakal kamu kuasai</p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {WRESASTRA_AKSARA.length} aksara
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 md:grid-cols-9">
        {WRESASTRA_AKSARA.map((a) => (
          <div
            key={a.id}
            className="flex aspect-square flex-col items-center justify-center rounded-3xl bg-card text-center"
          >
            <span className="font-balinese text-xl leading-none text-primary">{a.glyph}</span>
            <span className="mt-1 text-[10px] text-muted-foreground">{a.latin}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SumberList() {
  const sumbers = [
    { nama: "Parasali", ket: "Paguyuban sastra & aksara Bali" },
    { nama: "Balai Bahasa Provinsi Bali", ket: "Pembakuan bahasa daerah" },
    { nama: "Unicode Consortium", ket: "Standar aksara U+1B00-U+1B7F" },
  ];
  return (
    <section className="rounded-3xl bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <BookMarked className="size-4 text-primary" />
        Sumber & rujukan materi
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Konten belajar disusun dari sumber resmi agar akurat dan bisa dipercaya.
      </p>
      <ul className="mt-3 space-y-2">
        {sumbers.map((s) => (
          <li key={s.nama} className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium">{s.nama}</span>
            <span className="text-right text-muted-foreground">{s.ket}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TipsBelajar() {
  const tips = [
    "Mulai dari 5 aksara pertama, dulu. Sisanya nanti ikut jalan.",
    "Dengar pelafalannya sambil lihat bentuknya, biar nempel di ingatan.",
    "Salah itu hal biasa. Ulangi pelan-pelan, enggak usah dikejar.",
  ];
  return (
    <section className="rounded-3xl bg-card p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="size-4 text-accent" />
        Tips belajar
      </p>
      <ul className="mt-3 space-y-2">
        {tips.map((tip) => (
          <li
            key={tip}
            className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
          >
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}
