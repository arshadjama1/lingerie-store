import { NextResponse } from "next/server";

import { withErrorHandling } from "@/lib/errors";

import { listCoupons } from "@/modules/coupons";

export interface AvailableCouponItem {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  minOrderValue: number;
  description: string;
  highlight?: string;
}

const DEFAULT_COUPONS: AvailableCouponItem[] = [
  {
    id: "c_first10",
    code: "FIRST10",
    name: "First Order Special",
    type: "percentage",
    value: 10,
    minOrderValue: 499,
    description: "Get 10% OFF on your very first order at Surekh.",
    highlight: "Popular for new shoppers",
  },
  {
    id: "c_surekh100",
    code: "SUREKH100",
    name: "Surekh Delight",
    type: "fixed_amount",
    value: 100,
    minOrderValue: 999,
    description: "Flat ₹100 OFF on all bras, sleepwear, and loungewear.",
    highlight: "Min. order ₹999",
  },
  {
    id: "c_comfort20",
    code: "COMFORT20",
    name: "Luxury Intimates Bundle",
    type: "percentage",
    value: 20,
    minOrderValue: 1999,
    description: "Flat 20% OFF on premium modal & bamboo edits.",
    highlight: "Min. order ₹1,999",
  },
  {
    id: "c_freeship",
    code: "FREESHIP",
    name: "Free Discreet Shipping",
    type: "fixed_amount",
    value: 99,
    minOrderValue: 499,
    description: "Zero shipping fee delivered in 100% unmarked discreet box.",
    highlight: "Instant free delivery",
  },
];

export const GET = withErrorHandling(async () => {
  try {
    const dbCoupons = await listCoupons();
    if (dbCoupons && dbCoupons.length > 0) {
      const active = dbCoupons
        .filter((c) => c.isActive)
        .map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name || c.code,
          type: c.type,
          value: Number(c.value),
          minOrderValue: Number(c.minOrderValue || 0),
          description:
            c.type === "percentage"
              ? `Get ${c.value}% OFF on your order`
              : `Flat ₹${c.value} OFF on qualifying items`,
          highlight:
            Number(c.minOrderValue) > 0
              ? `Min. order ₹${Number(c.minOrderValue).toLocaleString("en-IN")}`
              : undefined,
        }));
      return NextResponse.json({ coupons: active });
    }
  } catch {
    // Fallback to default promo list if DB query encounters table setup discrepancies
  }

  return NextResponse.json({ coupons: DEFAULT_COUPONS });
});
