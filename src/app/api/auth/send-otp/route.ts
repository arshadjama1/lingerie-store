import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import { normaliseIndianPhone } from "@/modules/auth";

const schema = z.object({
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/)
    .transform(normaliseIndianPhone),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        error: result.error.flatten().fieldErrors.phone?.[0] ?? "Invalid phone",
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: result.data.phone,
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("[auth/send-otp]", error);
    const isPhoneDisabled =
      error.code === "phone_provider_disabled" ||
      error.message?.toLowerCase().includes("unsupported phone provider");
    if (isPhoneDisabled) {
      return Response.json(
        {
          error:
            "Mobile OTP is currently not enabled. Please sign in with Email Magic Link.",
        },
        { status: 503 }
      );
    }
    const isRateLimited =
      error.message?.toLowerCase().includes("rate limit") ||
      error.status === 429;
    return Response.json(
      {
        error: isRateLimited
          ? "Too many OTP requests. Please wait a few minutes."
          : error.message || "Failed to send OTP. Please try again.",
      },
      { status: isRateLimited ? 429 : error.status || 500 }
    );
  }

  return Response.json({ success: true });
}
