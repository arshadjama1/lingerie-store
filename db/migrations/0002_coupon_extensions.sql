ALTER TABLE "coupons"
  ADD COLUMN IF NOT EXISTS "is_first_order_only" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "applicable_category_id" text REFERENCES "categories"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "min_item_count" integer,
  ADD COLUMN IF NOT EXISTS "bundle_product_ids" text[];
