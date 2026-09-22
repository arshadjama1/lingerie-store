"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCartStore } from "@/stores/useCartStore";
import { ArrowLeft, Lock, ShieldCheck, ShoppingBag } from "lucide-react";

import { FastCheckoutModal } from "@/components/checkout/FastCheckoutModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { fetchCart } = useCartStore();
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  return (
    <div className="relative min-h-[90vh] bg-gradient-to-b from-neutral-50 via-[var(--surface)] to-neutral-100/60 py-12">
      {/* Background ambient storefront elements */}
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="flex items-center justify-center gap-2 font-serif text-2xl font-bold text-neutral-900">
          <span>Surekh</span>
          <span className="text-[var(--accent)]">.</span>
        </div>
        <p className="mt-2 text-xs font-medium tracking-wider text-neutral-500 uppercase">
          Intimates & Loungewear • 1-Click Fast Checkout
        </p>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-neutral-600" /> 256-Bit SSL
            Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100%
            Genuine
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-[var(--accent)]" />{" "}
            Discreet Packaging
          </span>
        </div>

        <button
          onClick={handleClose}
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Storefront</span>
        </button>
      </div>

      {/* Centered Fast Checkout Modal matching Screenshot 1 & 2 */}
      <FastCheckoutModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
}
