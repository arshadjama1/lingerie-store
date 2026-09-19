"use client";

import { useState } from "react";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ReturnRequestFormProps {
  orderId: string;
}

export function ReturnRequestForm({ orderId }: ReturnRequestFormProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reason.trim().length < 10) {
      toast.error("Please provide at least 10 characters for the reason");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to submit return request");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <RotateCcw className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Return request submitted
            </p>
            <p className="mt-0.5 text-xs text-emerald-600">
              Our team will review your request and be in touch within 2–3
              business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor={`return-reason-${orderId}`}
          className="block text-xs font-medium text-neutral-700"
        >
          Reason for return *
        </label>
        <textarea
          id={`return-reason-${orderId}`}
          rows={3}
          required
          minLength={10}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please describe why you'd like to return this order..."
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-neutral-400">
          {reason.length}/10 characters minimum
        </p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || reason.trim().length < 10}
        className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" />
        {isSubmitting ? "Submitting..." : "Submit Return Request"}
      </button>
    </form>
  );
}
