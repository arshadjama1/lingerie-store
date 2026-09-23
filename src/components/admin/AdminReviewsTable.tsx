"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Check, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { AdminReviewItem } from "@/modules/reviews";

import { RatingStars } from "@/components/product/rating-stars";

interface AdminReviewsTableProps {
  initialReviews: AdminReviewItem[];
  status: "pending" | "approved";
}

export function AdminReviewsTable({
  initialReviews,
  status,
}: AdminReviewsTableProps) {
  const router = useRouter();
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || `Failed to ${action} review`);
        return;
      }

      toast.success(
        action === "approve"
          ? "Review approved and published!"
          : "Review rejected and removed."
      );

      // Optimistically remove from current view
      setReviewsList((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (reviewsList.length === 0) {
    return (
      <div className="rounded-none border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-gray-700">
          No {status} reviews found
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {status === "pending"
            ? "All submitted reviews have been moderated."
            : "No approved reviews yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-none border border-gray-200 bg-white shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          <tr>
            <th className="px-4 py-3 sm:px-6">Product</th>
            <th className="px-4 py-3 sm:px-6">Review</th>
            <th className="px-4 py-3 sm:px-6">Rating</th>
            <th className="px-4 py-3 sm:px-6">Customer</th>
            <th className="px-4 py-3 sm:px-6">Submitted</th>
            <th className="px-4 py-3 text-right sm:px-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reviewsList.map((review) => {
            const isProcessing = processingId === review.id;

            return (
              <tr
                key={review.id}
                className="transition-colors hover:bg-gray-50/50"
              >
                {/* Product Column */}
                <td className="px-4 py-4 sm:px-6">
                  <div className="font-semibold text-gray-900">
                    {review.productName}
                  </div>
                  <Link
                    href={`/p/${review.productSlug}`}
                    target="_blank"
                    className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
                  >
                    View Product
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>

                {/* Review Column */}
                <td className="max-w-xs px-4 py-4 sm:px-6">
                  {review.title && (
                    <div className="font-bold text-gray-900">
                      {review.title}
                    </div>
                  )}
                  {review.body ? (
                    <p className="mt-0.5 line-clamp-2 text-gray-600">
                      {review.body}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">No text provided</p>
                  )}
                  {review.fitFeedback && (
                    <div className="mt-1">
                      <span className="inline-block rounded-none border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        Fit: {review.fitFeedback.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                </td>

                {/* Rating Column */}
                <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                  <RatingStars rating={review.rating} size="sm" />
                </td>

                {/* Customer Column */}
                <td className="px-4 py-4 sm:px-6">
                  {review.customerName && (
                    <div className="font-medium text-gray-900">
                      {review.customerName}
                    </div>
                  )}
                  <div className="text-[11px] text-gray-500">
                    {review.customerEmail || "No email"}
                  </div>
                </td>

                {/* Submitted Date */}
                <td className="px-4 py-4 whitespace-nowrap text-gray-500 sm:px-6">
                  <div>
                    {new Date(review.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(review.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right whitespace-nowrap sm:px-6">
                  {status === "pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(review.id, "approve")}
                        disabled={isProcessing}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(review.id, "reject")}
                        disabled={isProcessing}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-2xs transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <Check className="h-3 w-3" />
                        Live
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAction(review.id, "reject")}
                        disabled={isProcessing}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-2xs transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                        title="Delete review"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
