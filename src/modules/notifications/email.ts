import { Resend } from "resend";
import "server-only";

import { serverEnv } from "@/config/env.server";

import { formatPrice } from "@/lib/utils";

import type { OrderDetails } from "@/modules/orders";

const resend = new Resend(serverEnv.RESEND_API_KEY);
const FROM_EMAIL = `Surekh <${serverEnv.RESEND_FROM_EMAIL}>`;

// ─────────────────────────────────────────────────────────────────────
// Shared HTML helpers
// ─────────────────────────────────────────────────────────────────────

function wrapLayout(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Georgia,serif;">
  <div style="background:#f9f9f9;padding:32px 0;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

      <!-- Header -->
      <div style="background:#3d0a20;padding:28px 40px;">
        <h1 style="color:#ffffff;font-size:28px;margin:0;letter-spacing:4px;font-family:Georgia,serif;">SUREKH.</h1>
      </div>

      <!-- Body -->
      <div style="padding:40px;">
        ${body}
      </div>

      <!-- Footer -->
      <div style="background:#f3f4f6;padding:20px 40px;text-align:center;font-size:12px;color:#6b7280;">
        Need help? Reply to this email or contact
        <a href="mailto:support@surekh.co.in" style="color:#3d0a20;">support@surekh.co.in</a>
      </div>

    </div>
  </div>
</body>
</html>`.trim();
}

function orderNumberPill(orderNumber: string): string {
  return `
<div style="margin:20px 0;padding:14px 20px;border:2px solid #3d0a20;border-radius:8px;background:#fdf8f9;text-align:center;">
  <span style="font-family:monospace;font-size:18px;font-weight:bold;color:#3d0a20;letter-spacing:2px;">${orderNumber}</span>
</div>`;
}

function itemsTable(order: OrderDetails): string {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">
        ${item.productSnapshot.productName}
        ${item.productSnapshot.size ? `<br><span style="color:#6b7280;font-size:12px;">Size: ${item.productSnapshot.size}</span>` : ""}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:center;color:#374151;font-size:14px;">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right;color:#111827;font-size:14px;font-weight:600;">${formatPrice(item.total)}</td>
    </tr>`
    )
    .join("");

  return `
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
  <thead>
    <tr style="background:#f9fafb;">
      <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
      <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
      <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;
}

function totalsBlock(order: OrderDetails): string {
  const hasDiscount = Number(order.discountAmount) > 0;
  const freeShipping = Number(order.shippingAmount) === 0;

  return `
<div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:4px;">
  <table style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#6b7280;">Subtotal</td>
      <td style="padding:4px 0;font-size:14px;color:#374151;text-align:right;">${formatPrice(order.subtotal)}</td>
    </tr>
    ${
      hasDiscount
        ? `<tr>
      <td style="padding:4px 0;font-size:14px;color:#059669;">Discount</td>
      <td style="padding:4px 0;font-size:14px;color:#059669;text-align:right;">−${formatPrice(order.discountAmount)}</td>
    </tr>`
        : ""
    }
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#6b7280;">GST</td>
      <td style="padding:4px 0;font-size:14px;color:#374151;text-align:right;">${formatPrice(order.taxAmount)}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-size:14px;color:#6b7280;">Shipping</td>
      <td style="padding:4px 0;font-size:14px;color:#374151;text-align:right;">${freeShipping ? "Free" : formatPrice(order.shippingAmount)}</td>
    </tr>
    <tr style="border-top:2px solid #111827;">
      <td style="padding:12px 0 4px;font-size:16px;font-weight:bold;color:#111827;">Total</td>
      <td style="padding:12px 0 4px;font-size:16px;font-weight:bold;color:#3d0a20;text-align:right;">${formatPrice(order.total)}</td>
    </tr>
  </table>
</div>`;
}

function addressBlock(order: OrderDetails): string {
  const a = order.shippingAddress;
  return `
<div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
  <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Shipping to</p>
  ${a.fullName ? `<p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;">${a.fullName}</p>` : ""}
  ${a.line1 ? `<p style="margin:0 0 2px;font-size:14px;color:#374151;">${a.line1}</p>` : ""}
  ${a.line2 ? `<p style="margin:0 0 2px;font-size:14px;color:#374151;">${a.line2}</p>` : ""}
  ${a.city || a.state || a.pincode ? `<p style="margin:0 0 2px;font-size:14px;color:#374151;">${[a.city, a.state].filter(Boolean).join(", ")}${a.pincode ? ` – ${a.pincode}` : ""}</p>` : ""}
  ${a.phone ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;">📞 ${a.phone}</p>` : ""}
</div>`;
}

// ─────────────────────────────────────────────────────────────────────
// sendOrderConfirmationEmail
// ─────────────────────────────────────────────────────────────────────

function buildConfirmationHtml(order: OrderDetails): string {
  const body = `
<h2 style="margin:0 0 8px;font-size:24px;color:#111827;font-family:Georgia,serif;">Your order is confirmed! 🎉</h2>
<p style="margin:0 0 20px;font-size:15px;color:#6b7280;">Thank you for shopping with Surekh. We're preparing your order.</p>

${orderNumberPill(order.orderNumber)}
${itemsTable(order)}
${totalsBlock(order)}
${addressBlock(order)}

<p style="margin:24px 0 0;font-size:14px;color:#6b7280;">We'll notify you as soon as your order ships. ✉️</p>`;

  return wrapLayout(body);
}

export async function sendOrderConfirmationEmail(
  order: OrderDetails
): Promise<void> {
  if (!order.customerEmail) {
    console.warn(
      "[email] sendOrderConfirmationEmail: no customer email for order",
      order.orderNumber
    );
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: serverEnv.RESEND_FROM_EMAIL,
      to: order.customerEmail,
      subject: `Order confirmed – ${order.orderNumber} | Surekh`,
      html: buildConfirmationHtml(order),
    });

    if (error) {
      console.error("[email] sendOrderConfirmationEmail Resend error:", error);
    }
  } catch (err) {
    console.error("[email] sendOrderConfirmationEmail failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// sendOrderShippedEmail
// ─────────────────────────────────────────────────────────────────────

function buildShippedHtml(order: OrderDetails): string {
  const trackingBlock = order.awbNumber
    ? `
<div style="margin:20px 0;padding:16px;background:#f5f3ff;border-radius:8px;border:1px solid #ddd6fe;">
  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Shipment Tracking</p>
  <p style="margin:0 0 2px;font-size:14px;color:#374151;">Courier: <strong>DTDC</strong></p>
  <p style="margin:0 0 8px;font-size:14px;color:#374151;">AWB Number: <strong style="font-family:monospace;color:#5b21b6;">${order.awbNumber}</strong></p>
  <p style="margin:0;font-size:13px;color:#7c3aed;">
    Track your shipment on the
    <a href="https://www.dtdc.in/tracking.asp" style="color:#7c3aed;">DTDC website</a>
    using the AWB number above.
  </p>
</div>`
    : `<p style="margin:20px 0;font-size:14px;color:#6b7280;">Tracking details will be updated shortly.</p>`;

  const body = `
<h2 style="margin:0 0 8px;font-size:24px;color:#111827;font-family:Georgia,serif;">Your order is on its way! 🚚</h2>
<p style="margin:0 0 20px;font-size:15px;color:#6b7280;">Great news — your Surekh order has been shipped.</p>

${orderNumberPill(order.orderNumber)}
${trackingBlock}
${itemsTable(order)}
${addressBlock(order)}

<p style="margin:24px 0 0;font-size:14px;color:#6b7280;">Expected delivery in 3–5 business days.</p>`;

  return wrapLayout(body);
}

export async function sendOrderShippedEmail(
  order: OrderDetails
): Promise<void> {
  if (!order.customerEmail) {
    console.warn(
      "[email] sendOrderShippedEmail: no customer email for order",
      order.orderNumber
    );
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: serverEnv.RESEND_FROM_EMAIL,
      to: order.customerEmail,
      subject: `Your order ${order.orderNumber} has shipped! | Surekh`,
      html: buildShippedHtml(order),
    });

    if (error) {
      console.error("[email] sendOrderShippedEmail Resend error:", error);
    }
  } catch (err) {
    console.error("[email] sendOrderShippedEmail failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Return notification types
// ─────────────────────────────────────────────────────────────────────

interface ReturnEmailData {
  orderNumber: string;
  customerEmail: string | null;
  reason: string;
}

// ─────────────────────────────────────────────────────────────────────
// sendReturnApprovedEmail
// ─────────────────────────────────────────────────────────────────────

function buildReturnApprovedHtml(data: ReturnEmailData): string {
  const body = `
<h2 style="margin:0 0 8px;font-size:24px;color:#111827;font-family:Georgia,serif;">Your return request has been approved ✅</h2>
<p style="margin:0 0 20px;font-size:15px;color:#6b7280;">We've reviewed your return request and it has been approved. Our team will arrange a pickup of the item(s) shortly.</p>

${orderNumberPill(data.orderNumber)}

<div style="margin:20px 0;padding:16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Your Return Reason</p>
  <p style="margin:0;font-size:14px;color:#374151;">${data.reason}</p>
</div>

<p style="margin:24px 0 8px;font-size:14px;color:#374151;font-weight:600;">What happens next?</p>
<ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#6b7280;line-height:1.8;">
  <li>Please keep the item(s) packed and ready for pickup.</li>
  <li>Our courier will collect the item(s) from your shipping address.</li>
  <li>Once received and verified, we'll process your refund.</li>
</ul>

<p style="margin:0;font-size:14px;color:#6b7280;">If you have any questions, reply to this email or contact <a href="mailto:support@surekh.co.in" style="color:#3d0a20;">support@surekh.co.in</a>.</p>`;

  return wrapLayout(body);
}

export async function sendReturnApprovedEmail(
  data: ReturnEmailData
): Promise<void> {
  if (!data.customerEmail) {
    console.warn(
      "[email] sendReturnApprovedEmail: no customer email for order",
      data.orderNumber
    );
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: serverEnv.RESEND_FROM_EMAIL,
      to: data.customerEmail,
      subject: `Return approved – ${data.orderNumber} | Surekh`,
      html: buildReturnApprovedHtml(data),
    });

    if (error) {
      console.error("[email] sendReturnApprovedEmail Resend error:", error);
    }
  } catch (err) {
    console.error("[email] sendReturnApprovedEmail failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// sendReturnRejectedEmail
// ─────────────────────────────────────────────────────────────────────

function buildReturnRejectedHtml(data: ReturnEmailData): string {
  const body = `
<h2 style="margin:0 0 8px;font-size:24px;color:#111827;font-family:Georgia,serif;">Update on your return request</h2>
<p style="margin:0 0 20px;font-size:15px;color:#6b7280;">Thank you for reaching out. After reviewing your return request, we're unable to process it at this time.</p>

${orderNumberPill(data.orderNumber)}

<div style="margin:20px 0;padding:16px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">
  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Your Return Reason</p>
  <p style="margin:0;font-size:14px;color:#374151;">${data.reason}</p>
</div>

<p style="margin:20px 0;font-size:14px;color:#374151;">
  As per our policy, we only accept returns for items that arrive <strong>damaged or incorrect</strong>. 
  If you believe this decision was made in error or you have additional information to share, 
  please don't hesitate to contact our support team.
</p>

<p style="margin:0;font-size:14px;color:#6b7280;">
  Contact us at <a href="mailto:support@surekh.co.in" style="color:#3d0a20;">support@surekh.co.in</a> 
  — we're happy to help clarify or reconsider.
</p>`;

  return wrapLayout(body);
}

export async function sendReturnRejectedEmail(
  data: ReturnEmailData
): Promise<void> {
  if (!data.customerEmail) {
    console.warn(
      "[email] sendReturnRejectedEmail: no customer email for order",
      data.orderNumber
    );
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: serverEnv.RESEND_FROM_EMAIL,
      to: data.customerEmail,
      subject: `Update on your return request – ${data.orderNumber} | Surekh`,
      html: buildReturnRejectedHtml(data),
    });

    if (error) {
      console.error("[email] sendReturnRejectedEmail Resend error:", error);
    }
  } catch (err) {
    console.error("[email] sendReturnRejectedEmail failed:", err);
  }
}
