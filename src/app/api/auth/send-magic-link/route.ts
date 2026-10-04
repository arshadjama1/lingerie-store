import { cookies } from "next/headers";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
  cartSession: z.string().optional(),
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

  const cookieStore = await cookies();
  const sessionCookie =
    result.data.cartSession || cookieStore.get("cart_session")?.value;

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const nextPath = result.data.redirectTo || "/";
  const callbackUrl = new URL(`${origin}/auth/callback`);
  callbackUrl.searchParams.set("next", nextPath);
  if (sessionCookie) {
    callbackUrl.searchParams.set("cart_session", sessionCookie);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    console.error("[auth/send-magic-link]", error);
    const status = error.status || 500;
    const isRateLimited =
      error.message?.toLowerCase().includes("rate limit") || status === 429;
    return Response.json(
      {
        error: isRateLimited
          ? "Too many login attempts. Please wait a few minutes and try again."
          : error.message || "Failed to send magic link. Please try again.",
      },
      { status: isRateLimited ? 429 : status }
    );
  }

  return Response.json({ success: true });
}
