"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  Loader2,
  Package,
  RotateCcw,
  ShieldAlert,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { VALID_TRANSITIONS } from "@/modules/orders/transitions";
import type { OrderStatus } from "@/modules/orders/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-gray-100 text-gray-700 border-gray-300",
  confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  processing: "bg-amber-100 text-amber-700 border-amber-300",
  shipped: "bg-violet-100 text-violet-700 border-violet-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  refunded: "bg-orange-100 text-orange-700 border-orange-300",
};

interface AdminStatusFormProps {
  orderId: string;
  currentStatus: OrderStatus;
  orderNumber?: string;
  currentAwb?: string | null;
  totalAmount?: string;
  previousStatus?: OrderStatus;
}

export function AdminStatusForm({
  orderId,
  currentStatus,
  orderNumber = "this order",
  currentAwb,
  totalAmount,
  previousStatus,
}: AdminStatusFormProps) {
  const router = useRouter();
  const validNext = VALID_TRANSITIONS[currentStatus] ?? [];

  // Default happy path next status
  const primaryNext = validNext.find(
    (s) => s !== "cancelled" && s !== "refunded"
  );

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    primaryNext ?? validNext[0] ?? currentStatus
  );
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [manualAwbInput, setManualAwbInput] = useState("");

  const [showManualSelect, setShowManualSelect] = useState(false);

  // Rollback logic
  const canRollback =
    currentStatus !== "pending" && currentStatus !== "refunded";

  const rollbackTarget: OrderStatus =
    currentStatus === "confirmed"
      ? "pending"
      : currentStatus === "processing"
        ? "confirmed"
        : currentStatus === "shipped"
          ? "processing"
          : currentStatus === "delivered"
            ? "shipped"
            : (previousStatus ?? "pending");

  useEffect(() => {
    const next =
      validNext.find((s) => s !== "cancelled" && s !== "refunded") ??
      validNext[0];
    if (next) {
      setSelectedStatus(next);
    }
  }, [currentStatus]);

  async function executeStatusUpdate(
    targetStatus: OrderStatus,
    optionalAwb?: string
  ) {
    setLoading(true);
    try {
      if (targetStatus === "shipped" && optionalAwb && optionalAwb.trim()) {
        try {
          await fetch(`/api/admin/orders/${orderId}/awb`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              awbNumber: optionalAwb.trim(),
              markAsShipped: false,
            }),
          });
        } catch {
          // Proceed with status update even if separate AWB endpoint failed
        }
      }

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update status");
        return;
      }

      toast.success(
        `Order ${orderNumber} updated to "${STATUS_LABELS[targetStatus]}"`
      );
      setIsCancelModalOpen(false);
      setIsRefundModalOpen(false);
      setIsShipModalOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error — please check your connection");
    } finally {
      setLoading(false);
    }
  }

  async function executeRollback() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/rollback-status`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to rollback order status");
        return;
      }

      toast.success(
        `Order status rolled back to "${
          STATUS_LABELS[data.previousStatus as OrderStatus] ??
          data.previousStatus
        }"`
      );
      setIsRollbackModalOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error during status rollback");
    } finally {
      setLoading(false);
    }
  }

  function handlePrimaryClick() {
    if (!primaryNext) return;

    if (primaryNext === "shipped" && !currentAwb) {
      setIsShipModalOpen(true);
      return;
    }

    executeStatusUpdate(primaryNext);
  }

  if (validNext.length === 0 && !canRollback) {
    return (
      <div className="rounded-none border border-gray-200 bg-gray-50/70 p-4 text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Final Order State
        </p>
        <p className="mt-1 text-sm text-gray-700">
          This order is in a terminal status (
          <span className="font-semibold capitalize">{currentStatus}</span>).
          Live payment refund was finalized and inventory was restocked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status Pill */}
      <div className="flex items-center justify-between rounded-none border border-gray-100 bg-gray-50/60 p-3">
        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Current Status
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
            STATUS_BADGE_CLASSES[currentStatus]
          }`}
        >
          {STATUS_LABELS[currentStatus]}
        </span>
      </div>

      {/* Primary Action Button (The "Happy Path" Forward) */}
      {primaryNext && (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Recommended Action
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={handlePrimaryClick}
            className="group flex w-full items-center justify-between border border-[#3d0a20] bg-[#3d0a20] px-4 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#52102d] disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : primaryNext === "confirmed" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : primaryNext === "processing" ? (
                <Package className="h-4 w-4" />
              ) : primaryNext === "shipped" ? (
                <Truck className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>
                {primaryNext === "confirmed"
                  ? "Confirm Order"
                  : primaryNext === "processing"
                    ? "Move to Processing"
                    : primaryNext === "shipped"
                      ? "Mark as Shipped"
                      : "Mark as Delivered"}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Secondary & Rollback Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Rollback Status Button */}
        {canRollback && (
          <button
            type="button"
            onClick={() => setIsRollbackModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-1.5 border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
            <span>
              {currentStatus === "cancelled"
                ? `Restore to ${STATUS_LABELS[rollbackTarget]}`
                : `Rollback to ${STATUS_LABELS[rollbackTarget]}`}
            </span>
          </button>
        )}

        {validNext.includes("cancelled") && (
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-1.5 border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Ban className="h-3.5 w-3.5 text-red-600" />
            Cancel Order
          </button>
        )}

        {validNext.includes("refunded") && (
          <button
            type="button"
            onClick={() => setIsRefundModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-1.5 border border-orange-300 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-orange-600" />
            Issue Refund
          </button>
        )}

        {validNext.length > 1 && (
          <button
            type="button"
            onClick={() => setShowManualSelect(!showManualSelect)}
            className="ml-auto text-xs text-gray-500 underline hover:text-gray-800"
          >
            {showManualSelect ? "Hide Status List" : "Other Status"}
          </button>
        )}
      </div>

      {/* Manual Status Select */}
      {showManualSelect && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedStatus === "cancelled") {
              setIsCancelModalOpen(true);
            } else if (selectedStatus === "refunded") {
              setIsRefundModalOpen(true);
            } else if (selectedStatus === "shipped" && !currentAwb) {
              setIsShipModalOpen(true);
            } else {
              executeStatusUpdate(selectedStatus);
            }
          }}
          className="space-y-3 rounded-none border border-gray-200 bg-gray-50/50 p-3 pt-3"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Select Target Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full border border-gray-200 bg-white px-3 py-2 text-xs focus:border-[#3d0a20] focus:outline-none"
            >
              {validNext.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-gray-400 bg-white px-3 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-100 disabled:opacity-50"
          >
            {loading
              ? "Updating…"
              : `Change Status to ${STATUS_LABELS[selectedStatus]}`}
          </button>
        </form>
      )}

      {/* ROLLBACK STATUS MODAL */}
      {isRollbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-gray-900">
                <RotateCcw className="h-5 w-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">
                  {currentStatus === "cancelled"
                    ? `Restore Order ${orderNumber}`
                    : `Rollback Status to ${STATUS_LABELS[rollbackTarget]}`}
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

            <p className="mt-3 text-xs leading-relaxed text-gray-600">
              Are you sure you want to revert {orderNumber} from{" "}
              <strong className="capitalize">{currentStatus}</strong> back to{" "}
              <strong className="capitalize">
                {STATUS_LABELS[rollbackTarget]}
              </strong>
              ?
            </p>

            <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
              {currentStatus === "shipped" ? (
                <p>
                  This will clear the Shipped timestamp and return the order to
                  the preparation/processing phase.
                </p>
              ) : currentStatus === "delivered" ? (
                <p>
                  This will clear the Delivered timestamp and indicate the order
                  is still in transit.
                </p>
              ) : currentStatus === "confirmed" ? (
                <p>
                  This will clear the Confirmed timestamp and mark the order as
                  pending review.
                </p>
              ) : currentStatus === "cancelled" ? (
                <p>
                  This will clear the Cancelled timestamp and un-cancel the
                  order back into active fulfillment.
                </p>
              ) : (
                <p>
                  This will adjust the order state and record the rollback in
                  the order timeline.
                </p>
              )}
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
                onClick={executeRollback}
                className="flex-1 bg-[#3d0a20] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#52102d] disabled:opacity-50"
              >
                {loading ? "Reverting…" : "Confirm Rollback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold text-gray-900">
                  Cancel Order {orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-600">
              Are you sure you want to cancel this order? This action will stop
              fulfillment.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => executeStatusUpdate("cancelled")}
                className="flex-1 bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Cancelling…" : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-orange-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-orange-700">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-semibold text-gray-900">
                  Process Live Refund
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded border border-orange-200 bg-orange-50/70 p-3 text-xs text-orange-800">
              <p className="font-semibold">Important Financial Action:</p>
              <p className="mt-1">
                This will trigger an <strong>immediate Razorpay refund</strong>{" "}
                back to the customer&#39;s source payment method
                {totalAmount ? ` for ${totalAmount}` : ""} and restore inventory
                stock for all order items.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Abort
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => executeStatusUpdate("refunded")}
                className="flex-1 bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? "Processing…" : "Execute Refund & Restock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIP MODAL (Warns if no AWB) */}
      {isShipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-amber-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <Truck className="h-5 w-5" />
                <h3 className="font-semibold text-gray-900">
                  Mark Order as Shipped
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShipModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p>
                  No courier AWB tracking number is currently attached to this
                  order. Customers will receive dispatch notifications without a
                  direct tracking link.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Optional: Enter Manual AWB Now
              </label>
              <input
                type="text"
                value={manualAwbInput}
                onChange={(e) => setManualAwbInput(e.target.value)}
                placeholder="e.g. D49281923, 739182390…"
                className="w-full border border-gray-200 p-2 font-mono text-xs focus:border-[#3d0a20] focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                You can also book automated DTDC consignment using the form
                below.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsShipModalOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => executeStatusUpdate("shipped", manualAwbInput)}
                className="flex-1 bg-[#3d0a20] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#52102d] disabled:opacity-50"
              >
                {loading ? "Marking…" : "Mark as Shipped"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
