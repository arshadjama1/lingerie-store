import { toast } from "sonner";
import { create } from "zustand";

import type { HydratedCart } from "@/modules/cart/types";

interface CartState {
  cart: HydratedCart | null;
  isOpen: boolean;
  isLoading: boolean;
  isUpdatingItem: Record<string, boolean>;

  isFastCheckoutOpen: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openFastCheckout: () => void;
  closeFastCheckout: () => void;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isOpen: false,
  isFastCheckoutOpen: false,
  isLoading: false,
  isUpdatingItem: {},

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openFastCheckout: () => set({ isOpen: false, isFastCheckoutOpen: true }),
  closeFastCheckout: () => set({ isFastCheckoutOpen: false }),
  clearCart: () => set({ cart: null }),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      set({ cart: data.cart || null });
    } catch (err) {
      console.error("[useCartStore] fetchCart error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId: string, quantity = 1) => {
    try {
      set({ isLoading: true });
      const res = await fetch(`/api/cart/${variantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add item to bag");
        return false;
      }

      set({ cart: data.cart, isOpen: true });
      toast.success("Added to your shopping bag");
      return true;
    } catch (err) {
      console.error("[useCartStore] addItem error:", err);
      toast.error("Failed to add item to bag");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      set((state) => ({
        isUpdatingItem: { ...state.isUpdatingItem, [itemId]: true },
      }));

      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update quantity");
        return false;
      }

      set({ cart: data.cart });
      return true;
    } catch (err) {
      console.error("[useCartStore] updateQuantity error:", err);
      toast.error("Failed to update quantity");
      return false;
    } finally {
      set((state) => {
        const nextUpdating = { ...state.isUpdatingItem };
        delete nextUpdating[itemId];
        return { isUpdatingItem: nextUpdating };
      });
    }
  },

  removeItem: async (itemId: string) => {
    try {
      set((state) => ({
        isUpdatingItem: { ...state.isUpdatingItem, [itemId]: true },
      }));

      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to remove item");
        return false;
      }

      set({ cart: data.cart });
      toast.success("Item removed from bag");
      return true;
    } catch (err) {
      console.error("[useCartStore] removeItem error:", err);
      toast.error("Failed to remove item");
      return false;
    } finally {
      set((state) => {
        const nextUpdating = { ...state.isUpdatingItem };
        delete nextUpdating[itemId];
        return { isUpdatingItem: nextUpdating };
      });
    }
  },
}));
