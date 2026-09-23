import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { carts } from "./cart";
import { coupons } from "./promotions";
import { addresses, profiles } from "./users";

export interface CheckoutLineItemSnapshot {
  variantId: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  total: number;
  snapshot: {
    productName: string;
    sku: string;
    size?: string;
    color?: string;
    imageUrl?: string;
    hsnCode?: string;
  };
}

export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id),
    addressId: text("address_id")
      .notNull()
      .references(() => addresses.id),
    couponId: text("coupon_id").references(() => coupons.id),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
    shippingAmount: decimal("shipping_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    razorpayOrderId: text("razorpay_order_id").unique(),
    orderId: text("order_id"),
    status: text("status").default("active").notNull(),
    lineItems: jsonb("line_items").$type<CheckoutLineItemSnapshot[]>(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("checkout_sessions_user_idx").on(t.userId),
    index("checkout_sessions_razorpay_idx").on(t.razorpayOrderId),
    index("checkout_sessions_expires_idx").on(t.expiresAt),
  ]
);

export const checkoutSessionsRelations = relations(
  checkoutSessions,
  ({ one }) => ({
    user: one(profiles, {
      fields: [checkoutSessions.userId],
      references: [profiles.id],
    }),
    cart: one(carts, {
      fields: [checkoutSessions.cartId],
      references: [carts.id],
    }),
    address: one(addresses, {
      fields: [checkoutSessions.addressId],
      references: [addresses.id],
    }),
    coupon: one(coupons, {
      fields: [checkoutSessions.couponId],
      references: [coupons.id],
    }),
  })
);

export type CheckoutSession = typeof checkoutSessions.$inferSelect;
export type NewCheckoutSession = typeof checkoutSessions.$inferInsert;
