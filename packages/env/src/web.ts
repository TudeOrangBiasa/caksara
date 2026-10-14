import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    // Opsional: aplikasi sengaja jalan penuh secara lokal (localStorage)
    // tanpa backend bila env belum diset (getSupabase() → null + warn DEV).
    // Validasi bentuk bila ADA (url valid, key non-kosong), bukan required.
    VITE_SUPABASE_URL: z.string().url().optional(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: (import.meta as unknown as { env: Record<string, string | undefined> }).env,
  emptyStringAsUndefined: true,
});
