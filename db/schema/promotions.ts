import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { categories } from "./catalog";
import { couponTypeEnum } from "./enums";
import { orders } from "./orders";
import { profiles } from "./users";

export const coupons = pgTable(
  "coupons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    type: couponTypeEnum("type").notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    minOrderValue: decimal("min_order_value", {
      precision: 10,
      scale: 2,
    }).default("0"),
    maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
    maxUses: integer("max_uses"),
    usesCount: integer("uses_count").default(0).notNull(),
    perUserLimit: smallint("per_user_limit").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    // Extended coupon rule fields
    isFirstOrderOnly: boolean("is_first_order_only").default(false).notNull(),
    applicableCategoryId: text("applicable_category_id").references(
      () => categories.id,
      { onDelete: "set null" }
    ),
    minItemCount: integer("min_item_count"),
    bundleProductIds: text("bundle_product_ids").array(),
  },
  (t) => [index("coupons_code_active_idx").on(t.code, t.isActive)]
);

export const couponUsage = pgTable(
  "coupon_usage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id),
    discount: decimal("discount", { precision: 10, scale: 2 }).notNull(),
    usedAt: timestamp("used_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique("coupon_usage_coupon_user_uq").on(t.couponId, t.userId),
    index("coupon_usage_user_idx").on(t.userId),
  ]
);

export const couponsRelations = relations(coupons, ({ many }) => ({
  usages: many(couponUsage),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsage.couponId],
    references: [coupons.id],
  }),
  order: one(orders, {
    fields: [couponUsage.orderId],
    references: [orders.id],
  }),
}));
