import { Download } from "lucide-react";

import { UNDUH_ARTIFACTS, UNDUH_RELEASES_URL } from "./unduh-data";

/**
 * Halaman Unduh (nav "Unduh", Pencil IpWol).
 * Kartu horizontal ala Pencil: ikon OS + teks + tombol Unduh.
 * Tanpa kartu iPhone (iOS out of scope, ADR-0014).
 * Banner sinkron progres ala Pencil (tint primary-soft).
 */
export function UnduhPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-6 md:max-w-2xl lg:max-w-4xl lg:pt-10">
      <h1 className="text-[40px] font-extrabold tracking-tight">
        Pilih perangkat. Langsung belajar.
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Satu aplikasi aksara Bali yang ringan dan gratis. Belajar, kuis, dan Guru Virtual — di HP
        maupun laptop.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {UNDUH_ARTIFACTS.map((a) => (
          <section
            key={a.id}
            aria-label={`Unduh untuk ${a.title}`}
            className="flex flex-row items-center gap-4 rounded-[20px] border-2 border-border bg-card p-6"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <a.icon className="size-7 text-primary" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="text-lg font-extrabold">{a.title}</h2>
              <p className="text-xs font-bold tracking-wide text-muted-foreground">{a.spec}</p>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
              <p className="text-xs text-muted-foreground">Berkas: {a.filePattern}</p>
            </div>
            <a
              href={UNDUH_RELEASES_URL}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Download className="size-4" aria-hidden />
              Unduh
            </a>
          </section>
        ))}
      </div>

      <p className="mt-6 rounded-2xl bg-primary/10 px-5 py-4 text-sm font-bold text-foreground">
        Progresmu ikut ke mana-mana. Masuk biar XP dan streak tersinkron di semua perangkat.
      </p>
    </div>
  );
}
