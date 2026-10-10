import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { AuthError, EmailOtpType } from "@supabase/supabase-js";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import { upsertProfile } from "@/modules/auth";
import { getCart } from "@/modules/cart";

const schema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: errors.otp?.[0] ?? errors.email?.[0] ?? "Invalid input" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("cart_session")?.value;

  const supabase = await createClient();

  // Candidate OTP types across different Supabase Auth configurations
  const candidateTypes: EmailOtpType[] = ["email", "magiclink", "signup"];
  let data = null;
  let error: AuthError | null = null;

  for (const candidateType of candidateTypes) {
    const res = await supabase.auth.verifyOtp({
      email: result.data.email,
      token: result.data.otp,
      type: candidateType,
    });

    if (!res.error && res.data?.user) {
      data = res.data;
      error = null;
      break;
    }
    error = res.error;
  }

  if (error || !data || !data.user) {
    return NextResponse.json(
      { error: "Invalid or expired OTP. Please try again." },
      { status: 400 }
    );
  }

  await upsertProfile({
    id: data.user.id,
    email: data.user.email,
    phone: data.user.phone,
  });

  // Merge guest cart and return the resulting cart to the client.
  let mergedCart = null;
  if (sessionCookie) {
    try {
      const { mergeGuestCartToUser } = await import("@/modules/cart");
      mergedCart = await mergeGuestCartToUser(sessionCookie, data.user.id);
    } catch (err) {
      console.error("[verify-email-otp] Cart merge failed:", err);
      mergedCart = await getCart({ userId: data.user.id });
    }
  } else {
    mergedCart = await getCart({ userId: data.user.id });
  }

  const response = NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
    },
    cart: mergedCart,
  });

  // Mirror session cookies set by the Supabase client onto the response
  // so the browser stores the auth tokens immediately.
  cookieStore.getAll().forEach((c) => {
    response.cookies.set(c.name, c.value);
  });

  if (sessionCookie) {
    response.cookies.delete("cart_session");
  }

  return response;
}
