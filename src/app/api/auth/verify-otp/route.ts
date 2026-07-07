import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import { normaliseIndianPhone, upsertProfile } from "@/modules/auth";

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
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return Response.json(
      { error: errors.otp?.[0] ?? errors.phone?.[0] ?? "Invalid input" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: result.data.phone,
    token: result.data.otp,
    type: "sms",
  });

  if (error || !data.user) {
    return Response.json(
      { error: "Invalid or expired OTP. Please try again." },
      { status: 400 }
    );
  }

  await upsertProfile({
    id: data.user.id,
    phone: data.user.phone,
    email: data.user.email,
  });

  return Response.json({
    user: { id: data.user.id, phone: data.user.phone, email: data.user.email },
  });
}
