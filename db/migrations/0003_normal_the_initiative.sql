ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "wishlist_user_product_uq";--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN IF NOT EXISTS "line_items" jsonb;--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_user_product_variant_uq') THEN
        ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_user_product_variant_uq" UNIQUE NULLS NOT DISTINCT ("user_id","product_id","variant_id");
    END IF;
END $$;