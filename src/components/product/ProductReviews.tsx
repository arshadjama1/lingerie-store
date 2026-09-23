import { CheckCircle2, ShieldCheck, Star } from "lucide-react";

import { listProductReviews } from "@/modules/reviews";

import { Pagination } from "@/components/common/pagination";
import { ReviewBody } from "@/components/product/ReviewBody";
import { RatingStars } from "@/components/product/rating-stars";

interface ProductReviewsProps {
  productId: string;
  page?: number;
}

const FIT_LABELS: Record<string, string> = {
  true_to_size: "True to size",
  runs_small: "Runs small",
  runs_large: "Runs large",
};

function formatReviewerName(
  firstName: string | null,
  lastName: string | null
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  }
  if (firstName) {
    return firstName;
  }
  return "Verified Customer";
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function ProductReviews({
  productId,
  page = 1,
}: ProductReviewsProps) {
  const pageSize = 5;
  const { reviews, total, totalPages, ratingDistribution, fitDistribution } =
    await listProductReviews(productId, page, pageSize);

  // Calculate weighted average rating
  const avgRating =
    total > 0
      ? (
          (ratingDistribution[5] * 5 +
            ratingDistribution[4] * 4 +
            ratingDistribution[3] * 3 +
            ratingDistribution[2] * 2 +
            ratingDistribution[1] * 1) /
          total
        ).toFixed(1)
      : "0.0";

  const totalFitVotes =
    fitDistribution.trueToSize +
    fitDistribution.runsSmall +
    fitDistribution.runsLarge;

  return (
    <section id="customer-reviews" className="space-y-8">
      {/* Section Header */}
      <div>
        <span className="mb-1 inline-block rounded-none bg-[var(--accent-subtle)] px-3 py-1 text-[10px] font-black tracking-widest text-[var(--accent)] uppercase shadow-xs">
          VERIFIED FEEDBACK
        </span>
        <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--accent-plum)] uppercase sm:text-3xl">
          Customer Reviews
        </h2>
      </div>

      {total === 0 ? (
        <div className="rounded-none border border-dashed border-gray-200 bg-[var(--surface)] p-8 text-center sm:p-12">
          <Star className="mx-auto h-8 w-8 text-gray-300" />
          <h3 className="mt-3 text-sm font-bold text-gray-900">
            No reviews yet
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Be the first to review this product after your order is delivered.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Rating Summary Bar */}
          <div className="rounded-none border border-gray-100 bg-[var(--surface)] p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
              {/* Left Column: Big Score */}
              <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-6 text-center md:col-span-4 md:border-r md:border-b-0 md:pr-8 md:pb-0">
                <div className="font-serif text-5xl font-black text-[var(--accent-plum)]">
                  {avgRating}
                </div>
                <div className="mt-2">
                  <RatingStars
                    rating={parseFloat(avgRating)}
                    size="md"
                    className="justify-center"
                  />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-gray-500">
                  Based on {total} {total === 1 ? "review" : "reviews"}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>100% Verified Purchasers</span>
                </div>
              </div>

              {/* Right Column: Star Breakdown Bars */}
              <div className="space-y-2 md:col-span-8">
                {([5, 4, 3, 2, 1] as const).map((stars) => {
                  const count = ratingDistribution[stars] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div
                      key={stars}
                      className="flex items-center gap-3 text-xs"
                    >
                      <span className="flex w-7 shrink-0 items-center justify-end font-semibold text-gray-700">
                        {stars}★
                      </span>
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200/70">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-medium text-gray-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fit Feedback Pills */}
            {totalFitVotes > 0 && (
              <div className="mt-6 border-t border-gray-200/70 pt-5">
                <p className="mb-2 text-xs font-bold tracking-wider text-gray-600 uppercase">
                  Fit Feedback
                </p>
                <div className="flex flex-wrap gap-2">
                  {fitDistribution.trueToSize > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-none border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-2xs">
                      <span>True to size</span>
                      <span className="font-bold text-[var(--accent)]">
                        ({fitDistribution.trueToSize})
                      </span>
                    </span>
                  )}
                  {fitDistribution.runsSmall > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-none border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-2xs">
                      <span>Runs small</span>
                      <span className="font-bold text-[var(--accent)]">
                        ({fitDistribution.runsSmall})
                      </span>
                    </span>
                  )}
                  {fitDistribution.runsLarge > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-none border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-800 shadow-2xs">
                      <span>Runs large</span>
                      <span className="font-bold text-[var(--accent)]">
                        ({fitDistribution.runsLarge})
                      </span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => {
              const reviewerName = formatReviewerName(
                review.user.firstName,
                review.user.lastName
              );
              return (
                <article key={review.id} className="py-6 first:pt-0 last:pb-0">
                  <div className="space-y-2.5">
                    {/* Stars & Title */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <RatingStars rating={review.rating} size="sm" />
                      {review.title && (
                        <h4 className="text-sm font-bold text-gray-900">
                          {review.title}
                        </h4>
                      )}
                    </div>

                    {/* Review Body */}
                    {review.body && <ReviewBody body={review.body} />}

                    {/* Fit tag if present */}
                    {review.fitFeedback && (
                      <div>
                        <span className="inline-block rounded-none border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                          Fit:{" "}
                          {FIT_LABELS[review.fitFeedback] ?? review.fitFeedback}
                        </span>
                      </div>
                    )}

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500">
                      <span className="font-medium text-gray-900">
                        {reviewerName}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Verified Purchase
                      </span>
                      <span>·</span>
                      <time dateTime={review.createdAt.toISOString()}>
                        {formatDate(review.createdAt)}
                      </time>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              buildUrl={(p) => `?reviewPage=${p}#customer-reviews`}
              className="mt-8 border-t border-gray-100 pt-6"
            />
          )}
        </div>
      )}
    </section>
  );
}
