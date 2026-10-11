import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

/**
 * Supabase session-refresh middleware.
 *
 * Runs on every matched request and silently refreshes the user's auth token
 * (access + refresh cookie pair) so that Server Components and Route Handlers
 * always see a valid, non-expired session without requiring a page reload.
 *
 * The middleware does NOT enforce authorization — it only keeps the session
 * alive.  Individual pages / layouts / route-handlers are responsible for
 * redirecting unauthenticated users when required.
 *
 * Why this is necessary (from @supabase/ssr README):
 *   - `getSession()` reads the cookie but does NOT verify it with the server.
 *   - Without middleware, a near-expiry token is never refreshed server-side,
 *     causing the session to appear "null" on the next request.
 *   - The middleware runs once per navigation, before any page renders, so all
 *     subsequent server reads see a valid token.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to the outgoing request so downstream Server Components see them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Write to the response so the browser receives the refreshed cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is the only operation middleware must do.
  // Do NOT use getSession() here; getUser() validates against the auth server.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static (static assets)
     *   - _next/image  (image optimisation)
     *   - favicon.ico, sitemap.xml, robots.txt, and any file with an extension
     *     (e.g. .png, .jpg, .svg, .css, .js) — these never need auth cookies
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
