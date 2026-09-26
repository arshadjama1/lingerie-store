"use client";

import { useState } from "react";

import type { Address } from "@/db/schema";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { AddressCard } from "@/components/addresses/AddressCard";
import { AddressFormModal } from "@/components/addresses/AddressFormModal";

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleOpenAdd = () => {
    if (addresses.length >= 10) {
      toast.error("You can save a maximum of 10 delivery addresses");
      return;
    }
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to set default address");
      }

      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        }))
      );
      toast.success("Default delivery address updated");
    } catch (err) {
      console.error("[AddressManager] Set default error:", err);
      toast.error("Failed to update default address");
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete address");
      }

      setAddresses((prev) => {
        const remaining = prev.filter((a) => a.id !== addressId);
        // If deleted address was default and there are remaining addresses,
        // mark the first one as default
        const wasDefault = prev.find((a) => a.id === addressId)?.isDefault;
        if (wasDefault && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });

      toast.success("Address removed");
    } catch (err) {
      console.error("[AddressManager] Delete error:", err);
      toast.error("Failed to remove address");
    }
  };

  const handleSaveSuccess = (savedAddress: Address) => {
    setAddresses((prev) => {
      let updated: Address[];
      const exists = prev.some((a) => a.id === savedAddress.id);

      if (exists) {
        updated = prev.map((a) =>
          a.id === savedAddress.id ? savedAddress : a
        );
      } else {
        updated = [savedAddress, ...prev];
      }

      if (savedAddress.isDefault) {
        updated = updated.map((a) =>
          a.id === savedAddress.id ? a : { ...a, isDefault: false }
        );
      }

      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-neutral-900">
            Delivery Addresses
          </h2>
          <p className="text-xs text-neutral-500">
            Manage your delivery destinations ({addresses.length}/10 saved)
          </p>
        </div>

        {addresses.length < 10 && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-12 text-center">
          <MapPin className="mb-3 h-10 w-10 text-neutral-300" />
          <h3 className="text-sm font-semibold text-neutral-800">
            No saved addresses
          </h3>
          <p className="mt-1 max-w-sm text-xs text-neutral-500">
            Add your shipping address for a smoother and faster checkout
            experience.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingAddress}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
}
