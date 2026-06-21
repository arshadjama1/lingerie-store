import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "staff", "admin"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "captured",
  "failed",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "upi",
  "card",
  "netbanking",
  "wallet",
  "cod",
]);

export const couponTypeEnum = pgEnum("coupon_type", [
  "percentage",
  "fixed_amount",
  "free_shipping",
]);

export const returnStatusEnum = pgEnum("return_status", [
  "requested",
  "approved",
  "rejected",
  "picked_up",
  "refunded",
]);
