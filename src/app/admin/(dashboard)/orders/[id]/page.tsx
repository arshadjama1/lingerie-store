import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeft } from "lucide-react";

import { formatPrice } from "@/lib/utils";

import { getAdminOrderDetails } from "@/modules/admin/orders";

import { AdminCollectCodButton } from "@/components/admin/AdminCollectCodButton";
import { AdminShipForm } from "@/components/admin/AdminShipForm";
import { AdminStatusForm } from "@/components/admin/AdminStatusForm";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { StatusTimeline } from "@/components/orders/StatusTimeline";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params: _params,
}: AdminOrderDetailPageProps) {
  return {
    title: "Order Detail | Surekh Admin",
  };
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  const order = await getAdminOrderDetails(id).catch(() => notFound());

  const addr = order.shippingAddress;

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="font-mono text-lg font-bold text-gray-900">
          {order.orderNumber}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT — 60% */}
        <div className="space-y-6 lg:col-span-3">
          {/* Status timeline */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Status Timeline
            </h2>
            <StatusTimeline entries={order.statusHistory} />
          </section>

          {/* Items */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Items
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
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
            {/* Totals */}
            <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>
                  {Number(order.shippingAmount) === 0
                    ? "Free"
                    : formatPrice(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Payment */}
          {order.payment && (
            <section className="rounded-none border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Payment
              </h2>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Method</dt>
                  <dd className="flex items-center gap-2 font-semibold text-gray-900 uppercase">
                    {order.payment.method ?? "—"}
                    {order.payment.method === "cod" && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        PAY ON DELIVERY
                      </span>
                    )}
                  </dd>
                </div>
                {order.payment.method !== "cod" && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Razorpay ID</dt>
                    <dd className="font-mono text-xs text-gray-700">
                      {order.payment.razorpayPaymentId ?? "—"}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Payment Status</dt>
                  <dd className="font-semibold text-gray-900 uppercase">
                    {order.payment.status === "captured" ? (
                      <span className="inline-flex items-center rounded-none bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {order.payment.method === "cod"
                          ? "Collected / Paid"
                          : "Paid"}
                      </span>
                    ) : order.payment.status === "pending" ? (
                      <span className="inline-flex items-center rounded-none bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Pending Collection
                      </span>
                    ) : (
                      order.payment.status
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-semibold text-gray-900">
                    {formatPrice(order.payment.amount)}
                  </dd>
                </div>
              </dl>
              {order.payment.method === "cod" &&
                order.payment.status !== "captured" && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <AdminCollectCodButton orderId={order.id} />
                  </div>
                )}
            </section>
          )}

          {/* Customer */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Customer
            </h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{order.customerEmail ?? "—"}</dd>
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
          {/* Update Status */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Update Status
            </h2>
            <AdminStatusForm orderId={order.id} currentStatus={order.status} />
          </section>

          {/* DTDC Shipment */}
          <section className="rounded-none border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              DTDC Shipment
            </h2>
            {order.awbNumber && (
              <div className="mb-4 rounded-none bg-gray-50 px-3 py-2 text-xs">
                <span className="text-gray-500">Current AWB: </span>
                <span className="font-mono font-semibold text-gray-900">
                  {order.awbNumber}
                </span>
              </div>
            )}
            <AdminShipForm orderId={order.id} currentAwb={order.awbNumber} />
          </section>
        </div>
      </div>
    </div>
  );
}
