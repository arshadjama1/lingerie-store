import "server-only";

import { serverEnv } from "@/config/env.server";

import { formatPrice } from "@/lib/utils";

const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/";

// ─────────────────────────────────────────────────────────────────────
// Internal helper — MSG91 Flow API v5 delivery with recipients array
// ─────────────────────────────────────────────────────────────────────

function normaliseToIndianE164Digits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

async function sendMsg91Flow(
  templateId: string,
  mobile: string,
  variables: Record<string, string>
): Promise<void> {
  const normalised = normaliseToIndianE164Digits(mobile);

  // Standard MSG91 Flow API v5 payload structure
  const payload = {
    template_id: templateId,
    short_url: "0",
    recipients: [
      {
        mobiles: normalised,
        ...variables,
      },
    ],
  };

  const res = await fetch(MSG91_FLOW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: serverEnv.MSG91_AUTH_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`MSG91 API HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json().catch(() => ({}))) as {
    type?: string;
    message?: string;
  };
  if (data.type === "error") {
    throw new Error(
      `MSG91 rejected flow ${templateId}: ${data.message ?? JSON.stringify(data)}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
// sendOrderConfirmationSMS
// DLT template variables: {orderNumber}, {total}
// ─────────────────────────────────────────────────────────────────────

export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  total: number
): Promise<void> {
  const templateId = serverEnv.MSG91_ORDER_FLOW_ID;
  if (!templateId) {
    console.warn(
      `[SMS] sendOrderConfirmationSMS: MSG91_ORDER_FLOW_ID not set — skipping SMS for ${orderNumber} to ${phone || "(no phone)"}`
    );
    return;
  }
  if (!phone) {
    console.warn(
      `[SMS] sendOrderConfirmationSMS: no phone number for order ${orderNumber} — skipping`
    );
    return;
  }

  const formattedTotal = formatPrice(total);

  try {
    await sendMsg91Flow(templateId, phone, {
      orderNumber,
      ORDERNUMBER: orderNumber,
      total: formattedTotal,
      TOTAL: formattedTotal,
    });
  } catch (err) {
    // Non-fatal: email remains primary confirmation channel
    console.error("[SMS] sendOrderConfirmationSMS failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// sendOrderShippedSMS
// DLT template variables: {orderNumber}, {awbNumber}
// ─────────────────────────────────────────────────────────────────────

export async function sendOrderShippedSMS(
  phone: string,
  orderNumber: string,
  awbNumber: string | null
): Promise<void> {
  const templateId = serverEnv.MSG91_SHIPPED_FLOW_ID;
  if (!templateId) {
    console.warn(
      `[SMS] sendOrderShippedSMS: MSG91_SHIPPED_FLOW_ID not set — skipping SMS for ${orderNumber} to ${phone || "(no phone)"}`
    );
    return;
  }
  if (!phone) {
    console.warn(
      `[SMS] sendOrderShippedSMS: no phone number for order ${orderNumber} — skipping`
    );
    return;
  }

  const awb = awbNumber ?? "Updating soon";

  try {
    await sendMsg91Flow(templateId, phone, {
      orderNumber,
      ORDERNUMBER: orderNumber,
      awbNumber: awb,
      AWBNUMBER: awb,
    });
  } catch (err) {
    // Non-fatal: email remains primary shipped notification channel
    console.error("[SMS] sendOrderShippedSMS failed:", err);
  }
}
