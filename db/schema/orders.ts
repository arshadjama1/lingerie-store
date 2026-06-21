import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { productVariants } from "./catalog";
import { orderStatusEnum } from "./enums";
import { profiles } from "./users";

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderNumber: text("order_number").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    status: orderStatusEnum("status").default("pending").notNull(),
    shippingAddress: jsonb("shipping_address").notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    couponCode: varchar("coupon_code", { length: 50 }),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
    shippingAmount: decimal("shipping_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    shiprocketOrderId: text("shiprocket_order_id"),
    awbNumber: text("awb_number"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    confirmedAt: timestamp("confirmed_at", { mode: "date" }),
    shippedAt: timestamp("shipped_at", { mode: "date" }),
    deliveredAt: timestamp("delivered_at", { mode: "date" }),
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
  },
  (t) => [
    index("orders_user_created_idx").on(t.userId, t.createdAt),
    index("orders_status_created_idx").on(t.status, t.createdAt),
    index("orders_number_idx").on(t.orderNumber),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id),
    productSnapshot: jsonb("product_snapshot").notNull().$type<{
      productName: string;
      sku: string;
      size?: string;
      color?: string;
      imageUrl?: string;
      hsnCode?: string;
    }>(),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  },
  (t) => [index("order_items_order_id_idx").on(t.orderId)]
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note"),
    changedBy: uuid("changed_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("order_status_history_order_created_idx").on(t.orderId, t.createdAt),
  ]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(profiles, { fields: [orders.userId], references: [profiles.id] }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
    changedByUser: one(profiles, {
      fields: [orderStatusHistory.changedBy],
      references: [profiles.id],
    }),
  })
);
