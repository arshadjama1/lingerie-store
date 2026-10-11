import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { AuthError, EmailOtpType } from "@supabase/supabase-js";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import { upsertProfile } from "@/modules/auth";

const schema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  try {
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
    let authUser = null;
    let authError: AuthError | null = null;

    for (const candidateType of candidateTypes) {
      try {
        const res = await supabase.auth.verifyOtp({
          email: result.data.email,
          token: result.data.otp,
          type: candidateType,
        });

        if (!res.error && res.data?.user) {
          authUser = res.data.user;
          authError = null;
          break;
        }
        authError = res.error;
      } catch (err) {
        console.error(
          `[verify-email-otp] Error checking type ${candidateType}:`,
          err
        );
      }
    }

    if (authError || !authUser) {
      return NextResponse.json(
        {
          error:
            authError?.message || "Invalid or expired OTP. Please try again.",
        },
        { status: 400 }
      );
    }

    // Upsert profile safely without failing the auth session if the DB call hiccups
    try {
      await upsertProfile({
        id: authUser.id,
        email: authUser.email,
        phone: authUser.phone,
      });
    } catch (err) {
      console.error("[verify-email-otp] Profile upsert failed:", err);
    }

    // Merge guest cart safely
    let mergedCart = null;
    if (sessionCookie) {
      try {
        const { mergeGuestCartToUser } = await import("@/modules/cart");
        mergedCart = await mergeGuestCartToUser(sessionCookie, authUser.id);
      } catch (err) {
        console.error("[verify-email-otp] Cart merge failed:", err);
      }
    }

    const response = NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email,
        phone: authUser.phone,
      },
      cart: mergedCart,
    });

    if (sessionCookie) {
      response.cookies.delete("cart_session");
    }

    return response;
  } catch (err) {
    console.error("[verify-email-otp] Unexpected error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to verify OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
