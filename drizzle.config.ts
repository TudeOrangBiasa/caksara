import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing — set in .env or Vercel env");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./supabase/schema.ts",
  out: "./supabase/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
