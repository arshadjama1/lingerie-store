import { inventory } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import "server-only";

import { InsufficientStockError } from "@/lib/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbTransaction = PgTransaction<any, any, any>;

export async function reserveInventory(
  tx: DbTransaction,
  items: { variantId: string; quantity: number }[]
) {
  for (const item of items) {
    const [inv] = await tx
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, item.variantId))
      .for("update");

    if (!inv) {
      throw new InsufficientStockError(
        `Inventory record not found for variant ${item.variantId}`
      );
    }

    const availableStock = inv.quantity - inv.reservedQuantity;
    if (availableStock < item.quantity) {
      throw new InsufficientStockError(
        `Only ${availableStock} item(s) available in stock`
      );
    }

    await tx
      .update(inventory)
      .set({
        reservedQuantity: sql`${inventory.reservedQuantity} + ${item.quantity}`,
      })
      .where(eq(inventory.id, inv.id));
  }
}

export async function releaseInventory(
  tx: DbTransaction,
  items: { variantId: string; quantity: number }[]
) {
  for (const item of items) {
    await tx
      .update(inventory)
      .set({
        reservedQuantity: sql`GREATEST(0, ${inventory.reservedQuantity} - ${item.quantity})`,
      })
      .where(eq(inventory.variantId, item.variantId));
  }
}

export async function deductInventory(
  tx: DbTransaction,
  items: { variantId: string; quantity: number }[]
) {
  for (const item of items) {
    await tx
      .update(inventory)
      .set({
        quantity: sql`GREATEST(0, ${inventory.quantity} - ${item.quantity})`,
        reservedQuantity: sql`GREATEST(0, ${inventory.reservedQuantity} - ${item.quantity})`,
      })
      .where(eq(inventory.variantId, item.variantId));
  }
}
