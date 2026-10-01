"use client";

import { useActionState, useEffect, useRef } from "react";

import { CheckCircle, Loader2, Pencil, X, XCircle } from "lucide-react";

import { updateStockAction } from "@/modules/admin/inventory";
import type { ActionResult } from "@/modules/admin/inventory";

interface InventoryStockEditorProps {
  variantId: string;
  currentQuantity: number;
  currentLowStockAlert: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const initialState: ActionResult = { success: false };

export function InventoryStockEditor({
  variantId,
  currentQuantity,
  currentLowStockAlert,
  isOpen,
  onOpen,
  onClose,
}: InventoryStockEditorProps) {
  const [state, formAction, pending] = useActionState(
    updateStockAction,
    initialState
  );

  // Auto-close the editor on a successful save
  const prevSuccessRef = useRef(false);
  useEffect(() => {
    if (state.success && !prevSuccessRef.current) {
      const timer = setTimeout(onClose, 900);
      return () => clearTimeout(timer);
    }
    prevSuccessRef.current = state.success;
  }, [state.success, onClose]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        title="Edit stock"
        className="inline-flex items-center gap-1 rounded-none border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:border-[#3d0a20] hover:text-[#3d0a20]"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {/* Hidden variantId */}
      <input type="hidden" name="variantId" value={variantId} />

      <div className="flex items-center gap-2">
        {/* Quantity */}
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase">
            Qty
          </span>
          <input
            type="number"
            name="quantity"
            defaultValue={currentQuantity}
            min={0}
            step={1}
            required
            disabled={pending}
            className="w-20 rounded-none border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-[#3d0a20] focus:ring-0 focus:outline-none disabled:opacity-60"
          />
        </label>

        {/* Low stock alert */}
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase">
            Alert ≤
          </span>
          <input
            type="number"
            name="lowStockAlert"
            defaultValue={currentLowStockAlert}
            min={0}
            step={1}
            required
            disabled={pending}
            className="w-20 rounded-none border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-[#3d0a20] focus:ring-0 focus:outline-none disabled:opacity-60"
          />
        </label>

        {/* Save button */}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 flex h-7 items-center gap-1 rounded-none bg-[#3d0a20] px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#571030] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          {pending ? "Saving…" : "Save"}
        </button>

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="mt-4 flex h-7 items-center gap-1 rounded-none border border-gray-200 px-2 text-[11px] font-medium text-gray-500 transition-colors hover:text-rose-600 disabled:opacity-60"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
      </div>

      {/* Feedback */}
      {state.success && (
        <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <CheckCircle className="h-3 w-3" />
          Saved successfully
        </p>
      )}
      {!state.success && state.error && (
        <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
          <XCircle className="h-3 w-3" />
          {state.error}
        </p>
      )}
    </form>
  );
}
