/**
 * Legal status transition map — single source of truth shared between the
 * server-side status route and the AdminStatusForm client component.
 *
 * When adding a new transition, update ONLY this file. Both the API validation
 * and the UI dropdown will pick up the change automatically.
 */
import type { OrderStatus } from "./types";

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};
