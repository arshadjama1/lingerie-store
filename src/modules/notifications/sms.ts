import "server-only";

/**
 * Order confirmation SMS via MSG91.
 *
 * NO-OP: DLT templates not yet approved by TRAI.
 * Wire up the body below when MSG91_ORDER_FLOW_ID is set in env.server.ts.
 *
 * To activate:
 *  1. Add MSG91_ORDER_FLOW_ID to serverEnv in src/config/env.server.ts (required string)
 *  2. Replace this stub with a POST to https://api.msg91.com/api/v5/flow/
 *     using authkey=serverEnv.MSG91_AUTH_KEY, template_id, mobiles, and variables
 */
export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  _total: number
): Promise<void> {
  if (!process.env.MSG91_ORDER_FLOW_ID) {
    console.warn(
      `[SMS] sendOrderConfirmationSMS: MSG91_ORDER_FLOW_ID not set — skipping SMS for ${orderNumber} to ${phone || "(no phone)"}`
    );
    return;
  }
  // TODO: implement when DLT approved
  // await fetch("https://api.msg91.com/api/v5/flow/", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", authkey: serverEnv.MSG91_AUTH_KEY },
  //   body: JSON.stringify({
  //     template_id: process.env.MSG91_ORDER_FLOW_ID,
  //     mobiles: `91${phone}`,
  //     orderNumber,
  //     total: formatPrice(_total),
  //   }),
  // });
}

/**
 * Shipped SMS via MSG91.
 *
 * NO-OP: DLT templates not yet approved by TRAI.
 * Wire up the body below when MSG91_SHIPPED_FLOW_ID is set in env.server.ts.
 *
 * To activate:
 *  1. Add MSG91_SHIPPED_FLOW_ID to serverEnv in src/config/env.server.ts (required string)
 *  2. Replace this stub with the real MSG91 flow API call (see above for reference shape)
 */
export async function sendOrderShippedSMS(
  phone: string,
  orderNumber: string,
  awbNumber: string | null
): Promise<void> {
  if (!process.env.MSG91_SHIPPED_FLOW_ID) {
    console.warn(
      `[SMS] sendOrderShippedSMS: MSG91_SHIPPED_FLOW_ID not set — skipping SMS for ${orderNumber} to ${phone || "(no phone)"}`
    );
    return;
  }
  // TODO: implement when DLT approved
  // await fetch("https://api.msg91.com/api/v5/flow/", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", authkey: serverEnv.MSG91_AUTH_KEY },
  //   body: JSON.stringify({
  //     template_id: process.env.MSG91_SHIPPED_FLOW_ID,
  //     mobiles: `91${phone}`,
  //     orderNumber,
  //     awbNumber: awbNumber ?? "Updating soon",
  //   }),
  // });
  void awbNumber; // suppress unused warning until implemented
}
