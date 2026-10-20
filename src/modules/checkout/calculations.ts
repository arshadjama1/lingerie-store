import { resolveVariantImageUrl } from "@/lib/utils";

import type { CartItemWithVariant } from "@/modules/cart/types";

import type { CheckoutLineItem, CheckoutTotals } from "./types";

export function getGstRate(_unitPrice: number): number {
  return 0;
}

export function calculateLineItem(item: CartItemWithVariant): CheckoutLineItem {
  const unitPrice = Number(item.variant?.price ?? item.priceAtAddition ?? 0);
  const lineSubtotal = unitPrice * item.quantity;
  const taxAmount = 0;
  const total = Number(lineSubtotal.toFixed(2));

  const product = item.variant?.product;
  const imageUrl = resolveVariantImageUrl(item.variant, product, "");

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
      imageUrl: imageUrl || undefined,
      hsnCode: product?.hsnCode || undefined,
    },
  };
}

export function calculateCheckoutTotals(
  lineItems: CheckoutLineItem[],
  discountAmount = 0,
  codFee = 0
): CheckoutTotals {
  const subtotal = Number(
    lineItems
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      .toFixed(2)
  );

  const taxAmount = 0;

  // Free shipping on orders ₹500 and above; ₹49 shipping fee below ₹500
  const shippingAmount = subtotal >= 500 ? 0 : 49;

  const total = Number(
    Math.max(0, subtotal - discountAmount + shippingAmount + codFee).toFixed(2)
  );

  return {
    subtotal,
    discountAmount: Number(discountAmount.toFixed(2)),
    taxAmount,
    shippingAmount,
    codFee: Number(codFee.toFixed(2)),
    total,
  };
}
