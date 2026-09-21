import Link from "next/link";

import { buildQueryString, formatPrice } from "@/lib/utils";

import { listAllOrders } from "@/modules/admin/orders";
import type { OrderStatus } from "@/modules/orders";

import { Pagination } from "@/components/common/pagination";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export const dynamic = "force-dynamic";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { page: pageStr, status: statusParam } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const status = ORDER_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const result = await listAllOrders({ page, status });

  function buildUrl(p: number) {
    return "/admin/orders" + buildQueryString({ page: p, status });
  }

  function buildFilterUrl(s: string | undefined) {
    return "/admin/orders" + buildQueryString({ status: s, page: 1 });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {result.total} order{result.total !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildFilterUrl(undefined)}
            className={`rounded-none border px-3 py-1 text-xs font-semibold transition-colors ${
              !status
                ? "border-[#3d0a20] bg-[#3d0a20] text-white"
                : "border-gray-200 text-gray-600 hover:border-[#3d0a20] hover:text-[#3d0a20]"
            }`}
          >
            All
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link
              key={s}
              href={buildFilterUrl(s)}
              className={`rounded-none border px-3 py-1 text-xs font-semibold transition-colors ${
                status === s
                  ? "border-[#3d0a20] bg-[#3d0a20] text-white"
                  : "border-gray-200 text-gray-600 hover:border-[#3d0a20] hover:text-[#3d0a20]"
              }`}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders table */}
      {result.orders.length === 0 ? (
        <div className="rounded-none border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-none border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Order #",
                  "Date",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-600">
                    {order.customerEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {order.itemCount}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold text-[#3d0a20] hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        buildUrl={buildUrl}
      />
    </div>
  );
}
