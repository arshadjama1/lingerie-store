"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Address } from "@/db/schema";
import { useCartStore } from "@/stores/useCartStore";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import type { HydratedCheckoutSession } from "@/modules/checkout/types";

import { AddressStep } from "@/components/checkout/AddressStep";
import { OrderReviewStep } from "@/components/checkout/OrderReviewStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [session, setSession] = useState<HydratedCheckoutSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleProceedToReview = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error("Your shopping bag is empty");
      router.push("/");
      return;
    }

    try {
      setIsCreatingSession(true);
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          addressId: selectedAddress.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to initiate checkout session");
        return;
      }

      setSession(data.session);
      setCurrentStep(2);
    } catch (err) {
      console.error("[CheckoutPage] Create session error:", err);
      toast.error("Failed to initiate checkout session");
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pt-8 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-2 text-lg font-bold text-rose-600">
            <ShoppingBag className="h-5 w-5" />
            <span>LINGE. Checkout</span>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="mb-8 grid grid-cols-3 gap-2 text-center text-xs font-semibold sm:text-sm">
          <div
            className={`rounded-lg py-2.5 transition-all ${
              currentStep === 1
                ? "bg-rose-600 text-white shadow"
                : currentStep > 1
                  ? "bg-rose-100 text-rose-800"
                  : "bg-neutral-200 text-neutral-500"
            }`}
          >
            1. Address
          </div>
          <div
            className={`rounded-lg py-2.5 transition-all ${
              currentStep === 2
                ? "bg-rose-600 text-white shadow"
                : currentStep > 2
                  ? "bg-rose-100 text-rose-800"
                  : "bg-neutral-200 text-neutral-500"
            }`}
          >
            2. Review Order
          </div>
          <div
            className={`rounded-lg py-2.5 transition-all ${
              currentStep === 3
                ? "bg-rose-600 text-white shadow"
                : "bg-neutral-200 text-neutral-500"
            }`}
          >
            3. Payment
          </div>
        </div>

        {/* Accordion Content */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <AddressStep
                selectedAddressId={selectedAddress?.id || null}
                onSelectAddress={handleSelectAddress}
              />
              <div className="flex justify-end border-t border-neutral-100 pt-6">
                <button
                  type="button"
                  onClick={handleProceedToReview}
                  disabled={!selectedAddress || isCreatingSession}
                  className="rounded-xl bg-rose-600 px-8 py-3.5 font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-50"
                >
                  {isCreatingSession
                    ? "Initiating..."
                    : "Deliver to This Address"}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && session && (
            <OrderReviewStep
              lineItems={session.lineItems}
              totals={{
                subtotal: session.subtotal,
                discountAmount: session.discountAmount,
                taxAmount: session.taxAmount,
                shippingAmount: session.shippingAmount,
                total: session.total,
              }}
              onProceedToPayment={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && session && <PaymentStep session={session} />}
        </div>
      </div>
    </div>
  );
}
