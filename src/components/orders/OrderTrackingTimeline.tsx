"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Clock,
  ExternalLink,
  PackageCheck,
  Truck,
} from "lucide-react";

import type { DtdcTrackingResult } from "@/modules/shipping";

interface OrderTrackingTimelineProps {
  orderId: string;
  awbNumber: string;
  orderStatus: string;
}

export function OrderTrackingTimeline({
  orderId,
  awbNumber,
  orderStatus,
}: OrderTrackingTimelineProps) {
  const [tracking, setTracking] = useState<DtdcTrackingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTracking() {
      try {
        const res = await fetch(`/api/orders/${orderId}/tracking`);
        if (res.ok) {
          const data = await res.json();
          if (data.tracking) {
            setTracking(data.tracking);
          }
        }
      } catch (err) {
        console.warn("Failed to load live tracking:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTracking();
  }, [orderId]);

  const steps = [
    { label: "Booked", icon: Clock },
    { label: "In Transit", icon: Truck },
    { label: "Out for Delivery", icon: PackageCheck },
    { label: "Delivered", icon: CheckCircle2 },
  ];

  // Derive active index
  let activeStep = 0;
  if (orderStatus === "shipped") activeStep = 1;
  if (orderStatus === "delivered") activeStep = 3;

  const currentStatus =
    tracking?.currentStatus ||
    (orderStatus === "delivered" ? "Delivered" : "In Transit");

  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-200/80 pb-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-violet-700" />
          <span className="text-xs font-semibold tracking-wider text-violet-900 uppercase">
            DTDC Live Tracking
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-violet-950">
            AWB: {awbNumber}
          </span>
          <a
            href={`https://www.dtdc.in/tracking.asp?strConsignmentNo=${encodeURIComponent(awbNumber)}&addColDetails=Y`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-violet-700 underline hover:text-violet-900"
          >
            <span>Track on DTDC</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div key={step.label} className="text-center">
              <div
                className={`mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                  isDone
                    ? "bg-violet-600 font-semibold text-white"
                    : "bg-violet-200 text-violet-500"
                } ${isCurrent ? "ring-2 ring-violet-400 ring-offset-1" : ""}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p
                className={`text-[11px] leading-tight font-medium ${
                  isDone ? "text-violet-950" : "text-violet-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Status Detail & Latest Scan */}
      <div className="mt-4 rounded-xl border border-violet-100 bg-white/80 p-3 text-xs">
        <div className="flex items-center justify-between text-neutral-600">
          <span>Current Status:</span>
          {loading ? (
            <span className="animate-pulse text-violet-600">Updating…</span>
          ) : (
            <span className="font-semibold text-violet-900 capitalize">
              {currentStatus}
            </span>
          )}
        </div>

        {tracking?.checkpoints && tracking.checkpoints.length > 0 && (
          <div className="mt-2 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
            <span className="font-medium text-neutral-700">
              Latest Location:{" "}
              {tracking.checkpoints[tracking.checkpoints.length - 1].location}
            </span>
            {tracking.checkpoints[tracking.checkpoints.length - 1].remarks && (
              <p className="mt-0.5 text-neutral-500 italic">
                {tracking.checkpoints[tracking.checkpoints.length - 1].remarks}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
