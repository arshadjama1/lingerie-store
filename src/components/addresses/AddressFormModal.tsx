"use client";

import React, { useEffect, useState } from "react";

import type { Address } from "@/db/schema";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import type { CreateAddressInput } from "@/modules/addresses";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Puducherry",
  "Jammu & Kashmir",
  "Ladakh",
];

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Address | null;
  onSuccess: (address: Address) => void;
}

export function AddressFormModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: AddressFormModalProps) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState<CreateAddressInput>({
    label: "home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    isDefault: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || "home",
        fullName: initialData.fullName || "",
        phone: initialData.phone || "",
        line1: initialData.line1 || "",
        line2: initialData.line2 || "",
        city: initialData.city || "",
        state: initialData.state || "Maharashtra",
        pincode: initialData.pincode || "",
        isDefault: initialData.isDefault || false,
      });
    } else {
      setFormData({
        label: "home",
        fullName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "Maharashtra",
        pincode: "",
        isDefault: false,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client validation
    if (!formData.fullName.trim()) {
      setError("Please enter a full name");
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setError("Please enter a valid 6-digit postal code (pincode)");
      return;
    }

    try {
      setIsSubmitting(true);
      const url =
        isEditing && initialData
          ? `/api/addresses/${initialData.id}`
          : "/api/addresses";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save address");
      }

      toast.success(
        isEditing ? "Address updated successfully" : "Delivery address added"
      );

      onSuccess(data.address);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-neutral-900">
            {isEditing ? "Edit Delivery Address" : "Add New Delivery Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Address Label Pills */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-700 uppercase">
              Address Type
            </label>
            <div className="mt-2 flex gap-2">
              {["home", "work", "other"].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, label: lbl }))
                  }
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                    formData.label === lbl
                      ? "bg-rose-600 text-white shadow-xs"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Mobile Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Address Line 1 (Flat, House No., Building) *
            </label>
            <input
              type="text"
              required
              value={formData.line1}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, line1: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              placeholder="Flat 402, Lotus Residency, MG Road"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Address Line 2 (Area, Street, Landmark)
            </label>
            <input
              type="text"
              value={formData.line2 || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, line2: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              placeholder="Near City Mall, Bandra West"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Pincode *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                placeholder="400050"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                State *
              </label>
              <select
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(formData.isDefault)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDefault: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-neutral-700">
                Make this my default shipping address
              </span>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Save Address"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
