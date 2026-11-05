import type { CapacitorConfig } from "@capacitor/cli";

// #100 + ADR-0014: Capacitor wrap apps/web untuk ANDROID saja. Platform
// Apple out of scope: tanpa Xcode, tanpa Tauri. webDir menunjuk keluaran
// statis `bun run build` dari react-router (`build/client`), bukan
// `dist` — devDeps Capacitor hanya hidup di root, bukan bundle web.
const config: CapacitorConfig = {
  appId: "app.caksara.web",
  appName: "Caksara",
  webDir: "apps/web/build/client",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#faf1e2",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: false,
      splashImmersive: false,
    },
  },
};

export default config;
