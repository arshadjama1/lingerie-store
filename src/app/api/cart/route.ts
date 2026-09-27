import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { withErrorHandling } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { getCart } from "@/modules/cart";

export const GET = withErrorHandling(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("cart_session")?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const sessionId = sessionCookie ?? null;

  if (!userId && !sessionId) {
    return NextResponse.json({
      cart: null,
    });
  }

  // If user is logged in and there's a guest session, merge them immediately
  if (userId && sessionId) {
    try {
      const { mergeGuestCartToUser } = await import("@/modules/cart");
      const mergedCart = await mergeGuestCartToUser(sessionId, userId);
      const res = NextResponse.json({ cart: mergedCart || null });
      res.cookies.delete("cart_session");
      return res;
    } catch (err) {
      console.error("[api/cart] Auto-merge guest cart failed:", err);
    }
  }

  const cart = await getCart({ userId, sessionId });

  return NextResponse.json({
    cart: cart || null,
  });
});
