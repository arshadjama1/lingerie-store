import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import { normaliseIndianPhone, upsertProfile } from "@/modules/auth";
import { getCart } from "@/modules/cart";

const schema = z.object({
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/)
    .transform(normaliseIndianPhone),
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
      { error: errors.otp?.[0] ?? errors.phone?.[0] ?? "Invalid input" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("cart_session")?.value;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: result.data.phone,
    token: result.data.otp,
    type: "sms",
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Invalid or expired OTP. Please try again." },
      { status: 400 }
    );
  }

  await upsertProfile({
    id: data.user.id,
    phone: data.user.phone,
    email: data.user.email,
  });

  // Merge guest cart and capture the resulting cart to return to the client.
  let mergedCart = null;
  if (sessionCookie) {
    try {
      const { mergeGuestCartToUser } = await import("@/modules/cart");
      mergedCart = await mergeGuestCartToUser(sessionCookie, data.user.id);
    } catch (err) {
      console.error("[verify-otp] Cart merge failed:", err);
      // Fallback: just fetch the user's existing cart.
      mergedCart = await getCart({ userId: data.user.id });
    }
  } else {
    // No guest session — fetch any existing user cart directly.
    mergedCart = await getCart({ userId: data.user.id });
  }

  const response = NextResponse.json({
    user: {
      id: data.user.id,
      phone: data.user.phone,
      email: data.user.email,
    },
    cart: mergedCart,
  });

  // Mirror all cookies that the Supabase server client wrote (session tokens)
  // onto the outgoing response so the browser stores them immediately.
  cookieStore.getAll().forEach((c) => {
    response.cookies.set(c.name, c.value);
  });

  // Clear the guest cart session cookie now that the cart has been merged.
  if (sessionCookie) {
    response.cookies.delete("cart_session");
  }

  return response;
}
