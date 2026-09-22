import { NextResponse } from "next/server";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import {
  SyncWishlistSchema,
  getUserWishlist,
  getWishlistProductIds,
  mergeGuestWishlist,
} from "@/modules/wishlist";

export const POST = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SyncWishlistSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message || "Invalid sync payload"
    );
  }

  await mergeGuestWishlist(user.id, parsed.data.items);

  const [items, productIds] = await Promise.all([
    getUserWishlist(user.id),
    getWishlistProductIds(user.id),
  ]);

  return NextResponse.json({
    items,
    productIds,
    success: true,
  });
});
