"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Banknote } from "lucide-react";
import { toast } from "sonner";

interface AdminCollectCodButtonProps {
  orderId: string;
}

export function AdminCollectCodButton({ orderId }: AdminCollectCodButtonProps) {
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

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleCollect}
      className="flex w-full items-center justify-center gap-2 rounded-none bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-amber-700 disabled:opacity-50"
    >
      <Banknote className="h-4 w-4" />
      {loading ? "Saving…" : "Collect COD Payment"}
    </button>
  );
}
