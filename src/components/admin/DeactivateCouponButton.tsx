"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Loader2 } from "lucide-react";

interface DeactivateCouponButtonProps {
  couponId: string;
}

export function DeactivateCouponButton({
  couponId,
}: DeactivateCouponButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeactivate() {
    if (
      !confirm(
        "Deactivate this coupon? Users will no longer be able to apply it."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleDeactivate}
      disabled={isLoading}
      className="flex items-center gap-1 rounded-none border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Deactivate"}
    </button>
  );
}
