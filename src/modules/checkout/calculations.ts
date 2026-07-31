import type { CartItemWithVariant } from "@/modules/cart/types";

import type { CheckoutLineItem, CheckoutTotals } from "./types";

export function getGstRate(unitPrice: number): 0.05 | 0.12 {
  return unitPrice < 1000 ? 0.05 : 0.12;
}

export function calculateLineItem(item: CartItemWithVariant): CheckoutLineItem {
  const unitPrice = Number(item.variant?.price ?? item.priceAtAddition ?? 0);
  const gstRate = getGstRate(unitPrice);
  const lineSubtotal = unitPrice * item.quantity;
  const taxAmount = Number((lineSubtotal * gstRate).toFixed(2));
  const total = Number((lineSubtotal + taxAmount).toFixed(2));

  const product = item.variant?.product;
  const primaryImg =
    product?.images?.find((img) => img.isPrimary) || product?.images?.[0];

  return {
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice,
    taxAmount,
    total,
    snapshot: {
      productName: product?.name || "Product",
      sku: item.variant?.sku || "SKU",
      size: item.variant?.size || undefined,
      color: item.variant?.color || undefined,
      imageUrl: primaryImg?.url || undefined,
      hsnCode: product?.hsnCode || undefined,
    },
  };
}

export function calculateCheckoutTotals(
  lineItems: CheckoutLineItem[],
  discountAmount = 0
): CheckoutTotals {
  const subtotal = Number(
    lineItems
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      .toFixed(2)
  );

  const taxAmount = Number(
    lineItems.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)
  );

  const shippingAmount = subtotal >= 999 ? 0 : 99;

  const total = Number(
    Math.max(0, subtotal - discountAmount + taxAmount + shippingAmount).toFixed(
      2
    )
  );

  return {
    subtotal,
    discountAmount: Number(discountAmount.toFixed(2)),
    taxAmount,
    shippingAmount,
    total,
  };
}
