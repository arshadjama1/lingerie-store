import type {
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
} from "@/db/schema";

import type { ReturnStatus } from "@/modules/admin/returns/types";

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string;
  itemCount: number;
  createdAt: Date;
  awbNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  taxAmount: string;
  total: string;
  productSnapshot: {
    productName: string;
    sku: string;
    size?: string;
    color?: string;
    imageUrl?: string;
    hsnCode?: string;
  };
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
}

export interface OrderPayment {
  status: PaymentStatus;
  method: PaymentMethod | null;
  razorpayPaymentId: string | null;
  amount: string;
}

export interface OrderReturnRequestSummary {
  id: string;
  status: ReturnStatus;
  reason: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerEmail: string | null;
  shippingAddress: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  shippingAmount: string;
  total: string;
  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  awbNumber: string | null;
  items: OrderItem[];
  payment: OrderPayment | null;
  statusHistory: OrderStatusHistoryEntry[];
  returnRequest?: OrderReturnRequestSummary | null;
}

export interface ListOrdersResult {
  orders: OrderSummary[];
  total: number;
  page: number;
  totalPages: number;
}
