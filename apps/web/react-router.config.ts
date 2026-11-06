import type { Config } from "@react-router/dev/config";

// Shell desktop (#101) memuat file lokal hasil build SPA; deploy Vercel tetap SSR.
// Aktif hanya lewat `bun run desktop:web` (CAKSARA_SPA=1), default tidak berubah.
const isDesktopSpa = process.env.CAKSARA_SPA === "1";

export default {
  // Adopt vercelPreset() once @vercel/react-router supports RR8 (vercel/vercel#16730)
  appDirectory: "src",
  ...(isDesktopSpa ? { ssr: false } : {}),
} satisfies Config;
