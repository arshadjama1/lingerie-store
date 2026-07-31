import { db } from "@/db";
import { cartItems, carts } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import "server-only";

import { getCart, getOrCreateCart } from "./queries";
import type { HydratedCart } from "./types";

export async function mergeGuestCartToUser(
  sessionId: string,
  userId: string
): Promise<HydratedCart> {
  const guestCart = await getCart({ sessionId });
  if (!guestCart || guestCart.items.length === 0) {
    return getOrCreateCart({ userId });
  }

  const userCart = await getOrCreateCart({ userId });

  for (const guestItem of guestCart.items) {
    const existingUserItem = userCart.items.find(
      (item) => item.variantId === guestItem.variantId
    );

    const inv = guestItem.variant?.inventory;
    const availableStock = inv ? inv.quantity - inv.reservedQuantity : 999;

    if (existingUserItem) {
      const mergedQuantity = Math.min(
        existingUserItem.quantity + guestItem.quantity,
        availableStock
      );

      await db
        .update(cartItems)
        .set({ quantity: mergedQuantity })
        .where(eq(cartItems.id, existingUserItem.id));
    } else {
      const initialQuantity = Math.min(guestItem.quantity, availableStock);

      if (initialQuantity > 0) {
        await db.insert(cartItems).values({
          id: createId(),
          cartId: userCart.id,
          variantId: guestItem.variantId,
          quantity: initialQuantity,
          priceAtAddition: guestItem.priceAtAddition,
        });
      }
    }
  }

  // Delete guest cart container (cascades items)
  await db.delete(carts).where(eq(carts.id, guestCart.id));

  const updatedUserCart = await getCart({ userId });
  return updatedUserCart!;
}
