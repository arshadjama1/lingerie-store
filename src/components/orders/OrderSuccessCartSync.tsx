"use client";

import { useEffect } from "react";

import { useCartStore } from "@/stores/useCartStore";

export function OrderSuccessCartSync() {
  const clearCart = useCartStore((state) => state.clearCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    clearCart();
    fetchCart().catch(() => {});
  }, [clearCart, fetchCart]);

  return null;
}
