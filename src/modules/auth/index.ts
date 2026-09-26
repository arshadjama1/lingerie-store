import { db, profiles } from "@/db";
import { and, eq, ne } from "drizzle-orm";
import "server-only";

import { ConflictError, NotFoundError } from "@/lib/errors";

import type { UpdateProfileInput } from "./types";

export * from "./types";

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

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const existing = await getProfile(userId);
  if (!existing) {
    throw new NotFoundError("Profile");
  }

  let normalizedPhone: string | null | undefined = undefined;

  if (data.phone !== undefined) {
    if (data.phone) {
      normalizedPhone = normaliseIndianPhone(data.phone);
      const existingWithPhone = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(
          and(eq(profiles.phone, normalizedPhone), ne(profiles.id, userId))
        )
        .limit(1);

      if (existingWithPhone.length > 0) {
        throw new ConflictError(
          "Phone number is already associated with another account"
        );
      }
    } else {
      normalizedPhone = null;
    }
  }

  let normalizedEmail: string | null | undefined = undefined;

  if (data.email !== undefined) {
    if (data.email) {
      normalizedEmail = data.email.trim().toLowerCase();
      const existingWithEmail = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(
          and(eq(profiles.email, normalizedEmail), ne(profiles.id, userId))
        )
        .limit(1);

      if (existingWithEmail.length > 0) {
        throw new ConflictError(
          "Email address is already associated with another account"
        );
      }
    } else {
      normalizedEmail = null;
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName ? data.firstName.trim() : null;
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName ? data.lastName.trim() : null;
  }
  if (normalizedPhone !== undefined) {
    updateData.phone = normalizedPhone;
  }
  if (normalizedEmail !== undefined) {
    updateData.email = normalizedEmail;
  }
  if (data.avatarUrl !== undefined) {
    updateData.avatarUrl = data.avatarUrl ? data.avatarUrl.trim() : null;
  }

  if (Object.keys(updateData).length === 0) {
    return existing;
  }

  const [updated] = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.id, userId))
    .returning();

  return updated;
}

export function normaliseIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}
