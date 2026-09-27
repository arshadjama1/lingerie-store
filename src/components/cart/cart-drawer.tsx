"use client";

import { useEffect, useState } from "react";

import { useCartStore } from "@/stores/useCartStore";
import {
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

import { FastCheckoutModal } from "../checkout/FastCheckoutModal";
import { CartItemCard } from "./cart-item-card";

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    fetchCart,
    isFastCheckoutOpen,
    openFastCheckout,
    closeFastCheckout,
  } = useCartStore();

  const [userFirstName, setUserFirstName] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Auth User Fetch
  useEffect(() => {
    if (!isOpen) return;

    async function getUserProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const emailPrefix = user.email?.split("@")[0];
          setUserFirstName(
            user.user_metadata?.full_name || emailPrefix || "Shopper"
          );
        } else {
          setUserFirstName(null);
        }
      } catch (err) {
        console.error("[CartDrawer] User data fetch error:", err);
      }
    }

    getUserProfile();
  }, [isOpen]);

  if (!isOpen && !isFastCheckoutOpen) return null;

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;

  // Pricing calculations
  const originalMrp = Math.round(subtotal * 1.35);
  const estimatedSavings = Math.max(0, originalMrp - subtotal);
  const discountPercent =
    originalMrp > 0
      ? Math.round(((originalMrp - subtotal) / originalMrp) * 100)
      : 0;

  // Free shipping milestone (₹1,299)
  const freeShippingThreshold = 1299;
  const isFreeShipping = subtotal >= freeShippingThreshold;

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={closeCart}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="flex w-screen max-w-md flex-col border-l border-neutral-200 bg-white shadow-2xl duration-300">
              {/* ── TIER 1: Header (User Greeting & Urgency Countdown) ── */}
              <div className="border-b border-neutral-100 bg-white px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                    <User className="h-4 w-4 text-[var(--accent)]" />
                    <span>
                      {userFirstName ? `Hi, ${userFirstName}` : "Hi, Guest"}
                    </span>
                    {itemCount > 0 && (
                      <span className="rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={closeCart}
                      className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      aria-label="Close cart drawer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* ── TIER 2: Milestone Progress Bar (Free Shipping) ── */}
                {items.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-3">
                    <p className="text-center text-xs font-semibold text-neutral-800">
                      {!isFreeShipping ? (
                        <>
                          Add{" "}
                          <span className="text-[var(--accent)]">
                            ₹
                            {(freeShippingThreshold - subtotal).toLocaleString(
                              "en-IN"
                            )}
                          </span>{" "}
                          more for{" "}
                          <span className="font-bold">
                            FREE Discreet Shipping
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-emerald-700">
                          🎉 You unlocked FREE Discreet Shipping!
                        </span>
                      )}
                    </p>

                    {/* Visual Bar */}
                    <div className="relative mt-2.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-neutral-500">
                      <span>₹0</span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-[var(--accent)]" />{" "}
                        ₹1,299 Free Shipping
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── TIER 3: Cart Content / Item List ────────────────── */}
              <div className="flex-1 overflow-y-auto px-5 py-3">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-bold text-neutral-900">
                      Your bag is empty
                    </h3>
                    <p className="mt-1 max-w-xs text-xs text-neutral-500">
                      Explore our handcrafted lingerie, seamless bralettes, and
                      silk sleepwear.
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-6 inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow hover:bg-black"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
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

              {/* ── TIER 4: Footer / Summary (Matching Reference Screenshot 3) ── */}
              {items.length > 0 && (
                <div className="border-t border-neutral-200 bg-white p-5 shadow-lg">
                  {/* Savings Banner */}
                  {estimatedSavings > 0 && (
                    <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-teal-50 py-1.5 text-xs font-bold text-teal-800">
                      <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                      <span>
                        ₹{estimatedSavings.toLocaleString("en-IN")} Saved so
                        far!
                      </span>
                    </div>
                  )}

                  {/* Estimated Total */}
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-neutral-700">
                      Estimated Total
                    </span>
                    <div className="text-right">
                      {originalMrp > subtotal && (
                        <span className="mr-2 text-xs text-neutral-400 line-through">
                          ₹{originalMrp.toLocaleString("en-IN")}
                        </span>
                      )}
                      <span className="text-base font-extrabold text-neutral-900">
                        {formatPrice(subtotal)}
                      </span>
                      {discountPercent > 0 && (
                        <span className="ml-1.5 text-xs font-bold text-emerald-600">
                          ({discountPercent}% OFF)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CHECKOUT Action Button */}
                  <button
                    type="button"
                    onClick={() => openFastCheckout()}
                    className="flex w-full items-center justify-center rounded-2xl bg-black py-3.5 text-sm font-extrabold tracking-wider text-white uppercase shadow-xl transition-transform hover:bg-neutral-800 active:scale-[0.99]"
                  >
                    CHECKOUT
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> 100%
                      Secure
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3 text-[var(--accent)]" /> 100%
                      Discreet Box
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Fast Checkout Modal */}
      <FastCheckoutModal
        isOpen={isFastCheckoutOpen}
        onClose={closeFastCheckout}
      />
    </>
  );
}
