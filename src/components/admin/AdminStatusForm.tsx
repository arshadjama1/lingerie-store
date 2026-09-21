"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

interface AdminStatusFormProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function AdminStatusForm({
  orderId,
  currentStatus,
}: AdminStatusFormProps) {
  const router = useRouter();
  const validNext = VALID_TRANSITIONS[currentStatus] ?? [];

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    validNext[0] ?? currentStatus
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (validNext.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No further status transitions available.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update status");
        return;
      }
      toast.success(`Status updated to "${STATUS_LABELS[selectedStatus]}"`);
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
          New Status
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
          className="w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#3d0a20] focus:outline-none"
        >
          {validNext.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Note <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Internal note about this status change…"
          className="w-full resize-none rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-none bg-[#3d0a20] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save Status"}
      </button>
    </form>
  );
}
