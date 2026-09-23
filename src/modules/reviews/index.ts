import { z } from "zod";

import {
  approveReview,
  createReview,
  hasUserReviewedProduct,
  isVerifiedPurchaser,
  listAdminReviews,
  listProductReviews,
  rejectReview,
} from "./queries";
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

// ── Zod Schemas ──────────────────────────────────────────────────────

export const fitFeedbackSchema = z.enum([
  "true_to_size",
  "runs_small",
  "runs_large",
]);

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  userId: z.string().uuid("Invalid user ID"),
  orderId: z.string().min(1, "Order ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .trim()
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  body: z
    .string()
    .trim()
    .max(2000, "Review cannot exceed 2000 characters")
    .optional(),
  fitFeedback: fitFeedbackSchema.optional(),
});

export const listProductReviewsSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

export const listAdminReviewsSchema = z.object({
  status: z.enum(["pending", "approved"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

// ── Public Module API ────────────────────────────────────────────────

export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ProductReviewsResult> {
  const parsed = listProductReviewsSchema.parse({ productId, page, limit });
  return listProductReviews(parsed.productId, parsed.page, parsed.limit);
}

export async function submitReview(input: CreateReviewInput) {
  const parsed = createReviewSchema.parse(input);
  return createReview(parsed);
}

export async function getAdminReviews(opts?: {
  status?: "pending" | "approved";
  page?: number;
  limit?: number;
}): Promise<AdminReviewsResult> {
  const parsed = listAdminReviewsSchema.parse(opts ?? {});
  return listAdminReviews(parsed);
}

export async function adminApproveReview(id: string) {
  const validId = z.string().min(1).parse(id);
  return approveReview(validId);
}

export async function adminRejectReview(id: string) {
  const validId = z.string().min(1).parse(id);
  return rejectReview(validId);
}

// Re-export queries and types for direct or specialized usage
export {
  approveReview,
  createReview,
  hasUserReviewedProduct,
  isVerifiedPurchaser,
  listAdminReviews,
  listProductReviews,
  rejectReview,
};

export type {
  AdminReviewItem,
  AdminReviewsResult,
  CreateReviewInput,
  FitDistribution,
  FitFeedbackValue,
  ProductReviewsResult,
  RatingDistribution,
  ReviewWithUser,
};
