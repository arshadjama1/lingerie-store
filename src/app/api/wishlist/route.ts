import { NextResponse } from "next/server";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import {
  AddToWishlistSchema,
  addToWishlist,
  getUserWishlist,
  getWishlistProductIds,
} from "@/modules/wishlist";

export const GET = withErrorHandling(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      items: [],
      productIds: [],
      authenticated: false,
    });
  }

  const [items, productIds] = await Promise.all([
    getUserWishlist(user.id),
    getWishlistProductIds(user.id),
  ]);

  return NextResponse.json({
    items,
    productIds,
    authenticated: true,
  });
});

export const POST = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError(
      "Please sign in to save items to your wishlist"
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = AddToWishlistSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || "Invalid wishlist data"
    );
  }

  const result = await addToWishlist(user.id, parsed.data);

  return NextResponse.json({ success: true, item: result }, { status: 201 });
});
