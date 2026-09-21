import "server-only";

import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

/**
 * Asserts that the current request is made by an authenticated admin or staff
 * user. Throws UnauthorizedError (401) if not logged in, ForbiddenError (403)
 * if the user's role is not "admin" or "staff".
 *
 * @returns The authenticated Supabase user object.
 */
export async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    throw new ForbiddenError();
  }

  return user;
}
