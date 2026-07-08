import { db, profiles } from "@/db";
import { eq } from "drizzle-orm";
import "server-only";

export async function upsertProfile(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
}): Promise<void> {
  await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: "customer",
    })
    .onConflictDoNothing();
}

export async function getProfile(userId: string) {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

export function normaliseIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}
