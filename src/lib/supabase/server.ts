import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";
import "server-only";

import { serverEnv } from "@/config/env.server";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* RSC — cookies read-only, middleware handles refresh */
          }
        },
      },
    }
  );
}

export async function createServiceClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serverEnv.SUPABASE_SECRET_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          /* service client doesn't manage session cookies */
        },
      },
    }
  );
}

/**
 * Fast-path check: returns the authenticated user if session cookies exist,
 * or null immediately without making any remote network round-trip.
 * Saves 200–800 ms on public storefront and guest API requests.
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasToken = allCookies.some(
    (c) =>
      c.name.startsWith("sb-") &&
      (c.name.includes("-auth-token") || c.name.includes("token"))
  );

  if (!hasToken) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch (err) {
    console.warn("[getSessionUser] auth check warning:", err);
    return null;
  }
}
