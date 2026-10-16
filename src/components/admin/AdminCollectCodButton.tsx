"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Banknote, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface AdminCollectCodButtonProps {
  orderId: string;
  isCollected?: boolean;
}

export function AdminCollectCodButton({
  orderId,
  isCollected = false,
}: AdminCollectCodButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCollect() {
    if (
      !window.confirm(
        "Confirm that cash has been collected from the customer for this COD order?"
      )
    ) {
      return;
    }

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
      toast.success("COD payment marked as collected");
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleRollback() {
    if (
      !window.confirm(
        "Confirm that you want to rollback this COD payment to pending collection? This will mark the cash as uncollected."
      )
    ) {
      return;
    }

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
        "COD collection rolled back — marked as pending collection"
      );
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  if (isCollected) {
    return (
      <div className="space-y-1.5">
        <button
          type="button"
          disabled={loading}
          onClick={handleRollback}
          className="flex w-full items-center justify-center gap-1.5 border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
          {loading ? "Reverting…" : "Revert COD to Pending"}
        </button>
        <p className="text-center text-[10px] text-gray-400">
          Click if cash was marked as collected by mistake
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleCollect}
      className="flex w-full items-center justify-center gap-2 rounded-none bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
    >
      <Banknote className="h-4 w-4" />
      {loading ? "Saving…" : "Collect COD Payment"}
    </button>
  );
}
