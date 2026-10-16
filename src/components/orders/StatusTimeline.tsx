import {
  Check,
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  Truck,
  User,
  XCircle,
} from "lucide-react";

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

const STATUS_ICON_CONFIG: Record<
  OrderStatus,
  {
    icon: typeof Clock;
    bgClass: string;
    textClass: string;
    badgeClass: string;
  }
> = {
  pending: {
    icon: Clock,
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
    badgeClass: "text-gray-900",
  },
  confirmed: {
    icon: CheckCircle2,
    bgClass: "bg-blue-100",
    textClass: "text-blue-600",
    badgeClass: "text-blue-900",
  },
  processing: {
    icon: Package,
    bgClass: "bg-amber-100",
    textClass: "text-amber-600",
    badgeClass: "text-amber-900",
  },
  shipped: {
    icon: Truck,
    bgClass: "bg-violet-100",
    textClass: "text-violet-600",
    badgeClass: "text-violet-900",
  },
  delivered: {
    icon: Check,
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-600",
    badgeClass: "text-emerald-900",
  },
  cancelled: {
    icon: XCircle,
    bgClass: "bg-red-100",
    textClass: "text-red-600",
    badgeClass: "text-red-900",
  },
  refunded: {
    icon: RotateCcw,
    bgClass: "bg-orange-100",
    textClass: "text-orange-600",
    badgeClass: "text-orange-900",
  },
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
  showActor?: boolean;
}

export function StatusTimeline({
  entries,
  showActor = false,
}: StatusTimelineProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <ol className="relative space-y-0">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const isCancelled = entry.status === "cancelled";
        const config =
          STATUS_ICON_CONFIG[entry.status] ?? STATUS_ICON_CONFIG.pending;
        const IconComponent = config.icon;

        return (
          <li key={entry.id} className="flex gap-3">
            {/* Left column: icon + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform",
                  config.bgClass,
                  config.textClass
                )}
              >
                <IconComponent className="h-3.5 w-3.5 stroke-[2]" />
              </div>
              {!isLast && <div className="my-1 w-px flex-1 bg-gray-200" />}
            </div>

            {/* Right column: text content */}
            <div className={cn("pb-5", isLast && "pb-0")}>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isCancelled ? "text-red-700" : config.badgeClass
                  )}
                >
                  {STATUS_LABELS[entry.status] ?? entry.status}
                </p>
                {showActor && entry.changedBy?.email && (
                  <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                    <User className="h-2.5 w-2.5 text-gray-400" />
                    {entry.changedBy.name || entry.changedBy.email}
                  </span>
                )}
              </div>

              {entry.note && (
                <div className="mt-1.5 rounded-none border-l-2 border-gray-300 bg-gray-50/80 px-2.5 py-1 text-xs text-gray-700">
                  {entry.note}
                </div>
              )}

              <p className="mt-1 text-[11px] text-gray-400">
                {formatDateTime(entry.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
