import { db, profiles } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const forgotSchema = z.object({
  email: z.string().trim().email("Please provide a valid administrative email"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const result = forgotSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        error: result.error.flatten().fieldErrors.email?.[0] || "Invalid email",
      },
      { status: 400 }
    );
  }

  const { email } = result.data;

  try {
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    // Verify whether the email is associated with an active admin or staff profile
    const [profile] = await db
      .select({ role: profiles.role, isActive: profiles.isActive })
      .from(profiles)
      .where(eq(profiles.email, email.toLowerCase()))
      .limit(1);

    if (
      profile &&
      ["admin", "staff"].includes(profile.role) &&
      profile.isActive
    ) {
      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/admin/reset-password`,
      });

      if (error) {
        console.error("[admin/forgot-password]", error.message);
      }
    }

    // Always respond with success to prevent admin email enumeration attacks
    return Response.json({
      success: true,
      message:
        "If an authorized administrative account exists for this email address, a password recovery link has been dispatched.",
    });
  } catch (err) {
    console.error("[admin/forgot-password]", err);
    return Response.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
