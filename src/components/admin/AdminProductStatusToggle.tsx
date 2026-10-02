"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

interface AdminProductStatusToggleProps {
  productId: string;
  initialValue: boolean;
  label?: string;
}

export function AdminProductStatusToggle({
  productId,
  initialValue,
  label,
}: AdminProductStatusToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(initialValue);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const newValue = !value;
      // Optimistic update
      setValue(newValue);

      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "isActive", value: newValue }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(
        newValue ? "Product activated" : "Product archived as draft"
      );
      router.refresh();
    } catch {
      // Revert optimistic update
      setValue(!value);
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      title={
        value
          ? "Active on store (Click to set as Draft)"
          : "Draft (Click to set as Active)"
      }
      className={`inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
        value
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : "border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          value ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      <span>{label ?? (value ? "Active" : "Draft / Inactive")}</span>
    </button>
  );
}
