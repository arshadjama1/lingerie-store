"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { buildQueryString, formatPrice } from "@/lib/utils";

import type { OrderStatus } from "@/modules/orders/types";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string;
  itemCount: number;
  createdAt: Date;
  customerEmail: string | null;
  awbNumber: string | null;
}

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

interface AdminOrdersTableClientProps {
  orders: AdminOrderRow[];
  total: number;
  page: number;
  totalPages: number;
  statusCounts: Record<OrderStatus, number>;
  currentStatus?: OrderStatus;
  currentSearch?: string;
}

export function AdminOrdersTableClient({
  orders,
  total: _total,
  statusCounts,
  currentStatus,
  currentSearch = "",
}: AdminOrdersTableClientProps) {
  const router = useRouter();

  // Search input state
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Batch modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchTargetStatus, setBatchTargetStatus] =
    useState<OrderStatus>("confirmed");
  const [batchLoading, setBatchLoading] = useState(false);

  const totalAllOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  function handleFilterChange(s?: OrderStatus) {
    const params: Record<string, string | number | undefined> = {
      status: s,
      page: 1,
      search: currentSearch || undefined,
    };
    router.push("/admin/orders" + buildQueryString(params));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params: Record<string, string | number | undefined> = {
      status: currentStatus,
      page: 1,
      search: searchInput.trim() || undefined,
    };
    router.push("/admin/orders" + buildQueryString(params));
  }

  function handleClearSearch() {
    setSearchInput("");
    const params: Record<string, string | number | undefined> = {
      status: currentStatus,
      page: 1,
    };
    router.push("/admin/orders" + buildQueryString(params));
  }

  // Multi-select handlers
  const allVisibleSelected =
    orders.length > 0 && orders.every((o) => selectedIds.has(o.id));

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  }

  function toggleSelectRow(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  // Execute Batch Update
  async function executeBatchUpdate() {
    if (selectedIds.size === 0) return;

    setBatchLoading(true);
    try {
      const res = await fetch("/api/admin/orders/batch-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selectedIds),
          status: batchTargetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Batch update failed");
        return;
      }

      if (data.updatedCount > 0) {
        toast.success(
          `Successfully updated ${data.updatedCount} order${
            data.updatedCount > 1 ? "s" : ""
          } to ${STATUS_LABELS[batchTargetStatus]}`
        );
      }

      if (data.failedCount > 0) {
        toast.warning(
          `${data.failedCount} order${
            data.failedCount > 1 ? "s" : ""
          } skipped due to invalid transitions`
        );
      }

      setIsBatchModalOpen(false);
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Network error during batch update");
    } finally {
      setBatchLoading(false);
    }
  }

  // Calculate batch action capabilities
  const selectedOrdersList = orders.filter((o) => selectedIds.has(o.id));
  const pendingSelectedCount = selectedOrdersList.filter(
    (o) => o.status === "pending"
  ).length;
  const confirmedSelectedCount = selectedOrdersList.filter(
    (o) => o.status === "confirmed"
  ).length;

  return (
    <div className="space-y-4">
      {/* Search & Status Filter Controls */}
      <div className="space-y-4 rounded-none border border-gray-200 bg-white p-4 shadow-xs">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Order #, customer email, phone, or AWB tracking number…"
              className="w-full border border-gray-200 bg-gray-50/50 py-2 pr-8 pl-9 text-xs focus:border-[#3d0a20] focus:bg-white focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="border border-[#3d0a20] bg-[#3d0a20] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#52102d]"
          >
            Search
          </button>
        </form>

        {/* Status Tabs with Live Count Badges */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => handleFilterChange(undefined)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition ${
              !currentStatus
                ? "border-[#3d0a20] bg-[#3d0a20] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
            }`}
          >
            <span>All</span>
            <span
              className={`py-0.2 rounded px-1.5 text-[10px] font-bold ${
                !currentStatus
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {totalAllOrders}
            </span>
          </button>

          {ORDER_STATUSES.map((s) => {
            const count = statusCounts[s] ?? 0;
            const isSelected = currentStatus === s;
            const isPendingAttention = s === "pending" && count > 0;

            return (
              <button
                key={s}
                type="button"
                onClick={() => handleFilterChange(s)}
                className={`relative flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "border-[#3d0a20] bg-[#3d0a20] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {isPendingAttention && !isSelected && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                )}
                <span>{STATUS_LABELS[s]}</span>
                <span
                  className={`py-0.2 rounded px-1.5 text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : isPendingAttention
                        ? "bg-amber-100 font-bold text-amber-900"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="rounded-none border border-gray-200 bg-white py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm font-semibold text-gray-800">
            No orders found
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {currentSearch
              ? `No results matching "${currentSearch}".`
              : currentStatus
                ? `No orders currently in "${STATUS_LABELS[currentStatus]}" status.`
                : "No orders have been placed yet."}
          </p>
          {(currentSearch || currentStatus) && (
            <button
              onClick={() => router.push("/admin/orders")}
              className="mt-4 border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-none border border-gray-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all orders"
                    className="accent-[#3d0a20]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Courier Tracking
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const isSelected = selectedIds.has(order.id);

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors hover:bg-gray-50/70 ${
                      isSelected ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(order.id)}
                        aria-label={`Select order ${order.orderNumber}`}
                        className="accent-[#3d0a20]"
                      />
                    </td>

                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:text-[#3d0a20] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="max-w-[160px] truncate px-4 py-3 text-xs text-gray-600">
                      {order.customerEmail ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                      <div>{formatPrice(order.total)}</div>
                      <div className="text-[10px] text-gray-400">
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Courier tracking */}
                    <td className="px-4 py-3 text-xs">
                      {order.awbNumber ? (
                        <a
                          href={`https://www.dtdc.in/tracking.asp?strConsignmentNo=${encodeURIComponent(
                            order.awbNumber
                          )}&addColDetails=Y`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>{order.awbNumber}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-gray-400" />
                        </a>
                      ) : order.status === "shipped" ? (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          Manual Shipped
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#3d0a20] hover:underline"
                      >
                        <span>View</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FLOATING BATCH ACTION DOCK */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform rounded-none border border-gray-300 bg-white/95 px-5 py-3 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-xs font-bold text-gray-900">
              {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
            </span>

            <div className="h-4 w-px bg-gray-200" />

            {/* Quick batch triggers */}
            {pendingSelectedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setBatchTargetStatus("confirmed");
                  setIsBatchModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Confirm {pendingSelectedCount} Pending</span>
              </button>
            )}

            {confirmedSelectedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setBatchTargetStatus("processing");
                  setIsBatchModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Process {confirmedSelectedCount} Orders</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-1.5 border border-[#3d0a20] bg-[#3d0a20] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#52102d]"
            >
              <span>Batch Status Action…</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* BATCH STATUS MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Batch Update Status
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Applying to {selectedIds.size} selected order
                  {selectedIds.size > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Target Status
                </label>
                <select
                  value={batchTargetStatus}
                  onChange={(e) =>
                    setBatchTargetStatus(e.target.value as OrderStatus)
                  }
                  className="w-full border border-gray-200 bg-white px-3 py-2 text-xs focus:border-[#3d0a20] focus:outline-none"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400">
                  Note: Any order whose current status cannot legally transition
                  to this status will be automatically skipped.
                </p>
              </div>

              {batchTargetStatus === "cancelled" && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <p className="font-semibold">Destructive Action:</p>
                  <p className="mt-0.5">
                    This will mark all eligible selected orders as Cancelled.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Abort
              </button>
              <button
                type="button"
                disabled={batchLoading}
                onClick={executeBatchUpdate}
                className="flex-1 bg-[#3d0a20] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#52102d] disabled:opacity-50"
              >
                {batchLoading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating…
                  </span>
                ) : (
                  `Update ${selectedIds.size} Orders`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
