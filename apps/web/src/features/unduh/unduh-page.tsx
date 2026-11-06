import { Check, MonitorSmartphone } from "lucide-react";

const LINUX_FILES = ["Debian/Ubuntu (.deb)", "AppImage"] as const;

/**
 * Halaman Unduh (nav "Unduh", Pencil IpWol).
 * Jujur soal ketersediaan: belum ada artefak publish (tidak ada CI yang
 * mengunggah AppImage/deb ke /unduh/*, target electron-builder cuma
 * AppImage+deb), jadi Linux pun statusnya "build manual dari repo",
 * bukan tautan unduh. Android (Capacitor) dan iOS belum ada artefaknya.
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

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section
          aria-label="Unduh untuk Linux"
          className="flex flex-col gap-3 rounded-[20px] border-2 border-border bg-card p-6"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <MonitorSmartphone className="size-6 text-primary" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-extrabold">Linux</h2>
            <p className="text-xs font-bold tracking-wide text-muted-foreground">LINUX • 64-BIT</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Build resmi untuk Linux. Pilih paket sesuai distro kamu.
          </p>
          <ul className="mt-1 flex flex-col gap-2">
            {LINUX_FILES.map((label) => (
              <li
                key={label}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-bold text-muted-foreground"
              >
                {label} — build manual dari repo
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Bangun sendiri dari repo: build paket desktop lalu via electron-builder. Belum ada kanal
            unduh resmi.
          </p>
        </section>

        <div className="flex flex-col gap-4">
          <section
            aria-label="Unduh untuk Android"
            className="flex flex-col gap-3 rounded-[20px] border-2 border-border bg-card p-6"
          >
            <h2 className="text-lg font-extrabold">Android</h2>
            <p className="text-xs font-bold tracking-wide text-muted-foreground">
              ANDROID 8.0+ • APK
            </p>
            <p className="text-sm text-muted-foreground">
              Aplikasi resmi Caksara. Belajar offline, sinkron otomatis saat online.
            </p>
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-bold text-muted-foreground">
              Segera hadir
            </p>
          </section>

          <section
            aria-label="Unduh untuk iPhone"
            className="flex flex-col gap-3 rounded-[20px] border-2 border-border bg-card p-6"
          >
            <h2 className="text-lg font-extrabold">iPhone</h2>
            <p className="text-sm text-muted-foreground">
              Versi iOS belum tersedia. Sementara itu web selulernya sudah penuh dan gratis.
            </p>
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-4 py-2 text-sm font-bold text-success">
              <Check className="size-4" aria-hidden />
              Web seluler siap dipakai
            </p>
          </section>
        </div>
      </div>

      <p className="mt-6 rounded-[20px] border border-border/60 bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        Progresmu ikut ke mana-mana. Masuk biar XP dan streak tersinkron di semua perangkat.
      </p>
    </div>
  );
}
