import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

declare global {
  var __db_conn: postgres.Sql | undefined;
}

const conn =
  global.__db_conn ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false, // Required: Supabase pgBouncer (port 6543) doesn't support prepared statements
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__db_conn = conn;
}

export const db = drizzle(conn, {
  schema,
});

export * from "./schema";
