import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CheckCircle2, Home } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

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
    notFound();
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: true,
    },
  });

  if (!order || order.userId !== user.id) {
    notFound();
  }

  const address = order.shippingAddress as {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pt-12 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-neutral-900">
            Order Confirmed!
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Thank you for shopping with LINGE. Your order has been placed.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 font-mono text-sm font-semibold text-neutral-800">
            <span>Order Number:</span>
            <span className="text-rose-600">{order.orderNumber}</span>
          </div>

          {/* Delivery Address Snapshot */}
          <div className="mt-8 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-left">
            <h3 className="text-sm font-semibold text-neutral-900">
              Delivery Address Snapshot
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
          <div className="mt-6 flex justify-between border-t border-neutral-200 pt-4 text-sm font-bold text-neutral-900">
            <span>Total Paid</span>
            <span className="text-rose-600">
              ₹{Number(order.total).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
