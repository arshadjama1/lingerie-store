import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { upsertProfile } from "@/modules/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback]", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  await upsertProfile({
    id: data.user.id,
    email: data.user.email,
    phone: data.user.phone,
  });

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("cart_session")?.value;

  if (sessionCookie) {
    const { mergeGuestCartToUser } = await import("@/modules/cart");
    await mergeGuestCartToUser(sessionCookie, data.user.id).catch((err) =>
      console.error("[auth/callback] Cart merge failed:", err)
    );
  }

  const redirectUrl = next.startsWith("/") ? `${origin}${next}` : origin;
  const response = NextResponse.redirect(redirectUrl);

  if (sessionCookie) {
    response.cookies.delete("cart_session");
  }

  return response;
}
