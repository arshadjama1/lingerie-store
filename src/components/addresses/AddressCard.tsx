"use client";

import type { Address } from "@/db/schema";
import { Check, Edit2, Trash2 } from "lucide-react";

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (address: Address) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  isSelected = false,
  onSelect,
}: AddressCardProps) {
  return (
    <div
      onClick={() => selectable && onSelect && onSelect(address)}
      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
        selectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-rose-600 bg-rose-50/20 shadow-sm ring-2 ring-rose-600/20"
          : "border-neutral-200 bg-white shadow-xs hover:border-neutral-300"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">
              {address.fullName}
            </span>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-600 uppercase">
              {address.label}
            </span>
            {address.isDefault && (
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                Default
              </span>
            )}
          </div>

          {selectable && isSelected && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-3 text-xs leading-relaxed text-neutral-600">
          <p>{address.line1}</p>
          {address.line2 && <p>{address.line2}</p>}
          <p className="font-medium text-neutral-800">
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p className="mt-2 text-neutral-500">
            Phone:{" "}
            <span className="font-semibold text-neutral-800">
              {address.phone}
            </span>
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
        <div>
          {!address.isDefault && onSetDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address.id);
              }}
              className="font-medium text-rose-600 hover:text-rose-700 hover:underline"
            >
              Set as Default
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              className="flex items-center gap-1 font-medium text-neutral-600 hover:text-rose-600"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(address.id);
              }}
              className="flex items-center gap-1 font-medium text-neutral-400 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
