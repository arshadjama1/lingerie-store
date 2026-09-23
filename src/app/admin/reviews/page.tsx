import Link from "next/link";

import { buildQueryString } from "@/lib/utils";

import { listAdminReviews } from "@/modules/reviews";

import { AdminReviewsTable } from "@/components/admin/AdminReviewsTable";
import { Pagination } from "@/components/common/pagination";

export const dynamic = "force-dynamic";

interface AdminReviewsPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const { status: statusParam, page: pageStr } = (await searchParams) ?? {};

  const status =
    statusParam === "approved" || statusParam === "pending"
      ? statusParam
      : "pending";

  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const result = await listAdminReviews({
    status,
    page,
    limit: 20,
  });

  function buildUrl(p: number) {
    return (
      "/admin/reviews" +
      buildQueryString({
        status,
        page: p,
      })
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reviews Moderation
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Moderate and approve customer reviews submitted by verified buyers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <Link
            href="/admin/reviews?status=pending"
            className={`border-b-2 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${
              status === "pending"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Pending Moderation
          </Link>
          <Link
            href="/admin/reviews?status=approved"
            className={`border-b-2 py-3 text-xs font-bold tracking-wider uppercase transition-colors ${
              status === "approved"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Approved Reviews
          </Link>
        </nav>
      </div>

      {/* Reviews Table */}
      <AdminReviewsTable
        key={`${status}-${page}`}
        initialReviews={result.reviews}
        status={status}
      />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          buildUrl={buildUrl}
          className="mt-6"
        />
      )}
    </div>
  );
}
