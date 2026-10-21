import React from "react";

export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Top Welcome & Actions Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-md bg-gray-200" />
          <div className="h-4 w-96 max-w-full rounded-md bg-gray-100" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="h-9 w-28 rounded-md bg-gray-200" />
          <div className="h-9 w-32 rounded-md bg-gray-200" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="h-8 w-8 rounded-lg bg-gray-100" />
            </div>
            <div className="mt-4 h-7 w-28 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-36 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Order Status Distribution Strip Skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-3 w-60 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-20 rounded bg-gray-100" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50/80 p-3"
            >
              <div className="h-6 w-8 rounded bg-gray-200" />
              <div className="mt-1.5 h-3 w-14 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Section Skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="space-y-1">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-3 w-52 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-24 rounded bg-gray-100" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-12 rounded bg-gray-200" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-14 rounded bg-gray-200" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="ml-auto h-3 w-12 rounded bg-gray-200" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-3.5">
                    <div className="h-3.5 w-24 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="h-3.5 w-20 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="h-3.5 w-32 rounded bg-gray-100" />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="h-3.5 w-16 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="h-5 w-20 rounded-full bg-gray-100" />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="ml-auto h-3.5 w-14 rounded bg-gray-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
