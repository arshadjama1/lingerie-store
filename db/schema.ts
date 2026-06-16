import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

// ─── ENUMS ───────────────────────────────────────────────────────────────────

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

// ─── USERS ────────────────────────────────────────────────────────────────────

export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(), // mirrors auth.users.id
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).unique(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").default("customer").notNull(),
    loyaltyPoints: integer("loyalty_points").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("profiles_email_idx").on(t.email),
    index("profiles_phone_idx").on(t.phone),
    index("profiles_role_idx").on(t.role),
  ]
);

export const addresses = pgTable(
  "addresses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 50 }).default("home"),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    pincode: varchar("pincode", { length: 10 }).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("addresses_user_id_idx").on(t.userId)]
);

// ─── CATALOG ──────────────────────────────────────────────────────────────────

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    path: varchar("path", { length: 500 }).notNull(), // e.g. "women/lingerie/bras"
    parentId: text("parent_id").references((): AnyPgColumn => categories.id),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
  },
  (t) => [
    index("categories_path_idx").on(t.path),
    index("categories_parent_idx").on(t.parentId),
  ]
);

export const brands = pgTable(
  "brands",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    logoUrl: text("logo_url"),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => [index("brands_slug_idx").on(t.slug)]
);

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    name: varchar("name", { length: 500 }).notNull(),
    description: text("description"),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    categoryPath: varchar("category_path", { length: 500 }).notNull(),
    brandId: text("brand_id").references(() => brands.id),
    attributes: jsonb("attributes").default({}).notNull(),
    tags: text("tags").array().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    soldCount: integer("sold_count").default(0).notNull(),
    ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 })
      .default("0")
      .notNull(),
    ratingCount: integer("rating_count").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDesc: text("meta_desc"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("products_category_path_active_idx").on(t.categoryPath, t.isActive),
    index("products_brand_active_idx").on(t.brandId, t.isActive),
    index("products_active_featured_idx").on(t.isActive, t.isFeatured),
    index("products_slug_idx").on(t.slug),
    index("products_sold_count_idx").on(t.soldCount),
  ]
);

// Separate table — NOT JSONB on products.
// Enables: per-image sorting, primary image index, individual URL updates.
export const productImages = pgTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
  },
  (t) => [index("product_images_product_sort_idx").on(t.productId, t.sortOrder)]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    size: varchar("size", { length: 50 }),
    color: varchar("color", { length: 50 }),
    colorHex: varchar("color_hex", { length: 7 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
    weightGrams: integer("weight_grams"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("variants_product_active_idx").on(t.productId, t.isActive),
    index("variants_sku_idx").on(t.sku),
  ]
);

// Separate from variants: reserved_quantity is the key field that prevents
// overselling under concurrent checkout load. Kept separate so future
// multi-warehouse support only requires adding warehouse_id here.
export const inventory = pgTable(
  "inventory",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    variantId: text("variant_id")
      .notNull()
      .unique()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").default(0).notNull(),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    lowStockAlert: integer("low_stock_alert").default(5).notNull(),
  },
  (t) => [index("inventory_variant_idx").on(t.variantId)]
);

// ─── COUPONS (before carts — carts.couponId references this) ─────────────────

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
  },
  (t) => [index("coupons_code_active_idx").on(t.code, t.isActive)]
);

// ─── CART ─────────────────────────────────────────────────────────────────────

export const carts = pgTable("carts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .unique()
    .references(() => profiles.id, { onDelete: "cascade" }),
  sessionId: text("session_id").unique(), // httpOnly cookie for guest carts
  couponId: text("coupon_id").references(() => coupons.id),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

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

// ─── CHECKOUT SESSIONS ────────────────────────────────────────────────────────

export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
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
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("checkout_sessions_user_idx").on(t.userId),
    index("checkout_sessions_razorpay_idx").on(t.razorpayOrderId),
  ]
);

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
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
    changedBy: text("changed_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("order_status_history_order_created_idx").on(t.orderId, t.createdAt),
  ]
);

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id),
    razorpayOrderId: text("razorpay_order_id").notNull().unique(),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    razorpaySignature: text("razorpay_signature"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    method: varchar("method", { length: 50 }),
    failureReason: text("failure_reason"),
    refundId: text("refund_id"),
    refundedAt: timestamp("refunded_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("payments_razorpay_order_idx").on(t.razorpayOrderId),
    index("payments_razorpay_payment_idx").on(t.razorpayPaymentId),
  ]
);

// ─── COUPON USAGE ─────────────────────────────────────────────────────────────

export const couponUsage = pgTable(
  "coupon_usage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id),
    userId: text("user_id")
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

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id),
    orderId: text("order_id").references(() => orders.id),
    rating: smallint("rating").notNull(),
    title: varchar("title", { length: 200 }),
    body: text("body"),
    fitFeedback: varchar("fit_feedback", { length: 20 }),
    imageUrls: text("image_urls").array().default([]).notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    helpfulCount: integer("helpful_count").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique("reviews_product_user_uq").on(t.productId, t.userId),
    index("reviews_product_approved_idx").on(t.productId, t.isApproved),
  ]
);

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    addedAt: timestamp("added_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique("wishlist_user_product_uq").on(t.userId, t.productId),
    index("wishlist_user_idx").on(t.userId),
  ]
);

// ─── RETURNS ──────────────────────────────────────────────────────────────────

export const returnRequests = pgTable(
  "return_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    userId: text("user_id")
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
