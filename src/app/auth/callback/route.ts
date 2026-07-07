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

  const redirectUrl = next.startsWith("/") ? `${origin}${next}` : origin;
  return NextResponse.redirect(redirectUrl);
}
