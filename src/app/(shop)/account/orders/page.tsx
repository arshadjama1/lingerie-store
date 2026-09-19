import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, Package } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { buildQueryString } from "@/lib/utils";

import { listUserOrders } from "@/modules/orders";

import { Pagination } from "@/components/common/pagination";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Orders | Surekh",
  description: "View and manage all your Surekh orders.",
};

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1"));

  const { orders, total, totalPages } = await listUserOrders(user.id, { page });

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Account
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-neutral-900">
            My Orders
          </h1>
          {total > 0 && (
            <span className="text-sm text-neutral-500">
              {total} {total === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-20 text-center">
            <Package className="mb-3 h-12 w-12 text-neutral-300" />
            <h2 className="text-base font-semibold text-neutral-700">
              No orders yet
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              When you place your first order, it will appear here.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: order info */}
                  <div className="min-w-0">
                    <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-neutral-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"} ·{" "}
                      <span className="font-medium text-neutral-800">
                        {formatPrice(order.total)}
                      </span>
                    </p>
                  </div>

                  {/* Right: status + link */}
                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <OrderStatusBadge status={order.status} />
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-xs font-medium text-rose-700 hover:text-rose-900 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  buildUrl={(p) =>
                    `/account/orders${buildQueryString({ page: p })}`
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
