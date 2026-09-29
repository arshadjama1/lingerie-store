import type { ReturnStatus } from "@/modules/admin/returns/types";

const STATUS_CONFIG: Record<
  ReturnStatus,
  { label: string; className: string }
> = {
  requested: {
    label: "Requested",
    className: "bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-50 text-blue-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-purple-50 text-purple-700",
  },
  refunded: {
    label: "Refunded",
    className: "bg-emerald-50 text-emerald-700",
  },
};

interface ReturnStatusBadgeProps {
  status: ReturnStatus;
}

export function ReturnStatusBadge({ status }: ReturnStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-none px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
