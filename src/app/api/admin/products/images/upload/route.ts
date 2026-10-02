import { NextResponse } from "next/server";

import { createId } from "@paralleldrive/cuid2";
import { createClient } from "@supabase/supabase-js";

import { assertAdmin } from "@/lib/admin-auth";
import { AppError, withErrorHandling } from "@/lib/errors";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Create a plain admin storage client using the service-role key directly.
 * We intentionally use `createClient` (not `createServerClient`) so no
 * cookie / SSR session machinery interferes with the Authorization header —
 * the service-role JWT must reach Supabase Storage unchanged to bypass RLS.
 */
function createStorageAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new AppError(
      "Supabase URL or service role key is not configured",
      500
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const POST = withErrorHandling(async (req: Request) => {
  await assertAdmin();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    throw new AppError("Could not parse form data", 400);
  }

  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;

  if (!file || !productId) {
    throw new AppError("file and productId are required", 400);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AppError(
      `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      400
    );
  }
  if (file.size > MAX_BYTES) {
    throw new AppError("File exceeds the 10 MB size limit", 400);
  }

  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const filename = `${createId()}_${Date.now()}.${ext}`;
  const storagePath = `products/${productId}/${filename}`;

  // Convert File → ArrayBuffer so the Storage SDK receives raw bytes
  // (avoids edge-case issues with the File object in some Node.js versions)
  const arrayBuffer = await file.arrayBuffer();

  const supabase = createStorageAdminClient();

  const { error } = await supabase.storage
    .from("surekh-assets")
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("[upload] storage error:", error.message);
    throw new AppError(`Storage error: ${error.message}`, 500, "STORAGE_ERROR");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("surekh-assets").getPublicUrl(storagePath);

  return NextResponse.json(
    { url: publicUrl, storagePath, filename },
    { status: 201 }
  );
});
