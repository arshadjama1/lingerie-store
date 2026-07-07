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
    console.error("[auth/send-otp]", error.message);
    return Response.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
