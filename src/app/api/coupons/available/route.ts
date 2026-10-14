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

export const GET = withErrorHandling(async () => {
  const dbCoupons = await listCoupons();
  const activeCoupons = dbCoupons.filter((c) => c.isActive);

  return NextResponse.json({ coupons: formatCoupons(activeCoupons) });
});

function formatCoupons(
  coupons: Awaited<ReturnType<typeof listCoupons>>
): AvailableCouponItem[] {
  return coupons.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name || c.code,
    type: c.type,
    value: Number(c.value),
    minOrderValue: Number(c.minOrderValue || 0),
    description:
      c.type === "percentage"
        ? `Get ${c.value}% OFF on your order`
        : c.type === "free_shipping"
          ? "Zero shipping fee — delivered in a 100% unmarked discreet box."
          : `Flat ₹${c.value} OFF on qualifying items`,
    highlight:
      Number(c.minOrderValue) > 0
        ? `Min. order ₹${Number(c.minOrderValue).toLocaleString("en-IN")}`
        : undefined,
  }));
}
