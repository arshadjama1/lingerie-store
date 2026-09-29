import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Mail,
  Truck,
} from "lucide-react";

import type { OrderReturnRequestSummary } from "@/modules/orders/types";

interface CustomerReturnStatusCardProps {
  returnRequest: OrderReturnRequestSummary;
  orderNumber: string;
}

export function CustomerReturnStatusCard({
  returnRequest,
  orderNumber,
}: CustomerReturnStatusCardProps) {
  const { status, reason, notes, createdAt } = returnRequest;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (status === "requested") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-amber-900">
                Return Request Under Review
              </h4>
              <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Pending Review
              </span>
            </div>
            <p className="mt-1 text-xs text-amber-800">
              Submitted on {formattedDate}. Our team is currently reviewing your
              request.
            </p>

            <div className="mt-3 rounded-lg border border-amber-200/80 bg-white/70 p-3 text-xs text-neutral-700">
              <span className="font-semibold text-neutral-900">
                Your stated reason:
              </span>{" "}
              {reason}
            </div>

            <p className="mt-3 text-xs text-amber-700">
              As per our store policy, returns are only accepted for items that
              arrive damaged or incorrect. You will be notified via email once a
              decision is made.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-emerald-900">
                Return Request Approved
              </h4>
              <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Approved
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-800">
              Your return request has been approved. Our logistics team will
              arrange a reverse pickup from your shipping address shortly.
            </p>

            {notes && (
              <div className="mt-3 rounded-lg border border-emerald-200/80 bg-white/70 p-3 text-xs text-neutral-700">
                <span className="font-semibold text-neutral-900">
                  Note from our team:
                </span>{" "}
                {notes}
              </div>
            )}

            <p className="mt-3 text-xs text-emerald-700">
              Please ensure the item(s) are securely packed with original
              packaging and tags intact for the pickup partner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-rose-900">
                Return Request Not Approved
              </h4>
              <span className="rounded-full bg-rose-200/80 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                Rejected
              </span>
            </div>
            <p className="mt-1 text-xs text-rose-800">
              Your return request submitted on {formattedDate} was reviewed and
              could not be approved.
            </p>

            {notes && (
              <div className="mt-3 rounded-lg border border-rose-200/80 bg-white/70 p-3 text-xs text-neutral-700">
                <span className="font-semibold text-neutral-900">
                  Decision note:
                </span>{" "}
                {notes}
              </div>
            )}

            <p className="mt-3 text-xs text-rose-700">
              As per our store policy, we do not accept returns, replacements,
              or exchanges for products once purchased unless they arrive
              damaged or incorrect.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-rose-200/70 pt-2.5 text-xs text-rose-700">
              <span>Need clarification or have additional proof? Contact</span>
              <a
                href={`mailto:support@surekh.co.in?subject=Return%20Appeal%20-%20Order%20${encodeURIComponent(orderNumber)}`}
                className="inline-flex items-center gap-1 font-semibold text-rose-900 hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                support@surekh.co.in
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "picked_up") {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-purple-900">
                Return Picked Up
              </h4>
              <span className="rounded-full bg-purple-200/80 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                In Transit
              </span>
            </div>
            <p className="mt-1 text-xs text-purple-800">
              Your returned item has been collected and is in transit back to
              our warehouse for verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "refunded") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-emerald-900">
                Return Processed &amp; Refunded
              </h4>
              <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Completed
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-800">
              Your return has been received and verified. The refund has been
              processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
