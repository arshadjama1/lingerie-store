"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useCartStore } from "@/stores/useCartStore";
import { ArrowRight, ShoppingBag, X } from "lucide-react";

import { formatPrice } from "@/lib/utils";

import { CartItemCard } from "./cart-item-card";

export function CartDrawer() {
  const { cart, isOpen, closeCart, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="bg-background animate-in slide-in-from-right border-border/40 flex w-screen max-w-md flex-col border-l shadow-2xl duration-300">
          {/* Header */}
          <div className="border-border/60 bg-card/40 flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-primary h-5 w-5" />
              <h2 className="text-foreground font-serif text-lg font-bold tracking-tight">
                Your Shopping Bag
              </h2>
              {itemCount > 0 && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>

            <button
              onClick={closeCart}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full p-1.5 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Content / Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="bg-primary/10 text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-foreground mb-1 text-base font-semibold">
                  Your bag is empty
                </h3>
                <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                  Explore our curated lingerie edits, bralettes, and sleepwear.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium shadow transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="divide-border/60 divide-y">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onCloseDrawer={closeCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="border-border/60 bg-card/40 space-y-4 border-t p-6">
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>Taxes & Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="text-muted-foreground mt-3 text-center text-[11px]">
                  🔒 Safe & Secure 256-bit Encrypted Checkout
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
