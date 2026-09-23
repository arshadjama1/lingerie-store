export type FitFeedbackValue = "true_to_size" | "runs_small" | "runs_large";

export interface ReviewUser {
  firstName: string | null;
  lastName: string | null;
}

export interface ReviewWithUser {
  id: string;
  productId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  fitFeedback: FitFeedbackValue | null;
  imageUrls: string[];
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  user: ReviewUser;
}

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export interface FitDistribution {
  trueToSize: number;
  runsSmall: number;
  runsLarge: number;
}

export interface ProductReviewsResult {
  reviews: ReviewWithUser[];
  total: number;
  page: number;
  totalPages: number;
  ratingDistribution: RatingDistribution;
  fitDistribution: FitDistribution;
}

export interface CreateReviewInput {
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  title?: string;
  body?: string;
  fitFeedback?: FitFeedbackValue;
}

export interface AdminReviewItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  userId: string;
  customerEmail: string | null;
  customerName: string | null;
  orderId: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  fitFeedback: string | null;
  isApproved: boolean;
  createdAt: Date;
}

export interface AdminReviewsResult {
  reviews: AdminReviewItem[];
  total: number;
  page: number;
  totalPages: number;
}
