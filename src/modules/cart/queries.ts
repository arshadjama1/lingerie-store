import { db } from "@/db";
import { cartItems, carts, productVariants } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import "server-only";

import { InsufficientStockError, NotFoundError } from "@/lib/errors";

import type { HydratedCart } from "./types";

interface CartLookup {
  userId?: string | null;
  sessionId?: string | null;
}

async function fetchCartRecord(lookup: {
  userId?: string;
  sessionId?: string;
}) {
  const { userId, sessionId } = lookup;
  return await db.query.carts.findFirst({
    where: (cartsTable, { eq }) =>
      userId
        ? eq(cartsTable.userId, userId)
        : eq(cartsTable.sessionId, sessionId!),
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: {
                with: {
                  images: {
                    orderBy: (img, { asc }) => [asc(img.sortOrder)],
                  },
                },
              },
              inventory: true,
            },
          },
        },
        orderBy: (item, { desc }) => [desc(item.addedAt)],
      },
    },
  });
}

type RawCartRecord = NonNullable<Awaited<ReturnType<typeof fetchCartRecord>>>;

function formatHydratedCart(cartRecord: RawCartRecord): HydratedCart {
  const items = cartRecord.items || [];
  const subtotal = items.reduce((acc, item) => {
    const itemPrice = Number(item.variant?.price ?? item.priceAtAddition ?? 0);
    return acc + itemPrice * item.quantity;
  }, 0);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    ...cartRecord,
    items,
    subtotal,
    itemCount,
  } as HydratedCart;
}

export async function getCart(
  lookup: CartLookup
): Promise<HydratedCart | null> {
  const { userId, sessionId } = lookup;
  if (!userId && !sessionId) return null;

  if (userId && sessionId) {
    const userCart = await fetchCartRecord({ userId });
    if (userCart && userCart.items && userCart.items.length > 0) {
      return formatHydratedCart(userCart);
    }

    const guestCart = await fetchCartRecord({ sessionId });
    if (guestCart && guestCart.items && guestCart.items.length > 0) {
      return formatHydratedCart(guestCart);
    }

    if (userCart) return formatHydratedCart(userCart);
    if (guestCart) return formatHydratedCart(guestCart);
    return null;
  }

  const cartRecord = await fetchCartRecord({
    userId: userId ?? undefined,
    sessionId: sessionId ?? undefined,
  });

  if (!cartRecord) return null;
  return formatHydratedCart(cartRecord);
}

export async function getOrCreateCart(
  lookup: CartLookup
): Promise<HydratedCart> {
  const existing = await getCart(lookup);
  if (existing) return existing;

  const { userId, sessionId } = lookup;
  const newCartId = createId();

  await db.insert(carts).values({
    id: newCartId,
    userId: userId ?? null,
    sessionId: sessionId ?? null,
  });

  const created = await getCart({ userId, sessionId });
  if (!created) {
    throw new Error("Failed to create cart");
  }
  return created;
}

export async function addItemToCart(
  lookup: CartLookup,
  variantId: string,
  quantityToAdd: number
): Promise<HydratedCart> {
  if (quantityToAdd <= 0) {
    throw new Error("Quantity to add must be greater than 0");
  }

  // 1. Verify variant & stock
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
    with: {
      inventory: true,
    },
  });

  if (!variant) {
    throw new NotFoundError("Product variant not found");
  }

  const availableStock = variant.inventory
    ? variant.inventory.quantity - variant.inventory.reservedQuantity
    : 0;

  const cart = await getOrCreateCart(lookup);
  const existingItem = cart.items.find((item) => item.variantId === variantId);
  const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
  const newTotalQuantity = currentQuantityInCart + quantityToAdd;

  if (newTotalQuantity > availableStock) {
    throw new InsufficientStockError(
      `Only ${availableStock} items available in stock (${currentQuantityInCart} already in your bag)`
    );
  }

  if (existingItem) {
    await db
      .update(cartItems)
      .set({
        quantity: newTotalQuantity,
        priceAtAddition: variant.price,
      })
      .where(eq(cartItems.id, existingItem.id));
  } else {
    await db.insert(cartItems).values({
      id: createId(),
      cartId: cart.id,
      variantId,
      quantity: quantityToAdd,
      priceAtAddition: variant.price,
    });
  }

  const updatedCart = await getCart(lookup);
  return updatedCart!;
}

export async function updateCartItemQuantity(
  lookup: CartLookup,
  itemId: string,
  newQuantity: number
): Promise<HydratedCart> {
  const cart = await getCart(lookup);
  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  const existingItem = cart.items.find((item) => item.id === itemId);
  if (!existingItem) {
    throw new NotFoundError("Item not found in cart");
  }

  if (newQuantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
    const inv = existingItem.variant?.inventory;
    const availableStock = inv ? inv.quantity - inv.reservedQuantity : 0;

    if (newQuantity > availableStock) {
      throw new InsufficientStockError(
        `Cannot set quantity to ${newQuantity}. Only ${availableStock} items available in stock.`
      );
    }

    await db
      .update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, itemId));
  }

  const updated = await getCart(lookup);
  return updated!;
}

export async function removeCartItem(
  lookup: CartLookup,
  itemId: string
): Promise<HydratedCart> {
  const cart = await getCart(lookup);
  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));

  const updated = await getCart(lookup);
  return updated!;
}

export async function clearCart(lookup: CartLookup): Promise<void> {
  const cart = await getCart(lookup);
  if (!cart) return;

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
}
