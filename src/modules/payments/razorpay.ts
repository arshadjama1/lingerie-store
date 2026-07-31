import crypto from "crypto";
import Razorpay from "razorpay";
import "server-only";

import { serverEnv } from "@/config/env.server";

import { InvalidSignatureError } from "@/lib/errors";

export const razorpayClient = new Razorpay({
  key_id: serverEnv.RAZORPAY_KEY_ID,
  key_secret: serverEnv.RAZORPAY_KEY_SECRET,
});

export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string
) {
  const order = await razorpayClient.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
  });

  return order;
}

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", serverEnv.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new InvalidSignatureError();
  }

  return true;
}

export function verifyWebhookSignature(
  bodyText: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", serverEnv.RAZORPAY_WEBHOOK_SECRET)
    .update(bodyText)
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new InvalidSignatureError();
  }

  return true;
}
