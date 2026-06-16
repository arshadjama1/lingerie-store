import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_DIRECT_URL) {
  throw new Error(
    "DATABASE_DIRECT_URL is required for migrations.\n" +
      "Use the direct connection URL (port 5432), NOT the pooler.\n" +
      "Supabase Dashboard → Settings → Database → Connection string → URI"
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_DIRECT_URL,
  },
  verbose: true,
  strict: true,
});
