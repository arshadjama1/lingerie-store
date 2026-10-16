import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { OrderDetails, OrderStatus } from "@/modules/orders";

interface OrderStatusPipelineProps {
  order: OrderDetails;
}

interface StepConfig {
  key: OrderStatus;
  label: string;
  description: string;
  icon: typeof Clock;
  timestamp?: Date | null;
}

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderStatusPipeline({ order }: OrderStatusPipelineProps) {
  const isCancelled = order.status === "cancelled";
  const isRefunded = order.status === "refunded";

  const cancelEntry = order.statusHistory.find((h) => h.status === "cancelled");
  const refundEntry = order.statusHistory.find((h) => h.status === "refunded");

  const steps: StepConfig[] = [
    {
      key: "pending",
      label: "Placed",
      description: "Order received",
      icon: Clock,
      timestamp: order.statusHistory[0]?.createdAt,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      description: "Verified & approved",
      icon: CheckCircle2,
      timestamp: order.confirmedAt,
    },
    {
      key: "processing",
      label: "Processing",
      description: "Packing in progress",
      icon: Package,
      timestamp: order.statusHistory.find((h) => h.status === "processing")
        ?.createdAt,
    },
    {
      key: "shipped",
      label: "Shipped",
      description: order.awbNumber ? `AWB: ${order.awbNumber}` : "Dispatched",
      icon: Truck,
      timestamp: order.shippedAt,
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Fulfilled",
      icon: Check,
      timestamp: order.deliveredAt,
    },
  ];

  const standardOrder: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const currentIndex = standardOrder.indexOf(order.status);

  return (
    <div className="space-y-4">
      {/* Alert Banner for Cancelled / Refunded */}
      {isCancelled && (
        <div className="flex items-start gap-3 rounded-none border border-red-200 bg-red-50/80 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-800">
                Order Cancelled
              </span>
              {order.cancelledAt && (
                <span className="text-xs text-red-600">
                  on {formatDate(order.cancelledAt)}
                </span>
              )}
            </div>
            {cancelEntry?.note && (
              <p className="text-xs text-red-700">
                <span className="font-semibold">Reason / Note:</span>{" "}
                {cancelEntry.note}
              </p>
            )}
            <p className="text-[11px] text-red-600/90">
              No further actions can be performed on this order.
            </p>
          </div>
        </div>
      )}

      {isRefunded && (
        <div className="flex items-start gap-3 rounded-none border border-orange-200 bg-orange-50/80 p-4">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-orange-800">
                Order Refunded
              </span>
              <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                Full Refund Processed
              </span>
            </div>
            {refundEntry?.note && (
              <p className="text-xs text-orange-700">
                <span className="font-semibold">Reason:</span>{" "}
                {refundEntry.note}
              </p>
            )}
            {order.payment?.razorpayPaymentId && (
              <p className="font-mono text-xs text-orange-600">
                Razorpay Payment ID: {order.payment.razorpayPaymentId}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Stepper */}
      <div className="rounded-none border border-gray-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Order Fulfillment Pipeline
          </span>
          <span className="text-xs text-gray-500">
            Current status:{" "}
            <strong className="font-semibold text-gray-900 capitalize">
              {order.status}
            </strong>
          </span>
        </div>

        <div className="relative">
          {/* Connector Track */}
          <div className="absolute top-5 right-6 left-6 hidden h-0.5 bg-gray-200 sm:block" />

          {/* Steps */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 sm:gap-2">
            {steps.map((step, idx) => {
              const isPast = !isCancelled && !isRefunded && currentIndex > idx;
              const isCurrent =
                !isCancelled && !isRefunded && currentIndex === idx;
              const formattedTime = formatDate(step.timestamp);
              const StepIcon = step.icon;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "relative flex flex-row items-center gap-3 sm:flex-col sm:text-center",
                    isCurrent && "font-semibold"
                  )}
                >
                  {/* Step Node */}
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isPast
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : isCurrent
                          ? "border-[#3d0a20] bg-white text-[#3d0a20] ring-4 ring-[#3d0a20]/10"
                          : "border-gray-300 bg-gray-50 text-gray-400"
                    )}
                  >
                    {isPast ? (
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="min-w-0 flex-1 sm:mt-2">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        isPast
                          ? "text-emerald-800"
                          : isCurrent
                            ? "text-[#3d0a20]"
                            : "text-gray-400"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="truncate text-[11px] text-gray-500">
                      {step.description}
                    </p>
                    {formattedTime && (
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {formattedTime}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning if in processing without AWB */}
        {order.status === "processing" && !order.awbNumber && (
          <div className="mt-4 flex items-center gap-2 rounded border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>Ready for shipment:</strong> No DTDC AWB tracking number
              is linked yet. Create a DTDC shipment or assign an AWB before
              marking as Shipped.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
