import { db, profiles } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid administrative email"),
  password: z.string().min(1, "Password is required"),
  redirectTo: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    const errorMsg =
      result.error.flatten().fieldErrors.email?.[0] ||
      result.error.flatten().fieldErrors.password?.[0] ||
      "Invalid credentials";
    return Response.json({ error: errorMsg }, { status: 400 });
  }

  const { email, password, redirectTo } = result.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return Response.json(
        {
          error:
            error?.message === "Invalid login credentials"
              ? "Invalid email or password. Please verify your credentials."
              : error?.message || "Authentication failed",
        },
        { status: 401 }
      );
    }

    // Role verification
    const [profile] = await db
      .select({ role: profiles.role, isActive: profiles.isActive })
      .from(profiles)
      .where(eq(profiles.id, data.user.id))
      .limit(1);

    if (!profile || !["admin", "staff"].includes(profile.role)) {
      // Purge the session immediately for unauthorized roles
      await supabase.auth.signOut();
      return Response.json(
        {
          error:
            "Access restricted: This account does not possess administrator or staff privileges.",
        },
        { status: 403 }
      );
    }

    if (!profile.isActive) {
      await supabase.auth.signOut();
      return Response.json(
        {
          error:
            "Account deactivated: Your administrative privileges have been suspended.",
        },
        { status: 403 }
      );
    }

    // Sanitize target redirect
    const target =
      redirectTo &&
      redirectTo.startsWith("/admin") &&
      redirectTo !== "/admin/login"
        ? redirectTo
        : "/admin/dashboard";

    return Response.json({
      success: true,
      redirect: target,
      role: profile.role,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Internal server authentication error";
    return Response.json({ error: message }, { status: 500 });
  }
}
