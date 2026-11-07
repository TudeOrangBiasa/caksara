import { Download } from "lucide-react";

import { UNDUH_ARTIFACTS, UNDUH_RELEASES_URL } from "./unduh-data";

/**
 * Halaman Unduh (nav "Unduh", Pencil IpWol).
 * Matriks SSOT di unduh-data.ts: Android .apk, Windows .exe, Linux
 * .AppImage. Tanpa kartu iPhone (iOS out of scope, ADR-0014).
 * Tiap kartu tombol Unduh ke GitHub Releases latest + nama berkas
 * jujur di bawahnya; artefak dari builder lokal (package:local).
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
            className="flex flex-col gap-3 rounded-[20px] border-2 border-border bg-card p-6"
          >
            <div>
              <h2 className="text-lg font-extrabold">{a.title}</h2>
              <p className="text-xs font-bold tracking-wide text-muted-foreground">{a.spec}</p>
            </div>
            <p className="text-sm text-muted-foreground">{a.desc}</p>
            <a
              href={UNDUH_RELEASES_URL}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Download className="size-4" aria-hidden />
              Unduh
            </a>
            <p className="text-xs text-muted-foreground">Berkas: {a.filePattern}</p>
          </section>
        ))}
      </div>

      <p className="mt-6 rounded-[20px] border border-border/60 bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        Progresmu ikut ke mana-mana. Masuk biar XP dan streak tersinkron di semua perangkat.
      </p>
    </div>
  );
}
