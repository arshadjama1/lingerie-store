import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CheckCircle2, Home, MapPin, Truck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  estimatedDeliveryWindow,
  formatDeliveryWindow,
} from "@/modules/shipping";

import { FulfillmentStepper } from "@/components/orders/FulfillmentStepper";
import { OrderSuccessCartSync } from "@/components/orders/OrderSuccessCartSync";

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { id: orderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-neutral-50/50 px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-[var(--accent)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-neutral-900">
            Order Placed Successfully
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">
            Please sign in with the mobile number or email used during checkout
            to view your complete invoice and live shipping tracker.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href={`/login?redirect=/order-success/${orderId}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition hover:bg-[var(--accent-dark)]"
            >
              Sign In to View Order
            </Link>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [order, payment] = await Promise.all([
    db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    }),
    db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    }),
  ]);

  if (!order) {
    notFound();
  }

  if (order.userId !== user.id) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-neutral-50/50 px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-neutral-900">
            Order Access Restricted
          </h1>
          <p className="mt-2 text-xs text-neutral-600">
            This order belongs to a different account. Please sign in with the
            account used at checkout.
          </p>
          <Link
            href="/account/orders"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm"
          >
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCod = payment?.method === "cod";

  const address = order.shippingAddress as {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };

  // Compute estimated delivery window server-side (no API call — heuristic only)
  const deliveryWindow =
    order.confirmedAt && address.pincode
      ? formatDeliveryWindow(
          estimatedDeliveryWindow(order.confirmedAt, address.pincode)
        )
      : null;

  return (
    <div className="min-h-screen bg-neutral-50/50 pt-12 pb-16">
      <OrderSuccessCartSync />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {/* Confirmation header */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900">
              Order Confirmed!
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Thank you for shopping with Surekh. Your order has been placed.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 font-mono text-sm font-semibold text-neutral-800">
              <span>Order Number:</span>
              <span className="text-rose-600">{order.orderNumber}</span>
            </div>
          </div>

          {/* Estimated delivery banner */}
          {deliveryWindow && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <Truck className="h-5 w-5 shrink-0 text-blue-500" />
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Estimated delivery:</span>{" "}
                {deliveryWindow}
              </p>
            </div>
          )}

          {/* Fulfillment stepper at Step 2 */}
          <div className="mt-6">
            <FulfillmentStepper
              status={order.status}
              confirmedAt={order.confirmedAt}
              shippedAt={order.shippedAt}
              deliveredAt={order.deliveredAt}
              cancelledAt={order.cancelledAt}
              awbNumber={order.awbNumber}
              estimatedDelivery={deliveryWindow}
            />
          </div>

          {/* Delivery Address Snapshot */}
          <div className="mt-6 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-left">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <MapPin className="h-4 w-4 text-neutral-500" />
              Delivery Address
            </h3>
            <p className="text-sm font-medium text-neutral-800">
              {address.fullName}
            </p>
            <p className="text-xs text-neutral-600">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
            </p>
            <p className="text-xs text-neutral-600">
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-xs font-medium text-neutral-600">
              Phone: {address.phone}
            </p>
          </div>

          {/* Purchased Items */}
          <div className="mt-6 text-left">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              Order Items ({order.items.length})
            </h3>
            <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
              {order.items.map((item) => {
                const snapshot = item.productSnapshot as {
                  productName?: string;
                  sku?: string;
                  size?: string;
                  color?: string;
                };

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 text-sm"
                  >
                    <div>
                      <h4 className="font-medium text-neutral-900">
                        {snapshot.productName || "Product"}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        SKU: {snapshot.sku} | Qty: {item.quantity}
                        {snapshot.size ? ` | Size: ${snapshot.size}` : ""}
                      </p>
                    </div>
                    <div className="font-semibold text-neutral-900">
                      ₹{Number(item.total).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Summary */}
          {isCod ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm font-bold text-amber-900">
                <span>Amount to Pay on Delivery</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-1 text-xs text-amber-700">
                Please keep exact change ready. Our courier will collect this
                amount when delivering your order.
              </p>
            </div>
          ) : (
            <div className="mt-6 flex justify-between border-t border-neutral-200 pt-4 text-sm font-bold text-neutral-900">
              <span>Total Paid</span>
              <span className="text-rose-600">
                ₹{Number(order.total).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/account/orders/${order.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 sm:w-auto"
            >
              <Truck className="h-4 w-4" />
              Track Your Order
            </Link>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Cancellation reassurance note */}
          <p className="mt-5 text-center text-xs text-neutral-400">
            Need to change your mind? Free cancellation is available from your{" "}
            <Link
              href={`/account/orders/${order.id}`}
              className="text-neutral-600 underline hover:text-neutral-900"
            >
              order details
            </Link>{" "}
            before warehouse dispatch.
          </p>
        </div>
      </div>
    </div>
  );
}
