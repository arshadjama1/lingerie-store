import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
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

import { products } from "./catalog";
import { orders } from "./orders";
import { profiles } from "./users";

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    orderId: text("order_id").references(() => orders.id),
    rating: smallint("rating").notNull(),
    title: varchar("title", { length: 200 }),
    body: text("body"),
    fitFeedback: varchar("fit_feedback", { length: 20 }),
    imageUrls: text("image_urls").array().default([]),
    isApproved: boolean("is_approved").default(false).notNull(),
    helpfulCount: integer("helpful_count").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique("reviews_product_user_uq").on(t.productId, t.userId),
    index("reviews_product_approved_idx").on(t.productId, t.isApproved),
    check("rating_range", sql`${t.rating} BETWEEN 1 AND 5`),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(profiles, { fields: [reviews.userId], references: [profiles.id] }),
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
}));
