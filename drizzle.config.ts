import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

function cleanDbUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let clean = url.trim();
  if (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1).trim();
  }
  if (clean.startsWith("DATABASE_DIRECT_URL=")) {
    clean = clean.replace(/^DATABASE_DIRECT_URL=/, "").trim();
  }
  if (clean.startsWith("DATABASE_URL=")) {
    clean = clean.replace(/^DATABASE_URL=/, "").trim();
  }
  return clean || undefined;
}

const connectionUrl =
  cleanDbUrl(process.env.DATABASE_DIRECT_URL) ||
  cleanDbUrl(process.env.DATABASE_URL);

if (!connectionUrl) {
  console.error(
    "\n❌ [drizzle.config.ts] Neither DATABASE_DIRECT_URL nor DATABASE_URL was found in process.env!\n" +
      "Please make sure your database connection string is set in Netlify environment variables with the 'Builds' scope enabled.\n"
  );
}

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl || "postgresql://placeholder/placeholder",
  },
  verbose: true,
  strict: true,
});
