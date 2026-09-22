"use client";

import Image from "next/image";

import { Package, ShieldCheck, Truck } from "lucide-react";

import { formatPrice } from "@/lib/utils";

import type {
  CheckoutLineItem,
  CheckoutTotals,
} from "@/modules/checkout/types";

import { CouponInput } from "./CouponInput";

interface OrderReviewStepProps {
  lineItems: CheckoutLineItem[];
  totals: CheckoutTotals;
  couponCode?: string | null;
  onCouponApplied: (
    couponId: string,
    discountAmount: number,
    code: string
  ) => void;
  onCouponRemoved: () => void;
  onProceedToPayment: () => void;
  isSubmitting?: boolean;
}

export function OrderReviewStep({
  lineItems,
  totals,
  couponCode,
  onCouponApplied,
  onCouponRemoved,
  onProceedToPayment,
  isSubmitting = false,
}: OrderReviewStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        2. Review Items & Price Breakdown
      </h2>

      {/* Items List */}
      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {lineItems.map((item) => (
          <div key={item.variantId} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
              {item.snapshot.imageUrl ? (
                <Image
                  src={item.snapshot.imageUrl}
                  alt={item.snapshot.productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-300">
                  <Package className="h-6 w-6" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium text-neutral-900">
                {item.snapshot.productName}
              </h4>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-500">
                <span>SKU: {item.snapshot.sku}</span>
                {item.snapshot.size && <span>Size: {item.snapshot.size}</span>}
                {item.snapshot.color && (
                  <span>Color: {item.snapshot.color}</span>
                )}
                <span>Qty: {item.quantity}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-neutral-900">
                ₹{item.total.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-neutral-400">
                ₹{item.unitPrice} × {item.quantity} + ₹{item.taxAmount} GST
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust badging */}
      <div className="grid grid-cols-2 gap-3 text-xs text-neutral-600 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>100% Genuine Quality</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2.5">
          <Truck className="h-4 w-4 text-rose-600" />
          <span>Discreet Packaging</span>
        </div>
      </div>

      {/* Coupon Input */}
      <CouponInput
        cartSubtotal={totals.subtotal}
        onApplied={onCouponApplied}
        onRemoved={onCouponRemoved}
        appliedCode={couponCode}
        appliedDiscount={totals.discountAmount}
      />

      {/* Cost summary table */}
      <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Bag Subtotal</span>
          <span className="font-medium text-neutral-900">
            ₹{totals.subtotal.toLocaleString("en-IN")}
          </span>
        </div>

        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
            <span className="font-medium">
              −{formatPrice(totals.discountAmount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm text-neutral-600">
          <span>Estimated GST (5% / 12%)</span>
          <span className="font-medium text-neutral-900">
            +₹{totals.taxAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between text-sm text-neutral-600">
          <span>Delivery Fee</span>
          {totals.shippingAmount === 0 ? (
            <span className="font-medium text-emerald-600">FREE</span>
          ) : (
            <span className="font-medium text-neutral-900">
              ₹{totals.shippingAmount}
            </span>
          )}
        </div>

        <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-bold text-neutral-900">
          <span>Total Amount Payable</span>
          <span className="text-rose-600">
            ₹{totals.total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onProceedToPayment}
          disabled={isSubmitting}
          className="rounded-xl bg-rose-600 px-8 py-3.5 font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating Order..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
}
