import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "server-only";

import { serverEnv } from "@/config/env.server";

import * as schema from "./schema";

/**
 * Ensure we connect via Supabase Transaction Mode Pooler (port 6543).
 * If DATABASE_URL is set to pooler.supabase.com with port 5432 (Session Mode),
 * automatically route to port 6543 to avoid connection exhaustion in serverless environments.
 */
function getPoolerUrl(url: string): string {
  if (url.includes("pooler.supabase.com:5432")) {
    console.warn(
      "[db] Warning: DATABASE_URL is pointing to Supabase pooler on port 5432 (Session Mode). " +
        "Auto-routing to port 6543 (Transaction Mode) to avoid serverless connection exhaustion. " +
        "Please update DATABASE_URL in your Netlify environment variables to use port 6543 directly."
    );
    return url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }
  return url;
}

// ── Serverless-optimized connection pool ─────────────────────────────
// Netlify Functions & AWS Lambda scale horizontally and freeze between invocations.
// 1. max: 1 prevents connection exhaustion across concurrent serverless lambdas.
// 2. idle_timeout: 20 closes idle connections cleanly so thawed lambdas never attempt
//    to reuse sockets that were terminated remotely by Supavisor / NAT.
// 3. connect_timeout: 10 prevents hanging on stalled networks.
// 4. globalThis caching reuses connections across warm invocations.
declare global {
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
  var __pooledSql: ReturnType<typeof postgres> | undefined;
}

const poolUrl = getPoolerUrl(serverEnv.DATABASE_URL);

const pooledSql =
  globalThis.__pooledSql ??
  postgres(poolUrl, {
    prepare: false, // Required for Supabase PgBouncer / Supavisor transaction mode
    max: 1, // 1 connection per serverless instance to prevent socket exhaustion
    idle_timeout: 20, // Drop idle connections after 20s so dead sockets aren't reused after lambda thaw
    connect_timeout: 10, // 10s connection timeout
    max_lifetime: 60 * 30, // Recycle connection after 30 minutes
  });

globalThis.__pooledSql = pooledSql;

export const db = globalThis.__db ?? drizzle(pooledSql, { schema });

globalThis.__db = db;

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
