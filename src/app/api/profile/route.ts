import { NextResponse } from "next/server";

import {
  UnauthorizedError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import {
  UpdateProfileSchema,
  getProfile,
  updateProfile,
  upsertProfile,
} from "@/modules/auth";

export const GET = withErrorHandling(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  let profile = await getProfile(user.id);

  if (!profile) {
    await upsertProfile({
      id: user.id,
      email: user.email,
      phone: user.phone,
    });
    profile = await getProfile(user.id);
  }

  return NextResponse.json({
    profile: profile || {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: null,
      lastName: null,
      role: "customer",
      loyaltyPoints: 0,
      createdAt: user.created_at,
    },
  });
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const body = await req.json().catch(() => ({}));
  const result = UpdateProfileSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message || "Invalid profile data"
    );
  }

  // Ensure profile row exists before updating
  await upsertProfile({
    id: user.id,
    email: user.email,
    phone: user.phone,
  });

  const updated = await updateProfile(user.id, result.data);

  return NextResponse.json({ profile: updated });
});
