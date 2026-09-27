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

  // If the guest cart is already the user's cart, no merge needed
  if (guestCart.id === userCart.id) {
    return userCart;
  }

  for (const guestItem of guestCart.items) {
    const existingUserItem = userCart.items.find(
      (item) => item.variantId === guestItem.variantId
    );

    const inv = guestItem.variant?.inventory;
    const availableStock =
      inv && typeof inv.quantity === "number"
        ? Math.max(0, inv.quantity - (inv.reservedQuantity || 0))
        : 999;

    if (existingUserItem) {
      const mergedQuantity = Math.max(
        1,
        Math.min(
          existingUserItem.quantity + guestItem.quantity,
          availableStock > 0
            ? availableStock
            : existingUserItem.quantity + guestItem.quantity
        )
      );

      await db
        .update(cartItems)
        .set({ quantity: mergedQuantity })
        .where(eq(cartItems.id, existingUserItem.id));
    } else {
      const initialQuantity =
        availableStock > 0
          ? Math.min(guestItem.quantity, availableStock)
          : guestItem.quantity;

      if (initialQuantity > 0) {
        await db.insert(cartItems).values({
          id: createId(),
          cartId: userCart.id,
          variantId: guestItem.variantId,
          quantity: initialQuantity,
          priceAtAddition: String(guestItem.priceAtAddition || "0"),
        });
      }
    }
  }

  // Delete guest cart container only if it is a different cart
  if (guestCart.id !== userCart.id) {
    await db.delete(carts).where(eq(carts.id, guestCart.id));
  }

  const updatedUserCart = await getCart({ userId });
  return updatedUserCart!;
}
