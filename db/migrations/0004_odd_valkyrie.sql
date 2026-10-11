ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "storage_path" text;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN IF NOT EXISTS "cod_fee" numeric(10, 2);