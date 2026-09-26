/**
 * Delivery window estimation utilities.
 *
 * Pure functions — no external API calls in the critical path.
 * Used on /order-success and /account/orders/[id] to show customers
 * an expected delivery date range before DTDC live tracking kicks in.
 *
 * TAT lookup priority:
 *   1. tatDays from DTDC Pincode API (if caller has already fetched it)
 *   2. Metro pincode heuristic (2 days)
 *   3. Rest of India fallback (4 days)
 *
 * Warehouse processes orders within 24-48 hours of confirmation.
 */
import type { DeliveryWindow } from "./types";

export type { DeliveryWindow };

/** Indian metro pincode prefixes → 2-day DTDC delivery */
const METRO_PREFIXES = [
  "400", // Mumbai / Thane / Navi Mumbai
  "401", // Thane district
  "421", // Thane / Kalyan
  "110", // Delhi / NCR
  "560", // Bengaluru
  "600", // Chennai
  "700", // Kolkata
  "500", // Hyderabad
  "380", // Ahmedabad
  "411", // Pune
];

/**
 * Returns true if the pincode is a known Indian metro area
 * eligible for 2-day DTDC delivery.
 */
export function isMetroPincode(pincode: string): boolean {
  const clean = pincode.trim();
  return METRO_PREFIXES.some((prefix) => clean.startsWith(prefix));
}

/**
 * Returns the default TAT (Transit time in business days) for a pincode,
 * based on metro heuristic. Use this when DTDC Pincode API hasn't been called.
 *   - Metro: 2 days
 *   - Rest of India: 4 days
 */
export function defaultTatDays(pincode: string): number {
  return isMetroPincode(pincode) ? 2 : 4;
}

/**
 * Adds business days to a date, skipping Sundays only.
 * (DTDC delivers on Saturdays in most regions.)
 */
function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) {
      // 0 = Sunday
      added++;
    }
  }
  return result;
}

/**
 * Computes the estimated dispatch date from the warehouse.
 * Assumption: orders are dispatched within 24-48 hours of confirmation.
 * Returns the pessimistic (48 hr) estimate as a Date.
 */
export function estimatedDispatchDate(confirmedAt: Date): Date {
  const dispatch = new Date(confirmedAt);
  dispatch.setHours(dispatch.getHours() + 48);
  return dispatch;
}

/**
 * Computes the estimated delivery date range for an order.
 *
 * @param confirmedAt - When the order was confirmed (payment verified)
 * @param destPincode - Customer's delivery pincode
 * @param dtdcTatDays - Optional: TAT from DTDC Pincode API. If absent, uses heuristic.
 */
export function estimatedDeliveryWindow(
  confirmedAt: Date,
  destPincode: string,
  dtdcTatDays?: number
): DeliveryWindow {
  const tat = dtdcTatDays ?? defaultTatDays(destPincode);

  // Earliest: dispatched within 24 hrs + TAT
  const earliestDispatch = new Date(confirmedAt);
  earliestDispatch.setHours(earliestDispatch.getHours() + 24);
  const earliest = addBusinessDays(earliestDispatch, tat);

  // Latest: dispatched within 48 hrs + TAT + 1 buffer day
  const latestDispatch = new Date(confirmedAt);
  latestDispatch.setHours(latestDispatch.getHours() + 48);
  const latest = addBusinessDays(latestDispatch, tat + 1);

  return { earliest, latest };
}

/**
 * Formats a delivery window into a customer-friendly string.
 * e.g. "Tuesday, 30 Sep – Thursday, 02 Oct"
 */
export function formatDeliveryWindow(window: DeliveryWindow): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "short",
  };
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", opts);
  return `${fmt(window.earliest)} – ${fmt(window.latest)}`;
}

/**
 * Returns a short human-readable dispatch ETA string relative to now.
 * Used on the pre-AWB advisory card.
 *
 * Examples:
 *   "Today by 6 PM"
 *   "Tomorrow by 6 PM"
 *   "Within 48 hours"
 */
export function formatDispatchEta(confirmedAt: Date): string {
  const dispatch = new Date(confirmedAt);
  dispatch.setHours(dispatch.getHours() + 48);

  const now = new Date();
  const diffHours = (dispatch.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 0) return "Shortly";
  if (diffHours <= 6) return "Today by 6 PM";
  if (diffHours <= 24) return "Tomorrow by 6 PM";
  return "Within 48 hours";
}
