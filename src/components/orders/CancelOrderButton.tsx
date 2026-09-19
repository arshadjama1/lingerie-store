"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { XCircle } from "lucide-react";
import { toast } from "sonner";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to cancel order");
        return;
      }

      toast.success(`Order ${data.orderNumber} has been cancelled`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Are you sure you want to cancel this order?
        </p>
        <p className="mt-1 text-xs text-red-600">
          This action cannot be undone. Inventory will be restocked.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Order"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Keep Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
    >
      <XCircle className="h-4 w-4" />
      Cancel Order
    </button>
  );
}
