"use client";

import { useEffect, useState } from "react";

import type { Address } from "@/db/schema";
import { Check, MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";

import type { CreateAddressInput } from "@/modules/addresses";

interface AddressSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddressId: string | null;
  onSelectAddress: (address: Address) => void;
}

export function AddressSelectionSheet({
  isOpen,
  onClose,
  selectedAddressId,
  onSelectAddress,
}: AddressSelectionSheetProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateAddressInput>({
    label: "home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/addresses");
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      const list: Address[] = data.addresses || [];
      setAddresses(list);
    } catch (err) {
      console.error("[AddressSelectionSheet] Error fetching addresses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      setShowAddForm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add address");
        return;
      }

      toast.success("Delivery address added");
      setShowAddForm(false);
      setFormData({
        label: "home",
        fullName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
      });

      await fetchAddresses();
      if (data.address) {
        onSelectAddress(data.address);
        onClose();
      }
    } catch (err) {
      console.error("[AddressSelectionSheet] Create error:", err);
      toast.error("Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">
                {showAddForm ? "Add New Address" : "Select Delivery Address"}
              </h3>
              <p className="text-xs text-neutral-500">
                {showAddForm
                  ? "Enter your delivery details"
                  : "Choose where you want your order delivered"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {showAddForm ? (
            <form onSubmit={handleCreateAddress} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, fullName: e.target.value }))
                    }
                    placeholder="Recipient's name"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700">
                    Phone Number *
                  </label>
                  <div className="mt-1 flex rounded-xl border border-neutral-200 focus-within:border-[var(--accent)]">
                    <span className="flex items-center bg-neutral-50 px-3 text-xs font-semibold text-neutral-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="10-digit number"
                      maxLength={10}
                      className="w-full rounded-r-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Address (House No, Building, Street) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.line1}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, line1: e.target.value }))
                  }
                  placeholder="Flat / House No., Colony / Street"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Landmark / Area (Optional)
                </label>
                <input
                  type="text"
                  value={formData.line2 || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, line2: e.target.value }))
                  }
                  placeholder="Near park, landmark, etc."
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="\d{6}"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, pincode: e.target.value }))
                    }
                    placeholder="6 digits"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
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
                      setFormData((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="City"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, state: e.target.value }))
                    }
                    placeholder="State"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-700">
                  <input
                    type="radio"
                    name="label"
                    checked={formData.label === "home"}
                    onChange={() =>
                      setFormData((p) => ({ ...p, label: "home" }))
                    }
                    className="accent-[var(--accent)]"
                  />
                  Home
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-700">
                  <input
                    type="radio"
                    name="label"
                    checked={formData.label === "work"}
                    onChange={() =>
                      setFormData((p) => ({ ...p, label: "work" }))
                    }
                    className="accent-[var(--accent)]"
                  />
                  Work
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-700">
                  <input
                    type="radio"
                    name="label"
                    checked={formData.label === "other"}
                    onChange={() =>
                      setFormData((p) => ({ ...p, label: "other" }))
                    }
                    className="accent-[var(--accent)]"
                  />
                  Other
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-neutral-900 px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-black disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save & Deliver Here"}
                </button>
              </div>
            </form>
          ) : isLoading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-neutral-600">
                No delivery address saved yet.
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase"
              >
                <Plus className="h-4 w-4" />
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {addresses.map((address) => {
                const isSelected = selectedAddressId === address.id;

                return (
                  <div
                    key={address.id}
                    onClick={() => {
                      onSelectAddress(address);
                      onClose();
                    }}
                    className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)]/20 ring-1 ring-[var(--accent)]"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">
                          {address.fullName}
                        </span>
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 uppercase">
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-md bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""},{" "}
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-[11px] font-medium text-neutral-500">
                        Phone: {address.phone}
                      </p>
                    </div>

                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
