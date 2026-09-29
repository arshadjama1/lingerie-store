import Link from "next/link";

import { buildQueryString } from "@/lib/utils";

import { type ReturnStatus, listAllReturns } from "@/modules/admin/returns";

import { ReturnStatusBadge } from "@/components/admin/ReturnStatusBadge";
import { Pagination } from "@/components/common/pagination";

export const dynamic = "force-dynamic";

const RETURN_STATUSES: ReturnStatus[] = [
  "requested",
  "approved",
  "rejected",
  "picked_up",
  "refunded",
];

const STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  picked_up: "Picked Up",
  refunded: "Refunded",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminReturnsPage({ searchParams }: PageProps) {
  const { page: pageStr, status: statusParam } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const status = RETURN_STATUSES.includes(statusParam as ReturnStatus)
    ? (statusParam as ReturnStatus)
    : undefined;

  const result = await listAllReturns({ page, status });

  function buildUrl(p: number) {
    return "/admin/returns" + buildQueryString({ page: p, status });
  }

  function buildFilterUrl(s: string | undefined) {
    return "/admin/returns" + buildQueryString({ status: s, page: 1 });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Returns &amp; Exchanges
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {result.total} request{result.total !== 1 ? "s" : ""} total
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
          {RETURN_STATUSES.map((s) => (
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

      {/* Returns table */}
      {result.returns.length === 0 ? (
        <div className="rounded-none border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">No return requests found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-none border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Order #", "Date", "Customer", "Reason", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.returns.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900">
                    {req.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {req.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-sm text-gray-600">
                    {req.customerEmail ?? "—"}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-sm text-gray-600">
                    {req.reason}
                  </td>
                  <td className="px-4 py-3">
                    <ReturnStatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/returns/${req.id}`}
                      className="text-xs font-semibold text-[#3d0a20] hover:underline"
                    >
                      Review →
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
