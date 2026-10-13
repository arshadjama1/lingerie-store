import { NextResponse } from "next/server";

import { withErrorHandling } from "@/lib/errors";

import { createCoupon, listCoupons } from "@/modules/coupons";

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

// Seeds run once when the DB has no coupons yet. `startsAt` is set to
// epoch so they are immediately active.
const DEFAULT_COUPON_SEEDS = [
  {
    code: "FIRST10",
    name: "First Order Special",
    type: "percentage" as const,
    value: 10,
    minOrderValue: 499,
    isFirstOrderOnly: true,
    startsAt: "2024-01-01T00:00:00",
    perUserLimit: 1 as const,
  },
  {
    code: "SUREKH100",
    name: "Surekh Delight",
    type: "fixed" as const,
    value: 100,
    minOrderValue: 999,
    isFirstOrderOnly: false,
    startsAt: "2024-01-01T00:00:00",
    perUserLimit: 1 as const,
  },
  {
    code: "COMFORT20",
    name: "Luxury Intimates Bundle",
    type: "percentage" as const,
    value: 20,
    minOrderValue: 1999,
    isFirstOrderOnly: false,
    startsAt: "2024-01-01T00:00:00",
    perUserLimit: 1 as const,
  },
  {
    code: "FREESHIP",
    name: "Free Discreet Shipping",
    type: "free_shipping" as const,
    value: 0,
    minOrderValue: 499,
    isFirstOrderOnly: false,
    startsAt: "2024-01-01T00:00:00",
    perUserLimit: 1 as const,
  },
];

export const GET = withErrorHandling(async () => {
  const dbCoupons = await listCoupons();
  const activeCoupons = dbCoupons.filter((c) => c.isActive);

  // Seed defaults into the DB the first time there are no coupons.
  // This ensures validateCoupon() can actually find codes shown in the UI.
  if (dbCoupons.length === 0) {
    await Promise.allSettled(
      DEFAULT_COUPON_SEEDS.map((seed) => createCoupon(seed))
    );
    // Re-fetch after seeding
    const seeded = await listCoupons();
    const seededActive = seeded.filter((c) => c.isActive);
    return NextResponse.json({ coupons: formatCoupons(seededActive) });
  }

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
