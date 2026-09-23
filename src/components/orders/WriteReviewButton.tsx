"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Star, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";

const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Please select a rating between 1 and 5")
    .max(5),
  fitFeedback: z.enum(["true_to_size", "runs_small", "runs_large"]).optional(),
  title: z.string().max(200, "Title cannot exceed 200 characters").optional(),
  body: z.string().max(2000, "Review cannot exceed 2000 characters").optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface WriteReviewButtonProps {
  productId: string;
  productName: string;
  orderId: string;
  alreadyReviewed: boolean;
}

export function WriteReviewButton({
  productId,
  productName,
  orderId,
  alreadyReviewed: initialReviewed,
}: WriteReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewed, setIsReviewed] = useState(initialReviewed);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      body: "",
    },
  });

  const selectedRating = watch("rating");
  const selectedFit = watch("fitFeedback");

  // Prevent background scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOpen = () => {
    reset({
      rating: 0,
      title: "",
      body: "",
      fitFeedback: undefined,
    });
    setFormError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormError(null);
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!data.rating || data.rating < 1) {
      setFormError("Please select a star rating");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId,
          rating: data.rating,
          title: data.title?.trim() || undefined,
          body: data.body?.trim() || undefined,
          fitFeedback: data.fitFeedback || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error || "Failed to submit review");
        return;
      }

      toast.success("Thank you! Your review was submitted for approval.");
      setIsReviewed(true);
      setIsOpen(false);
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReviewed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-none border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        <Check className="h-3.5 w-3.5 text-emerald-600" />
        Review submitted
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-none border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold tracking-wider text-gray-800 uppercase shadow-2xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Star className="h-3.5 w-3.5" />
        Write a Review
      </button>

      {/* Dialog Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-none border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 cursor-pointer p-1 text-gray-400 transition-colors hover:text-gray-700"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <div>
              <span className="text-[10px] font-black tracking-widest text-[var(--accent)] uppercase">
                VERIFIED PURCHASE REVIEW
              </span>
              <h3
                id="review-dialog-title"
                className="mt-0.5 font-serif text-lg font-bold text-gray-900 sm:text-xl"
              >
                Write a Review — {productName}
              </h3>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mt-4 rounded-none border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = hoverRating || selectedRating;
                    const isFilled = activeRating >= star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setValue("rating", star, { shouldValidate: true });
                          setFormError(null);
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="cursor-pointer p-1 transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={cn(
                            "h-7 w-7 transition-colors",
                            isFilled
                              ? "fill-[var(--accent)] text-[var(--accent)]"
                              : "text-gray-300 hover:text-gray-400"
                          )}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-semibold text-gray-600">
                    {selectedRating > 0
                      ? `${selectedRating} of 5 stars`
                      : "Select rating"}
                  </span>
                </div>
                {errors.rating && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              {/* Fit Feedback */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                  Fit Feedback
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { value: "true_to_size", label: "True to size" },
                      { value: "runs_small", label: "Runs small" },
                      { value: "runs_large", label: "Runs large" },
                    ] as const
                  ).map((option) => {
                    const isSelected = selectedFit === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue(
                            "fitFeedback",
                            isSelected ? undefined : option.value
                          );
                        }}
                        className={cn(
                          "cursor-pointer rounded-none border px-3 py-1.5 text-xs font-medium shadow-2xs transition-all",
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="review-title"
                  className="block text-xs font-bold tracking-wider text-gray-700 uppercase"
                >
                  Title (optional)
                </label>
                <input
                  id="review-title"
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Incredibly soft and true to size!"
                  {...register("title")}
                  className="mt-1.5 block w-full rounded-none border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
              </div>

              {/* Body */}
              <div>
                <label
                  htmlFor="review-body"
                  className="block text-xs font-bold tracking-wider text-gray-700 uppercase"
                >
                  Your Review (optional)
                </label>
                <textarea
                  id="review-body"
                  rows={4}
                  maxLength={2000}
                  placeholder="Share details about the fit, comfort, material, or quality..."
                  {...register("body")}
                  className="mt-1.5 block w-full rounded-none border border-gray-300 bg-white p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-none border border-gray-300 bg-white px-4 py-2 text-xs font-bold tracking-wider text-gray-700 uppercase transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-none border border-[var(--accent)] bg-[var(--accent)] px-5 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-colors hover:bg-[var(--accent-plum)] disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
