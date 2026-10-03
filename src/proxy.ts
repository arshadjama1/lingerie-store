import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isPrelaunch = process.env.NEXT_PUBLIC_PRELAUNCH_MODE === "true";
  const bypassSecret = process.env.PRELAUNCH_BYPASS_KEY || "linge2026";

  // 1. Team bypass handler: ?preview=exit to exit, ?preview=<secret> to unlock store
  if (searchParams.get("preview") === "exit") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("preview");
    const redirectRes = NextResponse.redirect(url);
    redirectRes.cookies.delete("linge_preview_access");
    return redirectRes;
  }

  if (searchParams.get("preview") === bypassSecret) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("preview");
    const redirectRes = NextResponse.redirect(url);
    redirectRes.cookies.set("linge_preview_access", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return redirectRes;
  }

  const hasBypass =
    request.cookies.get("linge_preview_access")?.value === "true";

  // 2. Pre-launch restriction for public visitors
  if (isPrelaunch && !hasBypass) {
    const isWhitelisted =
      pathname.startsWith("/api") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/verify") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico" ||
      pathname === "/coming-soon" ||
      /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/i.test(pathname);

    if (!isWhitelisted) {
      if (pathname === "/") {
        return NextResponse.rewrite(new URL("/coming-soon", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    (pathname.startsWith("/account") || pathname.startsWith("/checkout"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const isAdminAuthPage =
      pathname === "/admin/login" || pathname === "/admin/reset-password";

    if (isAdminAuthPage) {
      if (user) {
        let role: string | null = null;
        const { data: profileById } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileById) {
          role = profileById.role;
        } else if (user.email) {
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("role")
            .eq("email", user.email)
            .maybeSingle();
          if (profileByEmail) {
            role = profileByEmail.role;
          }
        }

        if (role && ["admin", "staff"].includes(role)) {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url)
          );
        }
      }
      return response;
    }

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    let role: string | null = null;
    const { data: profileById } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileById) {
      role = profileById.role;
    } else if (user.email) {
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", user.email)
        .maybeSingle();
      if (profileByEmail) {
        role = profileByEmail.role;
      }
    } else if (user.phone) {
      const { data: profileByPhone } = await supabase
        .from("profiles")
        .select("role")
        .eq("phone", user.phone)
        .maybeSingle();
      if (profileByPhone) {
        role = profileByPhone.role;
      }
    }

    if (!role || !["admin", "staff"].includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  // Re-stamp bypass cookie so Supabase's setAll (which replaces the response
  // object entirely) can never silently drop it from the Set-Cookie headers.
  if (hasBypass) {
    response.cookies.set("linge_preview_access", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
