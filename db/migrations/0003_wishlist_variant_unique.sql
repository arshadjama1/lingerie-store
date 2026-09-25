ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "wishlist_user_product_uq";--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_user_product_variant_uq" UNIQUE NULLS NOT DISTINCT ("user_id", "product_id", "variant_id");
