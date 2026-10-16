"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Banknote, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

interface AdminCollectCodButtonProps {
  orderId: string;
  orderNumber?: string;
  amount?: string;
  isCollected?: boolean;
}

export function AdminCollectCodButton({
  orderId,
  orderNumber = "this order",
  amount,
  isCollected = false,
}: AdminCollectCodButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);

  async function handleConfirmCollect() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/collect-cod`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to mark COD as collected");
        return;
      }
      toast.success(
        `COD payment${amount ? ` of ${amount}` : ""} marked as collected`
      );
      setIsCollectModalOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmRollback() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/rollback-cod`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to rollback COD collection");
        return;
      }
      toast.success(
        "COD collection rolled back — payment marked as pending collection"
      );
      setIsRollbackModalOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      {isCollected ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => setIsRollbackModalOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
            <span>Revert COD to Pending</span>
          </button>
          <p className="text-center text-[10px] text-gray-400">
            Click if cash was marked as collected by mistake
          </p>
        </>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => setIsCollectModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-none bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          <Banknote className="h-4 w-4" />
          <span>Collect COD Payment</span>
        </button>
      )}

      {/* COLLECT COD CONFIRMATION MODAL */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-amber-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <Banknote className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">
                  Confirm Cash Collection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCollectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              Confirm payment receipt for order <strong>{orderNumber}</strong>.
            </p>

            <div className="mt-3 rounded border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="font-semibold text-amber-950">
                Payment Verification
              </p>
              <p className="mt-1">
                Confirm that{" "}
                {amount ? (
                  <strong className="font-bold">{amount}</strong>
                ) : (
                  "the full order amount"
                )}{" "}
                in cash has been collected from the customer.
              </p>
              <p className="mt-2 text-[11px] text-amber-800/80">
                This will update the order payment status to{" "}
                <strong>Collected / Paid</strong>.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCollectModalOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmCollect}
                className="flex-1 bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Recording…
                  </span>
                ) : (
                  "Confirm Cash Collected"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVERT / ROLLBACK COD MODAL */}
      {isRollbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-gray-900">
                <RotateCcw className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">
                  Revert COD Collection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRollbackModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              Revert payment status for order <strong>{orderNumber}</strong>.
            </p>

            <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
              <p className="font-semibold text-gray-900">
                Mark as Pending Collection
              </p>
              <p className="mt-1">
                Are you sure you want to revert this COD payment back to{" "}
                <strong>Pending Collection</strong>? This will indicate that
                cash has not yet been received.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsRollbackModalOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmRollback}
                className="flex-1 bg-[#3d0a20] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#52102d] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Reverting…
                  </span>
                ) : (
                  "Revert to Pending"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
