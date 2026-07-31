import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { UnauthorizedError, withErrorHandling } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { mergeGuestCartToUser } from "@/modules/cart";

export const POST = withErrorHandling(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("cart_session")?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("Must be logged in to merge cart");
  }

  let updatedCart = null;
  if (sessionCookie) {
    updatedCart = await mergeGuestCartToUser(sessionCookie, user.id);
  }

  const response = NextResponse.json({
    cart: updatedCart,
  });

  // Clear guest cart cookie after merge
  if (sessionCookie) {
    response.cookies.delete("cart_session");
  }

  return response;
});
