import { db } from "@/db";
import {
  orderItems,
  orders,
  productVariants,
  products,
  profiles,
  reviews,
} from "@/db/schema";
import type { Review } from "@/db/types";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import "server-only";

import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";

import type {
  AdminReviewItem,
  AdminReviewsResult,
  CreateReviewInput,
  FitDistribution,
  FitFeedbackValue,
  ProductReviewsResult,
  RatingDistribution,
  ReviewWithUser,
} from "./types";

/**
 * Paginated approved reviews for a product, newest first.
 * Includes star rating breakdown (1–5) and fit feedback distribution.
 */
export async function listProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ProductReviewsResult> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(50, limit));
  const offset = (safePage - 1) * safeLimit;

  const whereCondition = and(
    eq(reviews.productId, productId),
    eq(reviews.isApproved, true)
  );

  const [reviewRows, countRow, ratingCounts, fitCounts] = await Promise.all([
    // Reviews with user profiles
    db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        orderId: reviews.orderId,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        fitFeedback: reviews.fitFeedback,
        imageUrls: reviews.imageUrls,
        isApproved: reviews.isApproved,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        userFirstName: profiles.firstName,
        userLastName: profiles.lastName,
      })
      .from(reviews)
      .leftJoin(profiles, eq(profiles.id, reviews.userId))
      .where(whereCondition)
      .orderBy(desc(reviews.createdAt))
      .limit(safeLimit)
      .offset(offset),

    // Total approved reviews count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(whereCondition),

    // Rating breakdown (1–5)
    db
      .select({
        rating: reviews.rating,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(whereCondition)
      .groupBy(reviews.rating),

    // Fit feedback breakdown
    db
      .select({
        fitFeedback: reviews.fitFeedback,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(and(whereCondition, isNotNull(reviews.fitFeedback)))
      .groupBy(reviews.fitFeedback),
  ]);

  const total = countRow[0]?.count ?? 0;
  const totalPages = Math.ceil(total / safeLimit) || 1;

  const ratingDistribution: RatingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const rc of ratingCounts) {
    if (rc.rating >= 1 && rc.rating <= 5) {
      ratingDistribution[rc.rating as 1 | 2 | 3 | 4 | 5] = rc.count;
    }
  }

  const fitDistribution: FitDistribution = {
    trueToSize: 0,
    runsSmall: 0,
    runsLarge: 0,
  };
  for (const fc of fitCounts) {
    if (fc.fitFeedback === "true_to_size") {
      fitDistribution.trueToSize = fc.count;
    } else if (fc.fitFeedback === "runs_small") {
      fitDistribution.runsSmall = fc.count;
    } else if (fc.fitFeedback === "runs_large") {
      fitDistribution.runsLarge = fc.count;
    }
  }

  const mappedReviews: ReviewWithUser[] = reviewRows.map((r) => ({
    id: r.id,
    productId: r.productId,
    userId: r.userId,
    orderId: r.orderId,
    rating: r.rating,
    title: r.title,
    body: r.body,
    fitFeedback: (r.fitFeedback as FitFeedbackValue) ?? null,
    imageUrls: r.imageUrls ?? [],
    isApproved: r.isApproved,
    helpfulCount: r.helpfulCount,
    createdAt: r.createdAt,
    user: {
      firstName: r.userFirstName,
      lastName: r.userLastName,
    },
  }));

  return {
    reviews: mappedReviews,
    total,
    page: safePage,
    totalPages,
    ratingDistribution,
    fitDistribution,
  };
}

/**
 * Checks order_items via variant_id → product_id join to verify
 * that the user has a delivered order containing this product.
 */
export async function isVerifiedPurchaser(
  userId: string,
  productId: string,
  orderId: string
): Promise<boolean> {
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.status, "delivered"),
        eq(productVariants.productId, productId),
        eq(orders.id, orderId)
      )
    )
    .limit(1);

  return rows.length > 0;
}

/**
 * True if user has an approved or pending review for this product.
 */
export async function hasUserReviewedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const rows = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
    .limit(1);

  return rows.length > 0;
}

/**
 * Insert a review row. Throws ForbiddenError if user is not a verified purchaser,
 * or ConflictError if the product was already reviewed by this user.
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  // 1. Verify purchaser gate
  const verified = await isVerifiedPurchaser(
    input.userId,
    input.productId,
    input.orderId
  );
  if (!verified) {
    throw new ForbiddenError(
      "You can only review products from delivered orders"
    );
  }

  // 2. Check duplicate
  const alreadyReviewed = await hasUserReviewedProduct(
    input.userId,
    input.productId
  );
  if (alreadyReviewed) {
    throw new ConflictError("You have already reviewed this product");
  }

  // 3. Insert review
  try {
    const [inserted] = await db
      .insert(reviews)
      .values({
        productId: input.productId,
        userId: input.userId,
        orderId: input.orderId,
        rating: input.rating,
        title: input.title ?? null,
        body: input.body ?? null,
        fitFeedback: input.fitFeedback ?? null,
        isApproved: false,
      })
      .returning();

    return inserted;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (
      error?.code === "23505" ||
      error?.message?.includes("reviews_product_user_uq")
    ) {
      throw new ConflictError("You have already reviewed this product");
    }
    throw err;
  }
}

/**
 * Admin: List reviews filtered by status (pending or approved).
 */
export async function listAdminReviews(opts: {
  status?: "pending" | "approved";
  page?: number;
  limit?: number;
}): Promise<AdminReviewsResult> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, Math.min(100, opts.limit ?? 20));
  const offset = (page - 1) * limit;

  const isApproved = opts.status === "approved";
  const whereCondition = eq(reviews.isApproved, isApproved);

  const [reviewRows, countRow] = await Promise.all([
    db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productName: products.name,
        productSlug: products.slug,
        userId: reviews.userId,
        customerEmail: profiles.email,
        customerFirstName: profiles.firstName,
        customerLastName: profiles.lastName,
        orderId: reviews.orderId,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        fitFeedback: reviews.fitFeedback,
        isApproved: reviews.isApproved,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(products, eq(products.id, reviews.productId))
      .leftJoin(profiles, eq(profiles.id, reviews.userId))
      .where(whereCondition)
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(whereCondition),
  ]);

  const total = countRow[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const mappedReviews: AdminReviewItem[] = reviewRows.map((r) => {
    const fullName = [r.customerFirstName, r.customerLastName]
      .filter(Boolean)
      .join(" ");

    return {
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      productSlug: r.productSlug,
      userId: r.userId,
      customerEmail: r.customerEmail,
      customerName: fullName || null,
      orderId: r.orderId,
      rating: r.rating,
      title: r.title,
      body: r.body,
      fitFeedback: r.fitFeedback,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
    };
  });

  return {
    reviews: mappedReviews,
    total,
    page,
    totalPages,
  };
}

/**
 * Admin: Approve a review. The DB trigger automatically recalculates
 * rating_avg and rating_count on products.
 */
export async function approveReview(id: string): Promise<Review> {
  const [updated] = await db
    .update(reviews)
    .set({ isApproved: true })
    .where(eq(reviews.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError("Review");
  }

  return updated;
}

/**
 * Admin: Reject a review (hard-delete for MVP).
 */
export async function rejectReview(id: string): Promise<{ id: string }> {
  const [deleted] = await db
    .delete(reviews)
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });

  if (!deleted) {
    throw new NotFoundError("Review");
  }

  return deleted;
}
