import type { Address } from "@/db/schema";

export interface CheckoutTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
}

export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  total: number;
  snapshot: {
    productName: string;
    sku: string;
    size?: string;
    color?: string;
    imageUrl?: string;
    hsnCode?: string;
  };
}

export interface CreateCheckoutSessionInput {
  userId: string;
  cartId: string;
  addressId: string;
  couponCode?: string;
}

export interface HydratedCheckoutSession {
  id: string;
  userId: string;
  cartId: string;
  addressId: string;
  couponId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  razorpayOrderId: string | null;
  orderId: string | null;
  expiresAt: Date;
  createdAt: Date;
  address: Address;
  lineItems: CheckoutLineItem[];
}
