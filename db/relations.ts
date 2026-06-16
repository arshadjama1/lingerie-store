import { relations } from "drizzle-orm";

import {
  addresses,
  brands,
  cartItems,
  carts,
  categories,
  checkoutSessions,
  couponUsage,
  coupons,
  inventory,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  productImages,
  productVariants,
  products,
  profiles,
  returnRequests,
  reviews,
  wishlistItems,
} from "./schema";

// ─── PROFILES ─────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  addresses: many(addresses),
  carts: many(carts),
  checkoutSessions: many(checkoutSessions),
  orders: many(orders),
  reviews: many(reviews),
  couponUsage: many(couponUsage),
  orderStatusHistory: many(orderStatusHistory),
  wishlistItems: many(wishlistItems),
  returnRequests: many(returnRequests),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(profiles, {
    fields: [addresses.userId],
    references: [profiles.id],
  }),
}));

// ─── CATEGORIES & BRANDS ───────────────────────────────────────────────────────

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

// ─── PRODUCTS ──────────────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
  wishlistItems: many(wishlistItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    inventory: one(inventory),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
    wishlistItems: many(wishlistItems),
  })
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventory.variantId],
    references: [productVariants.id],
  }),
}));

// ─── COUPONS ───────────────────────────────────────────────────────────────────

export const couponsRelations = relations(coupons, ({ many }) => ({
  carts: many(carts),
  checkoutSessions: many(checkoutSessions),
  couponUsage: many(couponUsage),
}));

// ─── CARTS ────────────────────────────────────────────────────────────────────

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(profiles, {
    fields: [carts.userId],
    references: [profiles.id],
  }),
  coupon: one(coupons, {
    fields: [carts.couponId],
    references: [coupons.id],
  }),
  items: many(cartItems),
  checkoutSessions: many(checkoutSessions),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

// ─── CHECKOUT SESSIONS ─────────────────────────────────────────────────────────

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

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(profiles, {
    fields: [orders.userId],
    references: [profiles.id],
  }),
  items: many(orderItems),
  payment: one(payments),
  statusHistory: many(orderStatusHistory),
  returnRequests: many(returnRequests),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
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

// ─── PAYMENTS ──────────────────────────────────────────────────────────────────

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// ─── COUPON USAGE ──────────────────────────────────────────────────────────────

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsage.couponId],
    references: [coupons.id],
  }),
  user: one(profiles, {
    fields: [couponUsage.userId],
    references: [profiles.id],
  }),
  order: one(orders, {
    fields: [couponUsage.orderId],
    references: [orders.id],
  }),
}));

// ─── REVIEWS ───────────────────────────────────────────────────────────────────

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(profiles, {
    fields: [reviews.userId],
    references: [profiles.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

// ─── WISHLIST ──────────────────────────────────────────────────────────────────

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(profiles, {
    fields: [wishlistItems.userId],
    references: [profiles.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [wishlistItems.variantId],
    references: [productVariants.id],
  }),
}));

// ─── RETURNS ───────────────────────────────────────────────────────────────────

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
