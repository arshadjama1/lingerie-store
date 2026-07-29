import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

import { ValidationError, withErrorHandling } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import {
  addItemToCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/modules/cart";

const quantitySchema = z.object({
  quantity: z.number().int().default(1),
});

// ── POST /api/cart/[id] (id = variantId) ─────────────────────────────
export const POST = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: variantId } = await params;

  if (!variantId) {
    throw new ValidationError("Variant ID is required");
  }

  const body = await req.json().catch(() => ({}));
  const result = quantitySchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid quantity"
    );
  }

  const cookieStore = await cookies();
  let sessionCookie = cookieStore.get("cart_session")?.value;
  let newSessionCreated = false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;

  if (!userId && !sessionCookie) {
    sessionCookie = createId();
    newSessionCreated = true;
  }

  const updatedCart = await addItemToCart(
    { userId, sessionId: sessionCookie },
    variantId,
    result.data.quantity
  );

  const response = NextResponse.json({
    cart: updatedCart,
  });

  if (newSessionCreated && sessionCookie) {
    response.cookies.set({
      name: "cart_session",
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  return response;
});

// ── PATCH /api/cart/[id] (id = itemId) ─────────────────────────────
export const PATCH = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: itemId } = await params;

  if (!itemId) {
    throw new ValidationError("Cart Item ID is required");
  }

  const body = await req.json().catch(() => null);
  const result = z
    .object({ quantity: z.number().int("Quantity must be an integer") })
    .safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid payload"
    );
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("cart_session")?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const sessionId = sessionCookie ?? null;

  const updatedCart = await updateCartItemQuantity(
    { userId, sessionId },
    itemId,
    result.data.quantity
  );

  return NextResponse.json({
    cart: updatedCart,
  });
});

// ── DELETE /api/cart/[id] (id = itemId) ────────────────────────────
export const DELETE = withErrorHandling(
  async (_req: Request, ctx?: unknown) => {
    const params = (ctx as { params: Promise<{ id: string }> })?.params;
    const { id: itemId } = await params;

    if (!itemId) {
      throw new ValidationError("Cart Item ID is required");
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("cart_session")?.value;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? null;
    const sessionId = sessionCookie ?? null;

    const updatedCart = await removeCartItem({ userId, sessionId }, itemId);

    return NextResponse.json({
      cart: updatedCart,
    });
  }
);
