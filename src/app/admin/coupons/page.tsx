import Link from "next/link";

import { formatPrice } from "@/lib/utils";

import { listCoupons } from "@/modules/coupons";

import { DeactivateCouponButton } from "@/components/admin/DeactivateCouponButton";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-none border border-[#3d0a20] bg-[#3d0a20] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5c1130]"
        >
          + Create Coupon
        </Link>
      </div>

      {/* Table */}
      {coupons.length === 0 ? (
        <div className="rounded-none border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">No coupons yet.</p>
          <Link
            href="/admin/coupons/new"
            className="mt-3 inline-block text-sm font-semibold text-[#3d0a20] hover:underline"
          >
            Create your first coupon →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-none border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Code",
                  "Type",
                  "Value",
                  "Min Order",
                  "Max Disc",
                  "Rules",
                  "Used / Max",
                  "First Order",
                  "Active",
                  "Starts",
                  "Expires",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-bold text-gray-900">
                    {coupon.code}
                    {coupon.name && (
                      <div className="text-xs font-normal text-gray-500">
                        {coupon.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 capitalize">
                    {coupon.type === "fixed_amount" ? "Fixed" : coupon.type}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : formatPrice(Number(coupon.value))}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {Number(coupon.minOrderValue) > 0
                      ? formatPrice(Number(coupon.minOrderValue))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {coupon.maxDiscount
                      ? formatPrice(Number(coupon.maxDiscount))
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {coupon.bundleProductIds &&
                      coupon.bundleProductIds.length > 0 && (
                        <span className="mb-1 block rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                          Bundle ({coupon.bundleProductIds.length} products)
                        </span>
                      )}
                    {coupon.applicableCategoryId && (
                      <span className="block rounded bg-violet-50 px-1.5 py-0.5 text-violet-700">
                        Category
                        {coupon.minItemCount ? ` ×${coupon.minItemCount}` : ""}
                      </span>
                    )}
                    {!coupon.bundleProductIds?.length &&
                      !coupon.applicableCategoryId &&
                      "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {coupon.usesCount}
                    {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : " / ∞"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {coupon.isFirstOrderOnly ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        coupon.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-600">
                    {coupon.startsAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-600">
                    {coupon.expiresAt
                      ? coupon.expiresAt.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.isActive && (
                      <DeactivateCouponButton couponId={coupon.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
