import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { upsertProfile } from "@/modules/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const urlCartSession = searchParams.get("cart_session");

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`);

  const isLocalEnv = process.env.NODE_ENV === "development";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin.replace(/^http:\/\//, "https://");

  const redirectUrl = next.startsWith("/")
    ? `${redirectBase}${next}`
    : redirectBase;
  const response = NextResponse.redirect(redirectUrl);

  const cookieStore = await cookies();
  const sessionCookie =
    urlCartSession || cookieStore.get("cart_session")?.value;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback]", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Ensure all cookies set on cookieStore are mirrored on the redirect response
  cookieStore.getAll().forEach((c) => {
    response.cookies.set(c.name, c.value);
  });

  await upsertProfile({
    id: data.user.id,
    email: data.user.email,
    phone: data.user.phone,
  });

  if (sessionCookie) {
    try {
      const { mergeGuestCartToUser } = await import("@/modules/cart");
      await mergeGuestCartToUser(sessionCookie, data.user.id);
      response.cookies.delete("cart_session");
    } catch (err) {
      console.error("[auth/callback] Cart merge failed:", err);
    }
  }

  return response;
}
