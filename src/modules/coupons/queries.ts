import { db } from "@/db";
import {
  couponUsage,
  coupons,
  orders,
  productVariants,
  products,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { and, count, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import "server-only";

import { getCart } from "@/modules/cart";

import type { CreateCouponInput, ValidatedCoupon } from "./index";
import { CouponError } from "./index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbTransaction = PgTransaction<any, any, any>;

// ─── validateCoupon ───────────────────────────────────────────────────────────

export async function validateCoupon(
  code: string,
  userId: string,
  cartSubtotal: number
): Promise<ValidatedCoupon> {
  // 1. Fetch coupon by code
  const coupon = await db.query.coupons.findFirst({
    where: and(
      eq(coupons.code, code.toUpperCase()),
      eq(coupons.isActive, true)
    ),
  });

  // 2. Not found
  if (!coupon) {
    throw new CouponError("Invalid coupon code");
  }

  const now = new Date();

  // 3. Not yet active
  if (coupon.startsAt > now) {
    throw new CouponError("Coupon is not yet active");
  }

  // 4. Expired
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new CouponError("Coupon has expired");
  }

  // 5. Max global uses exhausted
  if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
    throw new CouponError("Coupon has been fully redeemed");
  }

  // 6. Per-user limit check
  const [usageRow] = await db
    .select({ count: count() })
    .from(couponUsage)
    .where(
      and(eq(couponUsage.couponId, coupon.id), eq(couponUsage.userId, userId))
    );
  if ((usageRow?.count ?? 0) >= coupon.perUserLimit) {
    throw new CouponError("You have already used this coupon");
  }

  // 7. First-order-only check
  if (coupon.isFirstOrderOnly) {
    const [orderCountRow] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          notInArray(orders.status, ["cancelled", "refunded"])
        )
      );
    if ((orderCountRow?.count ?? 0) > 0) {
      throw new CouponError("This offer is only valid on your first order");
    }
  }

  // 8. Minimum order value
  const minOrderValue = Number(coupon.minOrderValue ?? 0);
  if (cartSubtotal < minOrderValue) {
    throw new CouponError(
      `Minimum order of ₹${minOrderValue.toLocaleString("en-IN")} required`
    );
  }

  // 9 & 10. Bundle / category checks — fetch cart lazily only when needed
  let cart: Awaited<ReturnType<typeof getCart>> | undefined;

  const hasBundleRule =
    coupon.bundleProductIds && coupon.bundleProductIds.length > 0;
  const hasCategoryRule = Boolean(coupon.applicableCategoryId);

  if (hasBundleRule || hasCategoryRule) {
    cart = await getCart({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new CouponError("Your cart is empty");
    }
  }

  // 9. Bundle check — all required products must be in cart
  if (hasBundleRule && cart) {
    // Resolve product IDs from cart variants
    const cartVariantIds = cart.items.map((i) => i.variantId);

    // Fetch product IDs for cart variants
    const variantRows =
      cartVariantIds.length > 0
        ? await db
            .select({
              id: productVariants.id,
              productId: productVariants.productId,
            })
            .from(productVariants)
            .where(inArray(productVariants.id, cartVariantIds))
        : [];

    const cartProductIds = new Set(variantRows.map((r) => r.productId));

    for (const requiredProductId of coupon.bundleProductIds!) {
      if (!cartProductIds.has(requiredProductId)) {
        throw new CouponError(
          "Add all required bundle items to qualify for this offer"
        );
      }
    }
  }

  // 10. Category check — minimum quantity of qualifying items
  let qualifyingSubtotal = 0;
  if (hasCategoryRule && cart) {
    // Resolve product categoryIds for all cart variants
    const cartVariantIds = cart.items.map((i) => i.variantId);
    const variantProductRows =
      cartVariantIds.length > 0
        ? await db
            .select({
              variantId: productVariants.id,
              categoryId: products.categoryId,
              price: productVariants.price,
            })
            .from(productVariants)
            .innerJoin(products, eq(productVariants.productId, products.id))
            .where(inArray(productVariants.id, cartVariantIds))
        : [];

    const variantCategoryMap = new Map(
      variantProductRows.map((r) => [r.variantId, r])
    );

    const minCount = coupon.minItemCount ?? 1;
    let qualifyingCount = 0;

    for (const item of cart.items) {
      const variantInfo = variantCategoryMap.get(item.variantId);
      if (variantInfo?.categoryId === coupon.applicableCategoryId) {
        qualifyingCount += item.quantity;
        qualifyingSubtotal += Number(variantInfo.price) * item.quantity;
      }
    }

    if (qualifyingCount < minCount) {
      throw new CouponError(
        `Add at least ${minCount} qualifying item${minCount > 1 ? "s" : ""} to use this coupon`
      );
    }
  }

  // 11. Calculate discount
  const value = Number(coupon.value);
  let discountAmount: number;

  if (coupon.type === "percentage") {
    const base = hasCategoryRule ? qualifyingSubtotal : cartSubtotal;
    const raw = (value / 100) * base;
    const cap =
      coupon.maxDiscount !== null ? Number(coupon.maxDiscount) : Infinity;
    discountAmount = Math.min(raw, cap);
  } else if (coupon.type === "fixed_amount") {
    discountAmount = Math.min(value, cartSubtotal);
  } else {
    throw new CouponError("Unsupported coupon type");
  }

  discountAmount = Number(discountAmount.toFixed(2));

  return {
    couponId: coupon.id,
    code: coupon.code,
    discountAmount,
    type: coupon.type === "percentage" ? "percentage" : "fixed",
    value,
  };
}

// ─── recordCouponUsage ────────────────────────────────────────────────────────

export async function recordCouponUsage(
  tx: DbTransaction,
  input: {
    couponId: string;
    userId: string;
    orderId: string;
    discount: number;
  }
): Promise<void> {
  await tx.insert(couponUsage).values({
    id: createId(),
    couponId: input.couponId,
    userId: input.userId,
    orderId: input.orderId,
    discount: input.discount.toString(),
  });

  await tx
    .update(coupons)
    .set({ usesCount: sql`${coupons.usesCount} + 1` })
    .where(eq(coupons.id, input.couponId));
}

// ─── getCouponCode ────────────────────────────────────────────────────────────

export async function getCouponCode(couponId: string): Promise<string | null> {
  const row = await db.query.coupons.findFirst({
    where: eq(coupons.id, couponId),
    columns: { code: true },
  });
  return row?.code ?? null;
}

// ─── listCoupons ──────────────────────────────────────────────────────────────

export async function listCoupons() {
  return db.query.coupons.findMany({
    orderBy: (c, { desc }) => [desc(c.startsAt)],
  });
}

// ─── createCoupon ─────────────────────────────────────────────────────────────

export async function createCoupon(input: CreateCouponInput) {
  const dbType =
    input.type === "fixed"
      ? ("fixed_amount" as const)
      : ("percentage" as const);

  const [coupon] = await db
    .insert(coupons)
    .values({
      code: input.code.toUpperCase(),
      name: input.name ?? null,
      type: dbType,
      value: input.value.toString(),
      minOrderValue: input.minOrderValue.toString(),
      maxDiscount: input.maxDiscount?.toString() ?? null,
      maxUses: input.maxUses ?? null,
      perUserLimit: input.perUserLimit,
      startsAt: new Date(input.startsAt),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      isActive: true,
      usesCount: 0,
      isFirstOrderOnly: input.isFirstOrderOnly,
      applicableCategoryId: input.applicableCategoryId ?? null,
      minItemCount: input.minItemCount ?? null,
      bundleProductIds: input.bundleProductIds?.length
        ? input.bundleProductIds
        : null,
    })
    .returning();

  return coupon;
}

// ─── deactivateCoupon ─────────────────────────────────────────────────────────

export async function deactivateCoupon(id: string): Promise<void> {
  await db.update(coupons).set({ isActive: false }).where(eq(coupons.id, id));
}
