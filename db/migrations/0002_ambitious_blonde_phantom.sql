ALTER TABLE "coupons" ADD COLUMN "is_first_order_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "applicable_category_id" text;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "min_item_count" integer;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "bundle_product_ids" text[];--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "courier_name" text DEFAULT 'DTDC';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_label_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_metadata" jsonb;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_applicable_category_id_categories_id_fk" FOREIGN KEY ("applicable_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;