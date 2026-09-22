import { z } from "zod";

import { AppError } from "@/lib/errors";

// ─── CouponError ──────────────────────────────────────────────────────────────

export class CouponError extends AppError {
  constructor(message: string) {
    super(message, 400, "COUPON_ERROR");
    this.name = "CouponError";
  }
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  cartSubtotal: z.number().positive("Cart subtotal must be positive"),
});

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().max(255).optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  perUserLimit: z.literal(1).default(1),
  startsAt: z.string().min(1, "Start date is required"),
  expiresAt: z.string().optional(),
  // Extended rule fields
  isFirstOrderOnly: z.boolean().default(false),
  applicableCategoryId: z.string().optional(),
  minItemCount: z.number().int().min(1).optional(),
  bundleProductIds: z.array(z.string()).optional(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export type ValidatedCoupon = {
  couponId: string;
  code: string;
  discountAmount: number;
  type: "percentage" | "fixed";
  value: number;
};

// ─── Re-exports from queries ─────────────────────────────────────────────────

export {
  createCoupon,
  deactivateCoupon,
  getCouponCode,
  listCoupons,
  recordCouponUsage,
  validateCoupon,
} from "./queries";
