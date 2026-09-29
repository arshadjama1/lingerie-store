"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { RETURN_VALID_TRANSITIONS } from "@/modules/admin/returns/transitions";
import type { ReturnStatus } from "@/modules/admin/returns/types";

const STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  picked_up: "Picked Up",
  refunded: "Refunded",
};

interface AdminReturnActionFormProps {
  returnId: string;
  currentStatus: ReturnStatus;
}

export function AdminReturnActionForm({
  returnId,
  currentStatus,
}: AdminReturnActionFormProps) {
  const router = useRouter();
  const validNext = RETURN_VALID_TRANSITIONS[currentStatus] ?? [];

  const [selectedStatus, setSelectedStatus] = useState<ReturnStatus>(
    validNext[0] ?? currentStatus
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (validNext[0]) {
      setSelectedStatus(validNext[0]);
    }
  }, [currentStatus]);

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
      const res = await fetch(`/api/admin/returns/${returnId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update return status");
        return;
      }
      toast.success(
        `Return status updated to "${STATUS_LABELS[selectedStatus]}"`
      );
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
          onChange={(e) => setSelectedStatus(e.target.value as ReturnStatus)}
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
          Admin Notes{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal note about this decision…"
          className="w-full resize-none rounded-none border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-none bg-[#3d0a20] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save Decision"}
      </button>
    </form>
  );
}
