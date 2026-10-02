"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

interface AdminProductStatusToggleProps {
  productId: string;
  field: "isActive" | "isFeatured";
  initialValue: boolean;
  label: string;
}

export function AdminProductStatusToggle({
  productId,
  field,
  initialValue,
  label,
}: AdminProductStatusToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(initialValue);

  const toggle = async () => {
    try {
      setIsLoading(true);
      const newValue = !value;
      // Optimistic update
      setValue(newValue);

      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value: newValue }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`${label} updated`);
      router.refresh();
    } catch {
      // Revert optimistic update
      setValue(!value);
      toast.error("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        value
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
