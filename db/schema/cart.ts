import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { productVariants } from "./catalog";
import { coupons } from "./promotions";
import { profiles } from "./users";

export const carts = pgTable(
  "carts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: uuid("user_id")
      .unique()
      .references(() => profiles.id, { onDelete: "cascade" }),
    sessionId: text("session_id").unique(),
    couponId: text("coupon_id").references(() => coupons.id),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("carts_session_id_idx").on(t.sessionId)]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
    priceAtAddition: decimal("price_at_addition", {
      precision: 10,
      scale: 2,
    }).notNull(),
    addedAt: timestamp("added_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique("cart_items_cart_variant_uq").on(t.cartId, t.variantId),
    index("cart_items_cart_id_idx").on(t.cartId),
  ]
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(profiles, { fields: [carts.userId], references: [profiles.id] }),
  coupon: one(coupons, { fields: [carts.couponId], references: [coupons.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
