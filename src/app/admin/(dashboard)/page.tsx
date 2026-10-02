import Link from "next/link";

import {
  AlertTriangle,
  ArrowUpRight,
  IndianRupee,
  MessageSquare,
  RotateCcw,
  ShoppingBag,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";

import { getDashboardMetrics } from "@/modules/admin/dashboard";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Executive Operations Center
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time sales velocity, order fulfillment status, and inventory
            health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50"
          >
            <Tag className="h-3.5 w-3.5 text-[#3d0a20]" />
            New Coupon
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#3d0a20] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#571030]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Actionable Operations Alerts Strip */}
      {(metrics.lowStockCount > 0 ||
        metrics.pendingReviewsCount > 0 ||
        metrics.pendingReturnsCount > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {metrics.lowStockCount > 0 && (
            <Link
              href="/admin/inventory?lowStockOnly=true"
              className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 transition hover:bg-amber-100/60"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>
                  <strong>{metrics.lowStockCount}</strong> variant
                  {metrics.lowStockCount !== 1 ? "s" : ""} at or below restock
                  threshold
                </span>
              </div>
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                View Stock <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          )}

          {metrics.pendingReviewsCount > 0 && (
            <Link
              href="/admin/reviews?status=pending"
              className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 transition hover:bg-blue-100/60"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span>
                  <strong>{metrics.pendingReviewsCount}</strong> review
                  {metrics.pendingReviewsCount !== 1 ? "s" : ""} awaiting
                  moderation
                </span>
              </div>
              <span className="flex items-center gap-1 font-semibold text-blue-700">
                Moderate <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          )}

          {metrics.pendingReturnsCount > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50/70 p-3.5 text-xs text-purple-900">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="h-4 w-4 text-purple-600" />
                <span>
                  <strong>{metrics.pendingReturnsCount}</strong> return request
                  {metrics.pendingReturnsCount !== 1 ? "s" : ""} submitted
                </span>
              </div>
              <span className="font-semibold text-purple-700">Returns</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wide uppercase">
              Gross Revenue
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {formatPrice(metrics.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium text-emerald-700">
              +{formatPrice(metrics.todayRevenue)}
            </span>{" "}
            booked today
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wide uppercase">
              Total Orders
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.totalOrders}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium text-blue-700">
              +{metrics.todayOrders}
            </span>{" "}
            placed today
          </div>
        </div>

        {/* Average Order Value */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wide uppercase">
              Avg Order Value (AOV)
            </span>
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {formatPrice(metrics.averageOrderValue)}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Average basket size across all channels
          </div>
        </div>

        {/* Registered Customers */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold tracking-wide uppercase">
              Registered Customers
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.totalCustomers}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Active customer profiles on store
          </div>
        </div>
      </div>

      {/* Order Status Distribution Strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-sm font-bold tracking-wide text-gray-900 uppercase">
              Fulfillment Pipeline
            </h2>
            <p className="text-xs text-gray-500">
              Real-time distribution of orders across shipment stages
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-[#3d0a20] hover:underline"
          >
            All Orders <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            {
              label: "Pending",
              status: "pending",
              count: metrics.ordersByStatus.pending,
              color: "text-amber-700 bg-amber-50 border-amber-200",
            },
            {
              label: "Confirmed",
              status: "confirmed",
              count: metrics.ordersByStatus.confirmed,
              color: "text-blue-700 bg-blue-50 border-blue-200",
            },
            {
              label: "Processing",
              status: "processing",
              count: metrics.ordersByStatus.processing,
              color: "text-indigo-700 bg-indigo-50 border-indigo-200",
            },
            {
              label: "Shipped",
              status: "shipped",
              count: metrics.ordersByStatus.shipped,
              color: "text-purple-700 bg-purple-50 border-purple-200",
            },
            {
              label: "Delivered",
              status: "delivered",
              count: metrics.ordersByStatus.delivered,
              color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            },
            {
              label: "Cancelled",
              status: "cancelled",
              count: metrics.ordersByStatus.cancelled,
              color: "text-gray-700 bg-gray-50 border-gray-200",
            },
            {
              label: "Refunded",
              status: "refunded",
              count: metrics.ordersByStatus.refunded,
              color: "text-rose-700 bg-rose-50 border-rose-200",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={`/admin/orders?status=${item.status}`}
              className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition hover:shadow-xs ${item.color}`}
            >
              <span className="text-xl font-bold">{item.count}</span>
              <span className="mt-0.5 text-[11px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <p className="text-xs text-gray-500">
              Latest transactions placed across the platform
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-[#3d0a20] hover:underline"
          >
            View all orders <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {metrics.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No orders found in database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold tracking-wider uppercase">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wider uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wider uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wider uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left font-semibold tracking-wider uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right font-semibold tracking-wider uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.recentOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {ord.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-3 text-gray-600">
                      {ord.customerEmail ?? "—"}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="px-6 py-3">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="font-semibold text-[#3d0a20] hover:underline"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feature Roadmap & Operational Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-50 p-2.5 text-[#3d0a20]">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Marketing & Offers
              </h3>
              <p className="text-xs text-gray-500">
                Flash sales & bundle coupons
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Launch percentage or flat discounts, first-order bonuses, and
            category promo codes.
          </p>
          <Link
            href="/admin/coupons"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#3d0a20] hover:underline"
          >
            Manage Coupons →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Review Moderation
              </h3>
              <p className="text-xs text-gray-500">
                Verified buyer testimonials
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Moderate, approve, or reject customer feedback and fit
            recommendations before display.
          </p>
          <Link
            href="/admin/reviews"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
          >
            Moderate Reviews →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                DTDC Fulfillment
              </h3>
              <p className="text-xs text-gray-500">
                Shipments & AWB generation
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Assign AWB codes, print shipping labels, and track delivery progress
            across India.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:underline"
          >
            Fulfillment Queue →
          </Link>
        </div>
      </div>
    </div>
  );
}
