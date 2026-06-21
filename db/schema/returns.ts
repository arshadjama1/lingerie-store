import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { returnStatusEnum } from "./enums";
import { orders } from "./orders";
import { profiles } from "./users";

export const returnRequests = pgTable(
  "return_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id),
    reason: text("reason").notNull(),
    status: returnStatusEnum("status").default("requested").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("return_requests_order_idx").on(t.orderId),
    index("return_requests_user_idx").on(t.userId),
  ]
);

export const returnRequestsRelations = relations(returnRequests, ({ one }) => ({
  order: one(orders, {
    fields: [returnRequests.orderId],
    references: [orders.id],
  }),
  user: one(profiles, {
    fields: [returnRequests.userId],
    references: [profiles.id],
  }),
}));
