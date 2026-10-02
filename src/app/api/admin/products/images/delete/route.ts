import { NextResponse } from "next/server";

import { db } from "@/db";
import { productImages } from "@/db/schema";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import { AppError, withErrorHandling } from "@/lib/errors";

/**
 * Use the raw supabase-js createClient (not the SSR wrapper) so the
 * service-role JWT is sent unmodified and bypasses RLS on storage.
 */
function createStorageAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new AppError("Supabase not configured", 500);
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const deleteImageSchema = z.object({
  storagePath: z.string().min(1),
  imageId: z.string().min(1),
});

export const DELETE = withErrorHandling(async (req) => {
  await assertAdmin();

  const body = await req.json().catch(() => ({}));
  const result = deleteImageSchema.safeParse(body);
  if (!result.success) {
    throw new AppError("storagePath and imageId are required", 400);
  }
  const { storagePath, imageId } = result.data;

  const supabase = createStorageAdminClient();
  const { error } = await supabase.storage
    .from("surekh-assets")
    .remove([storagePath]);

  if (error) {
    throw new AppError(error.message, 500, "STORAGE_ERROR");
  }

  await db.delete(productImages).where(eq(productImages.id, imageId));

  return NextResponse.json({ success: true });
});
