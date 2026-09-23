import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft, CreditCard, MapPin, Package2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

import { getProductIdByVariantId } from "@/modules/catalog";
import { getOrderDetails } from "@/modules/orders";
import { hasUserReviewedProduct } from "@/modules/reviews";

import { CancelOrderButton } from "@/components/orders/CancelOrderButton";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { ReturnRequestForm } from "@/components/orders/ReturnRequestForm";
import { StatusTimeline } from "@/components/orders/StatusTimeline";
import { WriteReviewButton } from "@/components/orders/WriteReviewButton";

export const dynamic = "force-dynamic";

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;
const RETURNABLE_STATUSES = ["delivered"] as const;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  card: "Credit / Debit Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
  cod: "Cash on Delivery",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params: _params,
}: OrderDetailPageProps) {
  return {
    title: `Order Details | Surekh`,
    description: `View details for your Surekh order.`,
  };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  const { id: orderId } = await params;

  let order;
  try {
    order = await getOrderDetails(orderId, user.id);
  } catch {
    notFound();
  }

  const canCancel = (CANCELLABLE_STATUSES as readonly string[]).includes(
    order.status
  );
  const canReturn = (RETURNABLE_STATUSES as readonly string[]).includes(
    order.status
  );

  const isDelivered = order.status === "delivered";
  const productIdMap: Record<string, string> = {};
  const reviewedSet = new Set<string>();

  if (isDelivered && order.items.length > 0) {
    const itemProductPairs = await Promise.all(
      order.items.map(async (item) => {
        const pId = await getProductIdByVariantId(item.variantId);
        return { itemId: item.id, productId: pId };
      })
    );

    for (const pair of itemProductPairs) {
      if (pair.productId) {
        productIdMap[pair.itemId] = pair.productId;
      }
    }

    const uniqueProductIds = Array.from(new Set(Object.values(productIdMap)));
    const reviewChecks = await Promise.all(
      uniqueProductIds.map(async (pId) => {
        const reviewed = await hasUserReviewedProduct(user.id, pId);
        return { productId: pId, reviewed };
      })
    );

    for (const check of reviewChecks) {
      if (check.reviewed) {
        reviewedSet.add(check.productId);
      }
    }
  }

  const address = order.shippingAddress;

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            My Orders
          </Link>
        </div>

        {/* Order header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-lg font-bold text-neutral-900">
              {order.orderNumber}
            </p>
            <p className="text-xs text-neutral-500">
              Placed on{" "}
              {new Date(
                order.statusHistory[0]?.createdAt ?? new Date()
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="space-y-4">
          {/* Status Timeline */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-5 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              Order Timeline
            </h2>
            <StatusTimeline entries={order.statusHistory} />
          </section>

          {/* Items */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              <Package2 className="h-4 w-4" />
              Items Ordered
            </h2>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {item.productSnapshot.productName}
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-neutral-500">
                        {item.productSnapshot.sku && (
                          <span>SKU: {item.productSnapshot.sku}</span>
                        )}
                        {item.productSnapshot.size && (
                          <span>Size: {item.productSnapshot.size}</span>
                        )}
                        {item.productSnapshot.color && (
                          <span>Color: {item.productSnapshot.color}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-neutral-900">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                  {isDelivered && productIdMap[item.id] && (
                    <div className="mt-3">
                      <WriteReviewButton
                        productId={productIdMap[item.id]}
                        productName={item.productSnapshot.productName}
                        orderId={order.id}
                        alreadyReviewed={reviewedSet.has(productIdMap[item.id])}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Payment Summary */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              <CreditCard className="h-4 w-4" />
              Payment Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>GST</span>
                <span>{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>
                  {Number(order.shippingAmount) === 0
                    ? "Free"
                    : formatPrice(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              {order.payment?.method && (
                <p className="pt-1 text-xs text-neutral-400">
                  Paid via{" "}
                  {PAYMENT_METHOD_LABELS[order.payment.method] ??
                    order.payment.method}
                </p>
              )}
            </div>
          </section>

          {/* Delivery Address */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </h2>
            <address className="text-sm leading-relaxed text-neutral-700 not-italic">
              <p className="font-semibold text-neutral-900">
                {address.fullName}
              </p>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}, {address.state} – {address.pincode}
              </p>
              {address.phone && (
                <p className="mt-1 text-neutral-500">📞 {address.phone}</p>
              )}
            </address>
          </section>

          {/* DTDC Tracking */}
          {order.awbNumber && (
            <OrderTrackingTimeline
              orderId={order.id}
              awbNumber={order.awbNumber}
              orderStatus={order.status}
            />
          )}

          {/* Action Zone */}
          {(canCancel || canReturn) && (
            <section className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
                Order Actions
              </h2>
              {canCancel && <CancelOrderButton orderId={order.id} />}
              {canReturn && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-neutral-800">
                    Request a Return
                  </h3>
                  <ReturnRequestForm orderId={order.id} />
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
