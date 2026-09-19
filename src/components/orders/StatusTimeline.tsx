import { CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

import type { OrderStatus, OrderStatusHistoryEntry } from "@/modules/orders";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Preparing Shipment",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

interface StatusTimelineProps {
  entries: OrderStatusHistoryEntry[];
}

export function StatusTimeline({ entries }: StatusTimelineProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <ol className="relative space-y-0">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const isCancelled = entry.status === "cancelled";
        const isDelivered = entry.status === "delivered";

        return (
          <li key={entry.id} className="flex gap-3">
            {/* Left column: icon + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  isCancelled
                    ? "bg-red-100 text-red-600"
                    : isDelivered
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-blue-100 text-blue-600"
                )}
              >
                {isCancelled ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
              </div>
              {!isLast && <div className="my-1 w-px flex-1 bg-neutral-200" />}
            </div>

            {/* Right column: text content */}
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-semibold",
                  isCancelled ? "text-red-700" : "text-neutral-900"
                )}
              >
                {STATUS_LABELS[entry.status] ?? entry.status}
              </p>
              {entry.note && (
                <p className="mt-0.5 text-xs text-neutral-500">{entry.note}</p>
              )}
              <p className="mt-0.5 text-xs text-neutral-400">
                {formatDateTime(entry.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
