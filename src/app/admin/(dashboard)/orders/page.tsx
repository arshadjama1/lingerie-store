import { buildQueryString } from "@/lib/utils";

import { listAllOrders } from "@/modules/admin/orders";
import type { OrderStatus } from "@/modules/orders";

import { AdminOrdersTableClient } from "@/components/admin/orders/AdminOrdersTableClient";
import { Pagination } from "@/components/common/pagination";

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

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const {
    page: pageStr,
    status: statusParam,
    search: searchParam,
  } = await searchParams;

  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const status = ORDER_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const search = searchParam?.trim() || undefined;

  const result = await listAllOrders({ page, status, search });

  function buildUrl(p: number) {
    return "/admin/orders" + buildQueryString({ page: p, status, search });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Manage fulfillment lifecycle, track courier dispatch, and batch update
          orders.
        </p>
      </div>

      {/* Orders Table with Search, Tabs & Batch Actions */}
      <AdminOrdersTableClient
        orders={result.orders}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        statusCounts={result.statusCounts}
        currentStatus={status}
        currentSearch={search}
      />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          buildUrl={buildUrl}
        />
      )}
    </div>
  );
}
