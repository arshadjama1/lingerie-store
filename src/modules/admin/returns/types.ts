import type { OrderItem, OrderStatus } from "@/modules/orders";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "picked_up"
  | "refunded";

export interface AdminReturnSummary {
  id: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string | null;
  reason: string;
  status: ReturnStatus;
  createdAt: Date;
}

export interface AdminReturnListResult {
  returns: AdminReturnSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminReturnDetails {
  id: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string | null;
  reason: string;
  status: ReturnStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  orderTotal: string;
  orderStatus: OrderStatus;
  items: OrderItem[];
  shippingAddress: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
}
