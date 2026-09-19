import "server-only";

import type { OrderDetails } from "@/modules/orders";

export interface DtdcShipmentResult {
  awbNumber: string;
  courierName: "DTDC";
}

/**
 * Creates a DTDC shipment via the DTDC REST API.
 *
 * STATUS: STUB — API keys not yet received from the client.
 *
 * Admins must book shipments via the DTDC dashboard
 * (https://dtdc.com) and enter the AWB number manually
 * using the POST /api/admin/orders/[id]/awb endpoint.
 *
 * To activate when keys arrive:
 *  1. Add DTDC_API_KEY and DTDC_API_URL to src/config/env.server.ts
 *  2. Replace this function body with the real DTDC REST API call
 *  3. No other files need to change — callers use this function via
 *     src/modules/shipping/index.ts
 */
export async function createDtdcShipment(
  _order: OrderDetails
): Promise<DtdcShipmentResult> {
  throw new Error(
    "DTDC API integration pending: keys not yet received. " +
      "Please book the shipment via the DTDC dashboard and enter the AWB number manually."
  );
}
