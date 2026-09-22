import { NextResponse } from "next/server";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { removeFromWishlist } from "@/modules/wishlist";

export const DELETE = withErrorHandling(
  async (_req: Request, ctx?: unknown) => {
    const params = (ctx as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    if (!id) {
      throw new ValidationError("Wishlist item ID or Product ID is required");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    const removed = await removeFromWishlist(user.id, id);

    return NextResponse.json({ success: removed });
  }
);
