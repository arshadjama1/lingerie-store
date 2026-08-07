import { db } from "@/db";
import { addresses } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq } from "drizzle-orm";
import "server-only";

import { NotFoundError, ValidationError } from "@/lib/errors";

import type { CreateAddressInput, UpdateAddressInput } from "./types";

export async function getUserAddresses(userId: string) {
  return await db.query.addresses.findMany({
    where: and(eq(addresses.userId, userId), eq(addresses.isActive, true)),
    orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)],
  });
}

export async function getAddressById(userId: string, addressId: string) {
  const address = await db.query.addresses.findFirst({
    where: and(
      eq(addresses.id, addressId),
      eq(addresses.userId, userId),
      eq(addresses.isActive, true)
    ),
  });

  if (!address) {
    throw new NotFoundError("Address");
  }

  return address;
}

export async function createAddress(userId: string, data: CreateAddressInput) {
  const existingAddresses = await getUserAddresses(userId);
  if (existingAddresses.length >= 10) {
    throw new ValidationError("Maximum address limit (10) reached");
  }

  const shouldBeDefault = data.isDefault || existingAddresses.length === 0;

  return await db.transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(and(eq(addresses.userId, userId), eq(addresses.isActive, true)));
    }

    const newAddressId = createId();
    const [inserted] = await tx
      .insert(addresses)
      .values({
        id: newAddressId,
        userId,
        label: data.label || "home",
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: shouldBeDefault,
        isActive: true,
      })
      .returning();

    return inserted;
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: UpdateAddressInput
) {
  await getAddressById(userId, addressId);

  return await db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(and(eq(addresses.userId, userId), eq(addresses.isActive, true)));
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.label !== undefined) updatePayload.label = data.label;
    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.line1 !== undefined) updatePayload.line1 = data.line1;
    if (data.line2 !== undefined) updatePayload.line2 = data.line2;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.state !== undefined) updatePayload.state = data.state;
    if (data.pincode !== undefined) updatePayload.pincode = data.pincode;
    if (data.isDefault !== undefined) updatePayload.isDefault = data.isDefault;

    const [updated] = await tx
      .update(addresses)
      .set(updatePayload)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .returning();

    return updated;
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await getAddressById(userId, addressId);

  return await db.transaction(async (tx) => {
    await tx
      .update(addresses)
      .set({ isActive: false, isDefault: false })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

    if (existing.isDefault) {
      const remaining = await tx.query.addresses.findFirst({
        where: and(eq(addresses.userId, userId), eq(addresses.isActive, true)),
        orderBy: [desc(addresses.createdAt)],
      });

      if (remaining) {
        await tx
          .update(addresses)
          .set({ isDefault: true })
          .where(eq(addresses.id, remaining.id));
      }
    }

    return { success: true };
  });
}
