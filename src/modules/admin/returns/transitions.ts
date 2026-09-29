import type { ReturnStatus } from "./types";

/**
 * Legal return-status transition map — single source of truth shared between
 * the server-side status route and the AdminReturnActionForm client component.
 *
 * When adding a new transition, update ONLY this file.
 */
export const RETURN_VALID_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ["approved", "rejected"],
  approved: ["picked_up", "rejected"],
  rejected: [],
  picked_up: ["refunded"],
  refunded: [],
};
