import { BookMarked, Lightbulb } from "lucide-react";

import { WRESASTRA_AKSARA } from "./aksara-data";

export function BannerBudaya() {
  return (
    <div className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[1.25rem] p-6">
      <img
        src="/assets/bali_penjor_2d_1788968300643.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-transparent" />

      <div className="relative z-10 flex flex-col items-start justify-end">
        <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-white">
          Warisan Leluhur Bali
        </h2>
        <p className="mt-1.5 max-w-[40ch] text-[13px] font-medium leading-relaxed text-white/80">
          Di sini kamu bakal belajar aksara, bahasa, dan budaya Bali pelan-pelan. Tenang, enggak
          usah buru-buru kok!
        </p>
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
      <div className="grid grid-cols-6 gap-1.5">
        {WRESASTRA_AKSARA.map((a) => (
          <div
            key={a.id}
            className="flex aspect-square flex-col items-center justify-center rounded-[10px] bg-secondary text-center"
          >
            <span className="font-balinese text-lg leading-none text-foreground">{a.glyph}</span>
            <span className="mt-0.5 text-[9px] text-muted-foreground">{a.latin}</span>
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
    <section className="rounded-[1.25rem] bg-card p-6 shadow-sm ring-1 ring-border">
      <p className="flex items-center gap-2 text-[13px] font-bold">
        <BookMarked className="size-4 text-primary" />
        Sumber & rujukan materi
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Konten belajar disusun dari sumber resmi agar akurat dan bisa dipercaya.
      </p>
      <ul className="mt-3 space-y-2">
        {sumbers.map((s) => (
          <li key={s.nama} className="flex items-baseline justify-between gap-3 text-[11px]">
            <span className="font-semibold">{s.nama}</span>
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
    <section className="rounded-[1.25rem] bg-card p-6 shadow-sm ring-1 ring-border">
      <p className="flex items-center gap-2 text-[13px] font-bold">
        <Lightbulb className="size-4 text-primary" />
        Tips belajar
      </p>
      <ul className="mt-3 space-y-2">
        {tips.map((tip) => (
          <li
            key={tip}
            className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground"
          >
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}
