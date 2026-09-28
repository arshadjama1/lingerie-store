import "server-only";

import { serverEnv } from "@/config/env.server";

import { AppError } from "@/lib/errors";

import type { OrderDetails } from "@/modules/orders";

import type {
  DtdcCancelResult,
  DtdcConsignmentItem,
  DtdcPackageDimensions,
  DtdcServiceabilityResult,
  DtdcShipmentResult,
  DtdcSoftdataRequest,
  DtdcSoftdataResponse,
  DtdcTrackingCheckpoint,
  DtdcTrackingResult,
} from "./types";

/**
 * Calculates estimated package weight and dimensions from order items.
 * Garment standard: ~250-400g per lingerie/apparel piece + 100g packaging.
 */
export function calculateDefaultPackageDimensions(
  order: OrderDetails
): DtdcPackageDimensions {
  let totalWeightGrams = 100; // tare box / polymailer weight

  for (const item of order.items) {
    // If variant or product snapshot has a weight, we could use it, otherwise default 300g per item
    const pieceWeight = 300;
    totalWeightGrams += pieceWeight * Math.max(1, item.quantity);
  }

  // Weight in kg (minimum 0.20 kg for DTDC billing)
  const weightKg = Math.max(
    0.2,
    Math.round((totalWeightGrams / 1000) * 100) / 100
  );

  return {
    length: 20,
    width: 15,
    height: 5,
    weightKg,
  };
}

/**
 * Creates a DTDC consignment via the DTDC Softdata Upload API (v2.0).
 */
export async function createDtdcShipment(
  order: OrderDetails,
  customDimensions?: Partial<DtdcPackageDimensions>
): Promise<DtdcShipmentResult> {
  const apiKey = serverEnv.DTDC_API_KEY;
  const customerCode = serverEnv.DTDC_CUSTOMER_CODE;
  const apiUrl = serverEnv.DTDC_API_URL.replace(/\/+$/, "");

  if (!apiKey || !customerCode) {
    throw new AppError(
      "DTDC credentials missing: DTDC_API_KEY and DTDC_CUSTOMER_CODE must be configured.",
      500,
      "DTDC_CONFIG_ERROR"
    );
  }

  const dimensions = {
    ...calculateDefaultPackageDimensions(order),
    ...customDimensions,
  };

  const addr = order.shippingAddress;
  const isCod = order.payment?.method === "cod";

  const consignment: DtdcConsignmentItem = {
    customer_code: customerCode,
    service_type_id: serverEnv.DTDC_SERVICE_TYPE_ID || "B2C PRIORITY",
    load_type: "NON-DOCUMENT",
    consignment_type: "Forward",
    description: "Apparel & Intimates",
    dimension_unit: "cm",
    length: String(dimensions.length),
    width: String(dimensions.width),
    height: String(dimensions.height),
    weight_unit: "kg",
    weight: String(dimensions.weightKg),
    num_pieces: "1",
    declared_value: String(Math.max(1, Math.round(Number(order.total) || 0))),
    customer_reference_number: order.orderNumber,
    commodity_id: serverEnv.DTDC_COMMODITY_ID || "CLOTHING",
    is_risk_surcharge_applicable: false,
    cod_amount: isCod ? String(Math.round(Number(order.total))) : "",
    cod_collection_mode: isCod ? "CASH" : "",
    cod_favor_of: isCod ? serverEnv.DTDC_WAREHOUSE_NAME || "" : "",
    origin_details: {
      name: serverEnv.DTDC_WAREHOUSE_NAME,
      phone: serverEnv.DTDC_WAREHOUSE_PHONE,
      alternate_phone: serverEnv.DTDC_WAREHOUSE_PHONE,
      address_line_1: serverEnv.DTDC_WAREHOUSE_LINE1,
      address_line_2: serverEnv.DTDC_WAREHOUSE_LINE2 || undefined,
      pincode: serverEnv.DTDC_WAREHOUSE_PINCODE,
      city: serverEnv.DTDC_WAREHOUSE_CITY,
      state: serverEnv.DTDC_WAREHOUSE_STATE,
    },
    destination_details: {
      name: addr.fullName || "Valued Customer",
      phone: addr.phone || "0000000000",
      alternate_phone: addr.phone || undefined,
      address_line_1: addr.line1 || "Customer Address",
      address_line_2: addr.line2 || undefined,
      pincode: addr.pincode || "400001",
      city: addr.city || "Mumbai",
      state: addr.state || "Maharashtra",
    },
    return_details: {
      name: serverEnv.DTDC_WAREHOUSE_NAME,
      phone: serverEnv.DTDC_WAREHOUSE_PHONE,
      address_line_1: serverEnv.DTDC_WAREHOUSE_LINE1,
      address_line_2: serverEnv.DTDC_WAREHOUSE_LINE2 || undefined,
      pincode: serverEnv.DTDC_WAREHOUSE_PINCODE,
      city_name: serverEnv.DTDC_WAREHOUSE_CITY,
      state_name: serverEnv.DTDC_WAREHOUSE_STATE,
    },
  };

  const payload: DtdcSoftdataRequest = {
    consignments: [consignment],
  };

  const endpoint = `${apiUrl}/api/customer/integration/consignment/softdata`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const rawText = await res.text();
  let rawJson: DtdcSoftdataResponse;
  try {
    rawJson = JSON.parse(rawText) as DtdcSoftdataResponse;
  } catch {
    throw new AppError(
      `DTDC API returned an unparseable response (HTTP ${res.status}): ${rawText.slice(0, 160)}`,
      502,
      "DTDC_UPSTREAM_ERROR"
    );
  }

  const resultItem = rawJson.data?.[0];

  if (!res.ok || rawJson.status !== "OK") {
    const errorMsg =
      resultItem?.message ||
      resultItem?.reason ||
      resultItem?.error?.message ||
      resultItem?.error?.reason ||
      rawJson.message ||
      `DTDC booking failed with HTTP status ${res.status}`;
    throw new AppError(errorMsg, 400, "DTDC_BOOKING_FAILED");
  }

  if (!resultItem || !resultItem.success || !resultItem.reference_number) {
    const reason =
      resultItem?.message ||
      resultItem?.reason ||
      resultItem?.error?.message ||
      resultItem?.error?.reason ||
      rawJson.message ||
      "DTDC rejected consignment creation";
    throw new AppError(reason, 400, "DTDC_BOOKING_FAILED");
  }

  const awbNumber = resultItem.reference_number;

  return {
    awbNumber,
    referenceNumber: awbNumber,
    courierName: "DTDC",
    labelUrl: `/api/admin/orders/${order.id}/label`,
  };
}

/**
 * Fetches the printable shipping label for an AWB from DTDC.
 */
export async function getDtdcShippingLabel(
  awbNumber: string,
  format: "pdf" | "base64" = "pdf"
): Promise<{ buffer?: Buffer; base64?: string; contentType: string }> {
  const apiKey = serverEnv.DTDC_API_KEY;
  const apiUrl = serverEnv.DTDC_API_URL.replace(/\/+$/, "");

  if (!apiKey) {
    throw new AppError(
      "DTDC_API_KEY is not configured.",
      500,
      "DTDC_CONFIG_ERROR"
    );
  }

  const endpoint = `${apiUrl}/api/customer/integration/consignment/shippinglabel/stream?reference_number=${encodeURIComponent(
    awbNumber
  )}&label_code=SHIP_LABEL_4X6&label_format=${format}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let errMessage = `Failed to fetch shipping label (status ${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) errMessage = errJson.error.message;
    } catch {
      // ignore
    }
    throw new AppError(
      errMessage,
      res.status === 404 ? 404 : 502,
      "DTDC_LABEL_ERROR"
    );
  }

  if (format === "base64") {
    const json = await res.json();
    return {
      base64: json.label,
      contentType: "application/json",
    };
  }

  const arrayBuffer = await res.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: "application/pdf",
  };
}

/**
 * Cancels a consignment on DTDC.
 */
export async function cancelDtdcShipment(
  awbNumber: string
): Promise<DtdcCancelResult> {
  const apiKey = serverEnv.DTDC_API_KEY;
  const customerCode = serverEnv.DTDC_CUSTOMER_CODE;
  const apiUrl = serverEnv.DTDC_API_URL.replace(/\/+$/, "");

  if (!apiKey || !customerCode) {
    return {
      success: false,
      awbNumber,
      message: "DTDC credentials not configured",
    };
  }

  const endpoint = `${apiUrl}/api/customer/integration/consignment/cancel`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        AWBNo: [awbNumber],
        customerCode,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || data.status !== "OK") {
      const failure = data.failures?.[0];
      return {
        success: false,
        awbNumber,
        message: failure?.message || "Cancellation failed on DTDC",
      };
    }

    const successConsignment = data.successConsignments?.find(
      (c: { reference_number: string; success: boolean }) =>
        c.reference_number === awbNumber && c.success
    );

    return {
      success: !!successConsignment || data.success === true,
      awbNumber,
      message: successConsignment ? "Consignment cancelled on DTDC" : undefined,
    };
  } catch (err) {
    return {
      success: false,
      awbNumber,
      message:
        err instanceof Error
          ? err.message
          : "Network error during cancellation",
    };
  }
}

/**
 * Checks pincode serviceability and turnaround time (TAT) via DTDC Pincode API.
 */
export async function checkDtdcPincodeServiceability(
  destPincode: string,
  orgPincode?: string
): Promise<DtdcServiceabilityResult> {
  const origin = orgPincode || serverEnv.DTDC_WAREHOUSE_PINCODE || "400604";
  const url = serverEnv.DTDC_PINCODE_URL;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orgPincode: String(origin),
        desPincode: String(destPincode),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Pincode API returned status ${res.status}`);
    }

    const data = await res.json();

    const zipInfo = data.ZIPCODE_RESP?.[0];
    const isServiceable = zipInfo?.SERVFLAG === "Y";
    const isCodAvailable = zipInfo?.SERV_COD === "Y";

    // Priority service TAT or first available
    const prioritySvc =
      data.SERV_LIST_DTLS?.find((s: { CODE: string }) => s.CODE === "P7X") ||
      data.SERV_LIST_DTLS?.[0];

    const tatDays = prioritySvc?.TAT ? parseInt(prioritySvc.TAT, 10) : 2;

    return {
      isServiceable,
      isCodAvailable,
      tatDays: isNaN(tatDays) ? 2 : Math.max(1, tatDays),
      orgPincode: origin,
      desPincode: destPincode,
      serviceName: prioritySvc?.NAME,
    };
  } catch (err) {
    console.warn("[DTDC Pincode] Serviceability check fallback:", err);
    // Graceful fallback for standard Indian metros
    return {
      isServiceable: true,
      isCodAvailable: true,
      tatDays: 3,
      orgPincode: origin,
      desPincode: destPincode,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────
// DTDC Tracking API v4
// Auth: 2-step — GET /authenticate → cache token → POST with x-access-token
// Token never expires per official docs; safe to cache in module scope.
// ─────────────────────────────────────────────────────────────────────

/** Module-scope token cache — persists for the lifetime of the process. */
let _cachedTrackToken: string | null = null;

/**
 * Parses a DTDC date string ("DDMMYYYY") + optional time string ("HHMM")
 * into an ISO 8601 string. Returns null on invalid input.
 */
function parseDtdcDateTime(date: string, time?: string): string | null {
  if (!date || date.length < 8) return null;
  const dd = date.slice(0, 2);
  const mm = date.slice(2, 4);
  const yyyy = date.slice(4, 8);
  const hh = time && time.length >= 4 ? time.slice(0, 2) : "00";
  const min = time && time.length >= 4 ? time.slice(2, 4) : "00";
  const iso = `${yyyy}-${mm}-${dd}T${hh}:${min}:00+05:30`; // DTDC operates on IST
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Acquires (and caches) a DTDC tracking API access token.
 * Token never expires — one call per process lifetime.
 */
async function getTrackToken(): Promise<string> {
  if (_cachedTrackToken) return _cachedTrackToken;

  const username = serverEnv.DTDC_TRACK_USERNAME;
  const password = serverEnv.DTDC_TRACK_PASSWORD;
  const baseUrl = serverEnv.DTDC_TRACKING_URL.replace(/\/+$/, "");

  if (!username || !password) {
    throw new Error(
      "DTDC tracking credentials missing: set DTDC_TRACK_USERNAME and DTDC_TRACK_PASSWORD."
    );
  }

  const url = `${baseUrl}/dtdc-api/api/dtdc/authenticate?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });

  if (!res.ok) {
    throw new Error(
      `DTDC tracking auth failed with HTTP ${res.status}: ${res.statusText}`
    );
  }

  // The API returns the raw token string as the response body (not JSON)
  const token = (await res.text()).trim();
  if (!token) {
    throw new Error("DTDC tracking auth returned an empty token.");
  }

  _cachedTrackToken = token;
  return token;
}

/** Maps DTDC status codes from the official Tracking Codes v1.2.0 reference. */
const DTDC_CODE_TO_STATUS: Record<string, string> = {
  PCAW: "Pickup Awaited",
  PCSC: "Pickup Scheduled",
  PCUP: "Picked Up",
  PCNO: "Not Picked Up",
  PCRA: "Pickup Reassigned",
  BKD: "Booked",
  IPMF: "In Transit",
  OFD: "Out for Delivery",
  OUTDLV: "Out for Delivery",
  DLV: "Delivered",
  NONDLV: "Delivery Attempted",
  REG: "Return In Transit",
  RTG: "Return Out for Delivery",
  SRTS: "Return Delivered",
  UIG: "Shipment Cancelled",
  CAN: "Cancelled",
  SDL: "Shipment Lost",
};

/**
 * Fetches live DTDC tracking events for a given AWB number using
 * the DTDC Tracking API v4 (JSON, Pull mode).
 *
 * Gracefully returns empty checkpoints when:
 * - Tracking credentials are not yet configured
 * - AWB has not been scanned yet (statusFlag === false)
 */
export async function getDtdcTracking(
  awbNumber: string
): Promise<DtdcTrackingResult> {
  const username = serverEnv.DTDC_TRACK_USERNAME;
  const password = serverEnv.DTDC_TRACK_PASSWORD;

  // Credentials not yet configured — return empty result, do not throw
  if (!username || !password) {
    console.warn(
      "[DTDC Tracking] DTDC_TRACK_USERNAME / DTDC_TRACK_PASSWORD not set — skipping live tracking."
    );
    return {
      awbNumber,
      currentStatus: "Tracking not yet configured",
      destinationCity: undefined,
      checkpoints: [],
    };
  }

  try {
    const token = await getTrackToken();
    const baseUrl = serverEnv.DTDC_TRACKING_URL.replace(/\/+$/, "");
    const endpoint = `${baseUrl}/dtdc-api/rest/JSONCnTrk/getTrackDetails`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token, // NOTE: NOT "Authorization: Bearer"
      },
      body: JSON.stringify({
        trkType: "cnno",
        strcnno: awbNumber,
        addtnlDtl: "Y",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`DTDC tracking HTTP ${res.status}: ${res.statusText}`);
    }

    const raw = (await res.json()) as {
      statusCode?: number;
      statusFlag?: boolean;
      status?: string;
      errorDetails?: Array<{ name: string; value: string }>;
      trackHeader?: Record<string, string | null>;
      trackDetails?: Array<Record<string, string | null>>;
    };

    // AWB not yet scanned — courier hasn't registered it yet
    if (!raw.statusFlag || raw.status !== "SUCCESS") {
      return {
        awbNumber,
        currentStatus: "Awaiting first courier scan",
        destinationCity: undefined,
        checkpoints: [],
      };
    }

    const header = raw.trackHeader ?? {};
    const scans = raw.trackDetails ?? [];

    // Parse current status from latest scan code or header status
    const latestCode = scans[scans.length - 1]?.strCode ?? "";
    const currentStatus =
      DTDC_CODE_TO_STATUS[latestCode] ??
      header.strStatusRelName ??
      header.strStatus ??
      "In Transit";

    // Parse DTDC expected delivery date (format: DDMMYYYY)
    const rawEdd =
      header.strRevExpectedDeliveryDate || header.strExpectedDeliveryDate;
    const expectedDeliveryDate = rawEdd
      ? (parseDtdcDateTime(rawEdd) ?? undefined)
      : undefined;

    const destinationCity = (header.strDestination ?? undefined) || undefined;

    // Map scan events → DtdcTrackingCheckpoint[]
    // ⚠️ DTDC uses 'sTrRemarks' (lowercase T) not 'strRemarks' — per official docs
    const checkpoints: DtdcTrackingCheckpoint[] = scans
      .filter((s) => s.strCode)
      .map((s) => ({
        statusCode: s.strCode ?? "",
        status: DTDC_CODE_TO_STATUS[s.strCode ?? ""] ?? s.strAction ?? "",
        location:
          [s.strOrigin, s.strDestination].filter(Boolean).join(" → ") ||
          "Unknown",
        timestamp:
          parseDtdcDateTime(s.strActionDate ?? "", s.strActionTime ?? "") ??
          new Date().toISOString(),
        remarks: (s.sTrRemarks ?? undefined) || undefined,
      }));

    return {
      awbNumber,
      currentStatus,
      expectedDeliveryDate,
      destinationCity,
      checkpoints,
    };
  } catch (err) {
    // If token is stale (can happen if DTDC revokes it), clear cache so next
    // call re-authenticates
    _cachedTrackToken = null;
    console.error("[DTDC Tracking] Failed to fetch live tracking:", err);
    return {
      awbNumber,
      currentStatus: "Tracking unavailable",
      destinationCity: undefined,
      checkpoints: [],
    };
  }
}
