import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkoutSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

import { withErrorHandling } from "@/lib/errors";

import { expireCheckoutSession } from "@/modules/checkout";
import {
  processPaymentSuccess,
  verifyWebhookSignature,
} from "@/modules/payments";

export const POST = withErrorHandling(async (req: Request) => {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  verifyWebhookSignature(rawBody, signature);

  const event = JSON.parse(rawBody);

  // Process successful payment capture
  if (event.event === "payment.captured") {
    const entity = event.payload?.payment?.entity;
    if (entity) {
      const razorpayOrderId = entity.order_id;
      const razorpayPaymentId = entity.id;
      const method = entity.method;

      if (razorpayOrderId && razorpayPaymentId) {
        const session = await db.query.checkoutSessions.findFirst({
          where: eq(checkoutSessions.razorpayOrderId, razorpayOrderId),
        });

        if (session) {
          await processPaymentSuccess({
            checkoutSessionId: session.id,
            razorpayOrderId,
            razorpayPaymentId,
            method,
          });
        }
      }
    }
  }

  // Release reserved inventory immediately on payment failure so other
  // customers can purchase the items without waiting for the 15-min timeout.
  if (event.event === "payment.failed") {
    const entity = event.payload?.payment?.entity;
    const razorpayOrderId = entity?.order_id;
    if (razorpayOrderId) {
      const session = await db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.razorpayOrderId, razorpayOrderId),
      });
      if (session && session.status === "active") {
        await expireCheckoutSession(session.id);
      }
    }
  }

  return NextResponse.json({ received: true });
});
