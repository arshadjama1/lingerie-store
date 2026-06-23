import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "server-only";

import { serverEnv } from "@/config/env.server";

import * as schema from "./schema";

// ── Application client (pooled) ───────────────────────────────────────
const pooledSql = postgres(serverEnv.DATABASE_URL, {
  prepare: false, // required for Supabase PgBouncer transaction mode
  max: 1, // correct for Vercel serverless (single-request invocations)
});

export const db = drizzle(pooledSql, { schema });

// ── Direct client (migrations + scripts only) ─────────────────────────
let _dbDirect: ReturnType<typeof drizzle> | undefined;

export function getDirectDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_dbDirect) {
    const directSql = postgres(serverEnv.DATABASE_DIRECT_URL, { max: 1 });
    _dbDirect = drizzle(directSql, { schema });
  }
  return _dbDirect as ReturnType<typeof drizzle<typeof schema>>;
}

export * from "./schema";
