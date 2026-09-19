import { cn } from "@/lib/utils";

import type { OrderStatus } from "@/modules/orders";

interface StatusConfig {
  label: string;
  className: string;
  dotClass: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-700",
    dotClass: "bg-gray-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    className: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
  },
  shipped: {
    label: "Shipped",
    className: "bg-violet-100 text-violet-700",
    dotClass: "bg-violet-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    className: "bg-orange-100 text-orange-700",
    dotClass: "bg-orange-500",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
