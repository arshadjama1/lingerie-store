ALTER TABLE "coupons"
  ADD COLUMN "is_first_order_only" boolean NOT NULL DEFAULT false,
  ADD COLUMN "applicable_category_id" text REFERENCES "categories"("id") ON DELETE SET NULL,
  ADD COLUMN "min_item_count" integer,
  ADD COLUMN "bundle_product_ids" text[];
