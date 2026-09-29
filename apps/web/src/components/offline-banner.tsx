import { useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";

import { fetchKbEntries } from "../features/kb/kb-source";
import { pendingSessionCount, syncOnBackOnline } from "../features/quiz/quiz-pending-sync";
import { notifyBackOnline, notifyPendingSynced } from "../lib/notify";
import { useOnlineStatus } from "../lib/use-online-status";
import { WRESASTRA_IDS } from "../lib/profile-store";

/** Banner lunak saat perangkat offline + tombol coba lagi. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      notifyBackOnline();
      // V10: koneksi pulih → kirim buffer lokal lalu segarkan KB cache.
      void syncOnBackOnline({
        knownIds: WRESASTRA_IDS,
        refreshKbCache: () => fetchKbEntries({ readCache: () => null }),
      }).then((res) => {
        if (res.sent > 0) notifyPendingSynced(res.sent);
      });
    }
  }, [online]);
  if (online) return null;
  const pending = pendingSessionCount();
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 pt-3 md:max-w-2xl lg:max-w-5xl"
    >
      <div className="flex w-full items-center gap-3 rounded-3xl bg-destructive/10 px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
          <WifiOff className="size-4" />
        </span>
        <p className="min-w-0 flex-1 text-xs leading-relaxed">
          <span className="block font-bold">Kamu sedang offline</span>
          <span className="text-muted-foreground">
            {pending > 0
              ? `${pending} hasil tersimpan di perangkat, terkirim otomatis saat online.`
              : "Materi tersimpan tetap bisa dibaca. Sambungkan internet lalu coba lagi."}
          </span>
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-semibold transition-transform active:scale-95"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}
