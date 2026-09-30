import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: (import.meta as unknown as { env: Record<string, string | undefined> }).env,
  emptyStringAsUndefined: true,
});
