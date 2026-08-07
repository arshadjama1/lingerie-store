import { NextResponse } from "next/server";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import {
  CreateAddressSchema,
  createAddress,
  getUserAddresses,
} from "@/modules/addresses";

export const GET = withErrorHandling(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const addressesList = await getUserAddresses(user.id);

  return NextResponse.json({ addresses: addressesList });
});

export const POST = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const body = await req.json().catch(() => ({}));
  const result = CreateAddressSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid address data"
    );
  }

  const address = await createAddress(user.id, result.data);

  return NextResponse.json({ address }, { status: 201 });
});
