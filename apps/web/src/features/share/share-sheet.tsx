import { Check, Download, Share2, X } from "lucide-react";
import * as React from "react";

import { cn } from "@caksara/ui/lib/utils";

import { userProfileSchema } from "../../lib/zod/profile";
import type { UserProfile } from "../../lib/zod/profile";
import { exportPng, renderAchievementCardWithAvatar, pickTidbit } from "./achievement-card";
import type { AchievementCardData } from "./achievement-card";
import { loadProfile } from "../../lib/profile-store";

interface ShareSheetProps {
  modulSelesai: number;
  modulTotal: number;
  onClose: () => void;
}

export function ShareSheet({ modulSelesai, modulTotal, onClose }: ShareSheetProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "ok" | "downloading">("idle");

  React.useEffect(() => {
    async function build() {
      try {
        const fallbackProfile: UserProfile = userProfileSchema.parse({
          id: "tamu",
          isAnon: true,
          name: "Teman Belajar",
          xp: 0,
          streak: 0,
          hearts: 5,
        });
        const profile = loadProfile() ?? fallbackProfile;
        await document.fonts.load('48px "Noto Sans Balinese"');
        await document.fonts.ready;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cardData: AchievementCardData = {
          name: profile.name,
          avatar: profile.avatar,
          xp: profile.xp,
          streak: profile.streak,
          hearts: profile.hearts,
          mastery: profile.mastery,
          modulSelesai,
          modulTotal,
          tidbit: pickTidbit(),
        };
        await renderAchievementCardWithAvatar(canvas, cardData);
        const url = exportPng(canvas);
        if (!url) throw new Error("export png gagal");
        setImgUrl(url);
        setError(null);
      } catch {
        setError("Gagal membuat kartu. Coba lagi ya.");
      }
    }
    build();
  }, [modulSelesai, modulTotal]);

  async function download() {
    const canvas = canvasRef.current;
    const url = imgUrl ?? (canvas ? exportPng(canvas) : null);
    if (!url) return;
    if (!imgUrl) setImgUrl(url);
    setStatus("downloading");
    const a = document.createElement("a");
    const name = (loadProfile()?.name ?? "caksara").toLowerCase().replaceAll(/\s+/gu, "-");
    a.href = url;
    a.download = `caksara-${name}-prestasi.png`;
    document.body.append(a);
    a.click();
    a.remove();
    setStatus("ok");
  }

  async function share() {
    if (imgUrl && typeof navigator.canShare === "function") {
      try {
        const blob = await (await fetch(imgUrl)).blob();
        const file = new File([blob], "caksara-prestasi.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Prestasi CAKSARA",
            text: "Lihat kartu prestasiku belajar Aksara Bali di CAKSARA!",
          });
          setStatus("ok");
          return;
        }
      } catch {
        /* pengguna batal / berkas ditolak: fallback ke download */
      }
    }
    download();
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b bg-card/60 px-4 py-3">
        <h1 className="text-base font-semibold">Kartu Prestasi</h1>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-3xl border shadow-xl animate-card-pop">
          {error ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-destructive">
              {error}
            </div>
          ) : (
            imgUrl && (
              <img
                src={imgUrl}
                alt="Kartu prestasi CAKSARA berisi XP, streak, dan mastery 18 aksara Wresastra"
                className="h-full w-full object-cover"
              />
            )
          )}
        </div>

        <div className="mx-auto mt-6 max-w-[340px] space-y-2">
          <button
            type="button"
            onClick={share}
            disabled={!imgUrl}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {status === "ok" ? <Check className="size-4" /> : <Share2 className="size-4" />}
            {status === "ok" ? "Tersimpan / Terbagi" : "Bagikan"}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!imgUrl}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-60",
              "border-border bg-card hover:bg-muted",
            )}
          >
            <Download className="size-4" />
            Unduh PNG 1080×1350
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
