import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";
import type { AuthError, EmailOtpType } from "@supabase/supabase-js";

import { upsertProfile } from "@/modules/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType) || "email";
  const next = searchParams.get("next") ?? "/";
  const urlCartSession = searchParams.get("cart_session");

  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const isLocalEnv = process.env.NODE_ENV === "development";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin.replace(/^http:\/\//, "https://");

  // Ignore automated scanner/prefetch requests so they do not consume single-use tokens
  const purpose =
    request.headers.get("purpose") ||
    request.headers.get("sec-purpose") ||
    request.headers.get("x-purpose");
  if (purpose === "prefetch" || purpose === "preview") {
    return new NextResponse("Prefetch ignored", { status: 200 });
  }

  // Handle upstream Supabase error redirects (e.g. expired link, link already used, access denied)
  if (errorParam || errorDescription) {
    console.error("[auth/callback] Supabase returned error:", {
      error: errorParam,
      description: errorDescription,
    });
    const errorMsg = encodeURIComponent(
      errorDescription || errorParam || "Authentication failed"
    );
    return NextResponse.redirect(`${redirectBase}/login?error=${errorMsg}`);
  }

  // Neither PKCE code nor token_hash provided
  if (!code && !token_hash) {
    return NextResponse.redirect(`${redirectBase}/login?error=missing_code`);
  }

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

  let authUser = null;
  let authError: AuthError | null = null;

  if (token_hash) {
    // Try candidate types in sequence (handles new signups, returning magiclink, or generic email tokens)
    const candidateTypes: EmailOtpType[] = Array.from(
      new Set([type, "signup", "magiclink", "email"])
    );

    for (const candidateType of candidateTypes) {
      const res = await supabase.auth.verifyOtp({
        token_hash,
        type: candidateType,
      });

      if (!res.error && res.data?.user) {
        authUser = res.data.user;
        authError = null;
        break;
      }
      authError = res.error;
    }
  } else if (code) {
    // Traditional PKCE code exchange
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    authUser = data?.user;
    authError = error;
  }

  if (authError || !authUser) {
    console.error("[auth/callback] Authentication failed:", authError?.message);
    const errorMsg = encodeURIComponent(authError?.message || "auth_failed");
    return NextResponse.redirect(`${redirectBase}/login?error=${errorMsg}`);
  }

  await upsertProfile({
    id: authUser.id,
    email: authUser.email,
    phone: authUser.phone,
  });

  if (sessionCookie) {
    try {
      const { mergeGuestCartToUser } = await import("@/modules/cart");
      await mergeGuestCartToUser(sessionCookie, authUser.id);
      response.cookies.delete("cart_session");
    } catch (err) {
      console.error("[auth/callback] Cart merge failed:", err);
    }
  }

  return response;
}
