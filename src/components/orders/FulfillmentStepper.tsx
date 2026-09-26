"use client";

import {
  CheckCircle2,
  Clock,
  Package,
  PackageCheck,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { OrderStatus } from "@/modules/orders/types";

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface FulfillmentStepperProps {
  status: OrderStatus;
  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  awbNumber?: string | null;
  /** Current DTDC status code (e.g. "OFD", "OUTDLV") from live tracking */
  trackingStatusCode?: string | null;
  /** Formatted ETA string, e.g. "Tuesday, 30 Sep – Thursday, 02 Oct" */
  estimatedDelivery?: string | null;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function formatShort(date: Date | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** DTDC codes that mean "Out for Delivery" */
const OFD_CODES = new Set(["OFD", "OUTDLV"]);
/** DTDC codes that mean the shipment is in transit (not yet OFD) */
const TRANSIT_CODES = new Set(["BKD", "IPMF", "PCUP", "PCSC", "PCAW"]);

// ─────────────────────────────────────────────────────────────────────
// Step definitions
// ─────────────────────────────────────────────────────────────────────

interface Step {
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  timestamp?: string | null;
}

function buildSteps(props: FulfillmentStepperProps): Step[] {
  return [
    {
      label: "Order Confirmed",
      sublabel: "Payment verified",
      icon: CheckCircle2,
      timestamp: formatShort(props.confirmedAt),
    },
    {
      label: "Preparing Order",
      sublabel: "Packing at warehouse",
      icon: Package,
      timestamp: null,
    },
    {
      label: "Dispatched",
      sublabel: props.awbNumber ? `AWB: ${props.awbNumber}` : "DTDC Express",
      icon: Truck,
      timestamp: formatShort(props.shippedAt),
    },
    {
      label: "Out for Delivery",
      sublabel: "Final delivery hub",
      icon: PackageCheck,
      timestamp: null,
    },
    {
      label: "Delivered",
      sublabel: props.estimatedDelivery
        ? `Est. ${props.estimatedDelivery}`
        : undefined,
      icon: CheckCircle2,
      timestamp: formatShort(props.deliveredAt),
    },
  ];
}

/**
 * Returns the active step index (0-based) for the stepper.
 * Step 3 (Out for Delivery) is only activated when DTDC confirms OFD.
 */
function getActiveStep(props: FulfillmentStepperProps): number {
  const { status, trackingStatusCode } = props;
  if (status === "delivered") return 4;
  if (status === "shipped") {
    if (trackingStatusCode && OFD_CODES.has(trackingStatusCode)) return 3;
    return 2;
  }
  if (status === "processing") return 1;
  if (status === "confirmed") return 0;
  return -1; // pending / cancelled / refunded — caller handles these
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function PendingNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div>
        <p className="text-sm font-semibold text-amber-900">
          Payment being processed
        </p>
        <p className="mt-0.5 text-xs text-amber-700">
          We&apos;re verifying your payment. Your order will be confirmed within
          a few minutes. No action needed.
        </p>
      </div>
    </div>
  );
}

function CancelledNotice({ cancelledAt }: { cancelledAt: Date | null }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div>
        <p className="text-sm font-semibold text-red-900">Order Cancelled</p>
        {cancelledAt && (
          <p className="mt-0.5 text-xs text-red-700">
            Cancelled on {formatShort(cancelledAt)}
          </p>
        )}
        <p className="mt-1 text-xs text-red-600">
          If you paid online, your refund will be processed within 5–7 business
          days to your original payment method.
        </p>
      </div>
    </div>
  );
}

function RefundedNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <RefreshCcw className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      <div>
        <p className="text-sm font-semibold text-emerald-900">
          Refund Processed
        </p>
        <p className="mt-0.5 text-xs text-emerald-700">
          Your refund has been initiated. Please allow 5–7 business days for the
          amount to reflect in your original payment method.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────

export function FulfillmentStepper(props: FulfillmentStepperProps) {
  const { status, cancelledAt } = props;

  // Special states: replace stepper with a notice card
  if (status === "pending") return <PendingNotice />;
  if (status === "cancelled")
    return <CancelledNotice cancelledAt={cancelledAt} />;
  if (status === "refunded") return <RefundedNotice />;

  const activeStep = getActiveStep(props);
  const steps = buildSteps(props);

  return (
    <section
      aria-label="Order fulfillment progress"
      className="rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <h2 className="mb-5 text-sm font-semibold tracking-wider text-neutral-500 uppercase">
        Delivery Progress
      </h2>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:block">
        {/* Step icons + connector lines */}
        <div className="relative flex items-center">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const done = idx <= activeStep;
            const current = idx === activeStep;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.label} className="flex flex-1 items-center">
                {/* Circle */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                      done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : current
                          ? "border-rose-400 bg-rose-50 text-rose-600"
                          : "border-neutral-300 bg-white text-neutral-400"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Connector line between steps */}
                {!isLast && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      idx < activeStep ? "bg-emerald-400" : "bg-neutral-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step labels */}
        <div className="mt-2 flex">
          {steps.map((step, idx) => {
            const done = idx <= activeStep;
            const current = idx === activeStep;

            return (
              <div
                key={step.label}
                className={cn(
                  "flex-1 text-center",
                  idx === 0 && "text-left",
                  idx === steps.length - 1 && "text-right"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold",
                    done
                      ? "text-emerald-700"
                      : current
                        ? "text-rose-700"
                        : "text-neutral-400"
                  )}
                >
                  {step.label}
                </p>
                {step.sublabel && (
                  <p className="mt-0.5 text-[10px] leading-tight text-neutral-400">
                    {step.sublabel}
                  </p>
                )}
                {step.timestamp && (
                  <p className="mt-0.5 text-[10px] font-medium text-neutral-500">
                    {step.timestamp}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical stepper */}
      <ol className="space-y-0 sm:hidden">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const done = idx <= activeStep;
          const current = idx === activeStep;
          const isLast = idx === steps.length - 1;

          return (
            <li key={step.label} className="flex gap-3">
              {/* Left: icon + connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : current
                        ? "border-rose-400 bg-rose-50 text-rose-600"
                        : "border-neutral-300 bg-white text-neutral-400"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "my-1 w-px flex-1",
                      idx < activeStep ? "bg-emerald-300" : "bg-neutral-200"
                    )}
                    style={{ minHeight: "1.5rem" }}
                  />
                )}
              </div>

              {/* Right: text */}
              <div className={cn("pb-5", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    done
                      ? "text-emerald-700"
                      : current
                        ? "text-rose-700"
                        : "text-neutral-400"
                  )}
                >
                  {step.label}
                </p>
                {step.sublabel && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {step.sublabel}
                  </p>
                )}
                {step.timestamp && (
                  <p className="mt-0.5 text-xs font-medium text-neutral-500">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* DTDC in-transit annotation */}
      {status === "shipped" &&
        props.trackingStatusCode &&
        TRANSIT_CODES.has(props.trackingStatusCode) && (
          <p className="mt-4 text-center text-xs text-violet-600">
            📦 Your package is on the move with DTDC Express
          </p>
        )}
    </section>
  );
}
