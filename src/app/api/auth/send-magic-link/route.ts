import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
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
        error: result.error.flatten().fieldErrors.email?.[0] ?? "Invalid email",
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: result.data.redirectTo
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(
            result.data.redirectTo
          )}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("[auth/send-magic-link]", error.message);
    return Response.json(
      { error: "Failed to send magic link. Please try again." },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
