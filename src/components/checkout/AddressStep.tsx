"use client";

import { useEffect, useState } from "react";

import type { Address } from "@/db/schema";
import { Check, Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { CreateAddressInput } from "@/modules/addresses";

import { AddressFormModal } from "@/components/addresses/AddressFormModal";

interface AddressStepProps {
  selectedAddressId: string | null;
  onSelectAddress: (address: Address) => void;
}

export function AddressStep({
  selectedAddressId,
  onSelectAddress,
}: AddressStepProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

      // Auto-select default address if none selected yet
      if (!selectedAddressId && list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        onSelectAddress(defaultAddr);
      }
    } catch (err) {
      console.error("[AddressStep] Error fetching addresses:", err);
      toast.error("Failed to load delivery addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

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
      }
    } catch (err) {
      console.error("[AddressStep] Create error:", err);
      toast.error("Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (
    addressId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete address");
      toast.success("Address removed");
      await fetchAddresses();
    } catch (err) {
      console.error("[AddressStep] Delete error:", err);
      toast.error("Failed to remove address");
    }
  };

  const handleSetDefault = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed to set default address");
      toast.success("Set as default address");
      await fetchAddresses();
    } catch (err) {
      console.error("[AddressStep] Set default error:", err);
      toast.error("Failed to set default address");
    }
  };

  const handleEditAddress = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(address);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-20 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-20 animate-pulse rounded-lg bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          1. Select Delivery Address
        </h2>
        {!showAddForm && addresses.length < 10 && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        )}
      </div>

      {showAddForm ? (
        <form
          onSubmit={handleCreateAddress}
          className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-5"
        >
          <h3 className="font-medium text-neutral-900">
            Add New Delivery Address
          </h3>

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
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
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
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Address Line 1 *
            </label>
            <input
              type="text"
              required
              value={formData.line1}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, line1: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
              placeholder="House/Flat No., Building Name, Street"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              value={formData.line2 || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, line2: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
              placeholder="Landmark, Area"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                placeholder="Mumbai"
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
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Pincode *
              </label>
              <input
                type="text"
                required
                pattern="\d{6}"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pincode: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                placeholder="400001"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save & Deliver Here"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => {
          const isSelected = selectedAddressId === address.id;
          return (
            <div
              key={address.id}
              onClick={() => onSelectAddress(address)}
              className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
                isSelected
                  ? "border-rose-600 bg-rose-50/30 ring-2 ring-rose-600/20"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">
                      {address.fullName}
                    </span>
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 uppercase">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="mt-2 text-xs font-medium text-neutral-700">
                    Phone: {address.phone}
                  </p>
                </div>

                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={(e) => handleSetDefault(address.id, e)}
                    className="font-medium text-rose-600 hover:underline"
                  >
                    Set as Default
                  </button>
                )}
                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleEditAddress(address, e)}
                    className="flex items-center gap-1 font-medium text-neutral-500 hover:text-rose-600"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAddress(address.id, e)}
                    className="flex items-center gap-1 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddressFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSuccess={async (updated) => {
          await fetchAddresses();
          if (selectedAddressId === updated.id) {
            onSelectAddress(updated);
          }
        }}
      />
    </div>
  );
}
