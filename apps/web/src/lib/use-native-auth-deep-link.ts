import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * #100: dengarkan deep-link OAuth saat app hidup di WebView Capacitor.
 * Impor dinamis menjaga bundle web murni: `@capacitor/app` hanya
 * dimuat bila `window.Capacitor` ada (shell Android). Cold-start maupun
 * warm: `appUrlOpen` membawa `app.caksara.web://auth/callback?...` —
 * teruskan ke route `/auth/callback` yang menukar sesi. No-op di web.
 */
export function useNativeAuthDeepLink(): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // window.Capacitor disuntik shell native; tidak ada di tipe DOM lib.
    const withBridge = window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean };
    };
    if (!withBridge.Capacitor?.isNativePlatform?.()) return;
    let remove: (() => void) | undefined;
    let cancelled = false;
    // Modul @capacitor/app tidak ada di web; impor dinamis di cabang native
    // saja agar bundle web tidak menarik runtime Capacitor.
    void import("@capacitor/app")
      .then(({ App }) =>
        App.addListener("appUrlOpen", (event) => {
          const { url } = event;
          if (!url.startsWith("app.caksara.web://auth/callback")) return;
          const queryStart = url.indexOf("?");
          navigate(
            queryStart === -1 ? "/auth/callback" : `/auth/callback${url.slice(queryStart)}`,
            { replace: true },
          );
        }),
      )
      .then((handle) => {
        if (cancelled) {
          void handle.remove();
          return;
        }
        remove = () => {
          void handle.remove();
        };
      })
      .catch(() => {
        // Plugin App tidak ikut tersinkron: diam, web tetap jalan.
      });
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [navigate]);
}
