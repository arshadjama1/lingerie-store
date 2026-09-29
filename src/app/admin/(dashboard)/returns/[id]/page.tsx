import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeft } from "lucide-react";

import { formatPrice } from "@/lib/utils";

import { getAdminReturnDetails } from "@/modules/admin/returns";

import { AdminReturnActionForm } from "@/components/admin/AdminReturnActionForm";
import { ReturnStatusBadge } from "@/components/admin/ReturnStatusBadge";

export const dynamic = "force-dynamic";

interface AdminReturnDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(_: AdminReturnDetailPageProps) {
  return { title: "Return Request | Surekh Admin" };
}

export default async function AdminReturnDetailPage({
  params,
}: AdminReturnDetailPageProps) {
  const { id } = await params;

  const req = await getAdminReturnDetails(id).catch(() => notFound());

  const addr = req.shippingAddress;

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/returns"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Returns
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="font-mono text-lg font-bold text-gray-900">
          {req.orderNumber}
        </h1>
        <ReturnStatusBadge status={req.status} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT — 60% */}
        <div className="space-y-6 lg:col-span-3">
          {/* Return details */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Return Request
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <ReturnStatusBadge status={req.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900">
                  {req.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="text-gray-900">
                  {req.updatedAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>

            {/* Reason block */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Customer Reason
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                {req.reason}
              </p>
            </div>

            {/* Admin notes block */}
            {req.notes && (
              <div className="mt-4 rounded-none bg-amber-50 px-3 py-2">
                <p className="mb-1 text-xs font-semibold tracking-wide text-amber-700 uppercase">
                  Admin Notes
                </p>
                <p className="text-sm text-amber-800">{req.notes}</p>
              </div>
            )}
          </section>

          {/* Order items */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Items in Order
            </h2>
            <div className="divide-y divide-gray-100">
              {req.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.productSnapshot.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[
                        item.productSnapshot.sku,
                        item.productSnapshot.size &&
                          `Size: ${item.productSnapshot.size}`,
                        item.productSnapshot.color &&
                          `Color: ${item.productSnapshot.color}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-gray-200 pt-3 text-sm">
              <span className="font-semibold text-gray-700">Order Total</span>
              <span className="font-bold text-gray-900">
                {formatPrice(req.orderTotal)}
              </span>
            </div>
          </section>

          {/* Customer */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Customer
            </h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{req.customerEmail ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{addr.phone ?? "—"}</dd>
              </div>
            </dl>
          </section>

          {/* Shipping address */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Shipping Address
            </h2>
            <address className="space-y-0.5 text-sm text-gray-700 not-italic">
              {addr.fullName && (
                <p className="font-semibold">{addr.fullName}</p>
              )}
              {addr.line1 && <p>{addr.line1}</p>}
              {addr.line2 && <p>{addr.line2}</p>}
              {(addr.city || addr.state || addr.pincode) && (
                <p>
                  {[addr.city, addr.state].filter(Boolean).join(", ")}
                  {addr.pincode && ` – ${addr.pincode}`}
                </p>
              )}
            </address>
          </section>
        </div>

        {/* RIGHT — 40% */}
        <div className="space-y-6 lg:col-span-2">
          {/* Linked order */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Linked Order
            </h2>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-gray-900">
                {req.orderNumber}
              </span>
              <Link
                href={`/admin/orders/${req.orderId}`}
                className="text-xs font-semibold text-[#3d0a20] hover:underline"
              >
                View Order →
              </Link>
            </div>
            <p className="mt-1 text-xs text-gray-500 capitalize">
              Order status:{" "}
              <span className="font-semibold">{req.orderStatus}</span>
            </p>
          </section>

          {/* Take action */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Take Action
            </h2>
            <AdminReturnActionForm
              returnId={req.id}
              currentStatus={req.status}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
