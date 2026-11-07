import { Download } from "lucide-react";

import { UNDUH_ARTIFACTS } from "./unduh-data";

/**
 * Halaman Unduh (nav "Unduh", Pencil IpWol).
 * Matriks SSOT di unduh-data.ts: Android .apk, Windows .exe, Linux
 * .AppImage. Tanpa kartu iPhone (iOS out of scope, ADR-0014).
 * Tombol mengarah ke GitHub Releases latest; label jujur "Segera
 * hadir" sampai CI rilis (PR3) mengunggah aset pertama.
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
            {a.href ? (
              <a
                href={a.href}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
              >
                <Download className="size-4" aria-hidden />
                Unduh {a.filePattern}
              </a>
            ) : (
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-bold text-muted-foreground">
                Segera hadir
              </p>
            )}
          </section>
        ))}
      </div>

      <p className="mt-6 rounded-[20px] border border-border/60 bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        Progresmu ikut ke mana-mana. Masuk biar XP dan streak tersinkron di semua perangkat.
      </p>
    </div>
  );
}
