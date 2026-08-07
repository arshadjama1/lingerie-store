import { NextResponse } from "next/server";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import {
  UpdateAddressSchema,
  deleteAddress,
  updateAddress,
} from "@/modules/addresses";

export const PATCH = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: addressId } = await params;

  if (!addressId) {
    throw new ValidationError("Address ID is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const body = await req.json().catch(() => ({}));
  const result = UpdateAddressSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid address data"
    );
  }

  const address = await updateAddress(user.id, addressId, result.data);

  return NextResponse.json({ address });
});

export const DELETE = withErrorHandling(
  async (_req: Request, ctx?: unknown) => {
    const params = (ctx as { params: Promise<{ id: string }> })?.params;
    const { id: addressId } = await params;

    if (!addressId) {
      throw new ValidationError("Address ID is required");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    await deleteAddress(user.id, addressId);

    return NextResponse.json({ success: true });
  }
);
