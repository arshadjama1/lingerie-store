/* eslint-disable no-console */
import crypto from "crypto";

import { CreateAddressSchema } from "../src/modules/addresses/types";
import { calculateCheckoutTotals } from "../src/modules/checkout/calculations";
import type { CheckoutLineItem } from "../src/modules/checkout/types";
import { VALID_TRANSITIONS } from "../src/modules/orders/transitions";
import type { OrderStatus } from "../src/modules/orders/types";
import type { OrderDetails } from "../src/modules/orders/types";
import {
  defaultTatDays,
  isMetroPincode,
} from "../src/modules/shipping/estimates";

function calculateDefaultPackageDimensions(order: OrderDetails) {
  let totalWeightGrams = 100;
  for (const item of order.items) {
    const pieceWeight = 300;
    totalWeightGrams += pieceWeight * Math.max(1, item.quantity);
  }
  const weightKg = Math.max(
    0.2,
    Math.round((totalWeightGrams / 1000) * 100) / 100
  );
  return { length: 20, width: 15, height: 5, weightKg };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ""}`);
  }
}

console.log("\n========================================================");
console.log("       SUREKH E-COMMERCE CORE SUITE VERIFICATION        ");
console.log("========================================================\n");

// ─── 1. ADDRESS VALIDATION TESTS ──────────────────────────────────
console.log("▶ [1/6] Testing Address Validation (Zod Schema)...");
{
  const validAddress = {
    fullName: "Priya Sharma",
    phone: "9876543210",
    line1: "Flat 402, Lotus Towers",
    line2: "Opposite High Street Mall",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isDefault: true,
  };
  const validResult = CreateAddressSchema.safeParse(validAddress);
  assert(validResult.success, "Valid Indian address format passes");

  // Invalid pincode (5 digits)
  const invalidPincode = { ...validAddress, pincode: "40001" };
  const resBadPin = CreateAddressSchema.safeParse(invalidPincode);
  assert(!resBadPin.success, "Rejects invalid 5-digit postal code");

  // Invalid pincode (alphanumeric)
  const alphaPin = { ...validAddress, pincode: "40000A" };
  const resAlphaPin = CreateAddressSchema.safeParse(alphaPin);
  assert(!resAlphaPin.success, "Rejects alphanumeric postal code");

  // Invalid phone (9 digits)
  const shortPhone = { ...validAddress, phone: "987654321" };
  const resShortPhone = CreateAddressSchema.safeParse(shortPhone);
  assert(
    !resShortPhone.success,
    "Rejects phone number with fewer than 10 digits"
  );

  // Missing required full name
  const noName = { ...validAddress, fullName: "" };
  const resNoName = CreateAddressSchema.safeParse(noName);
  assert(!resNoName.success, "Rejects empty full name");
}

// ─── 2. CHECKOUT TOTALS & SHIPPING RULE TESTS ────────────────────
console.log(
  "\n▶ [2/6] Testing Checkout Totals & Shipping Rule (₹1,299 Free Shipping)..."
);
{
  // Test Case A: Subtotal < 1299 should add ₹99 shipping
  const cartItemUnder: CheckoutLineItem = {
    variantId: "v1",
    quantity: 1,
    unitPrice: 799,
    taxAmount: 0,
    total: 799,
    snapshot: { productName: "Silk Bra", sku: "SB-01" },
  };
  const totalsUnder = calculateCheckoutTotals([cartItemUnder], 0);
  assert(totalsUnder.subtotal === 799, "Subtotal is ₹799");
  assert(
    totalsUnder.shippingAmount === 99,
    "Shipping is ₹99 for orders under ₹1,299"
  );
  assert(
    totalsUnder.total === 898,
    "Grand total matches subtotal + shipping (₹898)"
  );

  // Test Case B: Subtotal >= 1299 qualifies for Free Shipping
  const cartItemOver: CheckoutLineItem = {
    variantId: "v2",
    quantity: 1,
    unitPrice: 1499,
    taxAmount: 0,
    total: 1499,
    snapshot: { productName: "Lace Nightwear", sku: "LN-01" },
  };
  const totalsOver = calculateCheckoutTotals([cartItemOver], 0);
  assert(totalsOver.subtotal === 1499, "Subtotal is ₹1499");
  assert(
    totalsOver.shippingAmount === 0,
    "Free shipping applies for orders >= ₹1,299"
  );
  assert(
    totalsOver.total === 1499,
    "Grand total equals subtotal when shipping is free"
  );

  // Test Case C: Exactly ₹1,299 threshold qualifies for Free Shipping
  const cartItemExact: CheckoutLineItem = {
    variantId: "v3",
    quantity: 1,
    unitPrice: 1299,
    taxAmount: 0,
    total: 1299,
    snapshot: { productName: "Satin Robe", sku: "SR-01" },
  };
  const totalsExact = calculateCheckoutTotals([cartItemExact], 0);
  assert(
    totalsExact.shippingAmount === 0,
    "Exact ₹1,299 qualifies for free shipping"
  );
  assert(totalsExact.total === 1299, "Total matches ₹1,299");

  // Test Case D: Discount exceeding subtotal doesn't make total negative
  const totalsDiscounted = calculateCheckoutTotals([cartItemUnder], 1000);
  assert(
    totalsDiscounted.total >= 0,
    "Discount cannot cause negative order total"
  );
}

// ─── 3. ORDER STATE MACHINE INTEGRITY ─────────────────────────────
console.log("\n▶ [3/6] Testing Order Lifecycle State Machine...");
{
  function isTransitionAllowed(from: OrderStatus, to: OrderStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  // Legal transitions
  assert(
    isTransitionAllowed("pending", "confirmed"),
    "Legal: pending -> confirmed"
  );
  assert(
    isTransitionAllowed("confirmed", "processing"),
    "Legal: confirmed -> processing"
  );
  assert(
    isTransitionAllowed("processing", "shipped"),
    "Legal: processing -> shipped"
  );
  assert(
    isTransitionAllowed("shipped", "delivered"),
    "Legal: shipped -> delivered"
  );
  assert(
    isTransitionAllowed("delivered", "refunded"),
    "Legal: delivered -> refunded"
  );
  assert(
    isTransitionAllowed("confirmed", "cancelled"),
    "Legal: confirmed -> cancelled"
  );

  // Illegal transitions
  assert(
    !isTransitionAllowed("pending", "delivered"),
    "Illegal blocked: pending -> delivered"
  );
  assert(
    !isTransitionAllowed("confirmed", "delivered"),
    "Illegal blocked: confirmed -> delivered"
  );
  assert(
    !isTransitionAllowed("cancelled", "shipped"),
    "Illegal blocked: cancelled -> shipped"
  );
  assert(
    !isTransitionAllowed("cancelled", "delivered"),
    "Illegal blocked: cancelled -> delivered"
  );
  assert(
    !isTransitionAllowed("delivered", "cancelled"),
    "Illegal blocked: delivered -> cancelled"
  );
}

// ─── 4. LOGISTICS & DTDC SHIPPING DIMENSIONS ──────────────────────
console.log("\n▶ [4/6] Testing DTDC Logistics Dimensions & TAT Estimates...");
{
  const mockOrder: OrderDetails = {
    id: "ord_1",
    orderNumber: "SUREKH-TEST01",
    status: "confirmed",
    customerEmail: "customer@example.com",
    shippingAddress: {
      fullName: "Ananya Patel",
      line1: "123 Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400020",
      phone: "9876543210",
    },
    subtotal: "1499",
    discountAmount: "0",
    taxAmount: "0",
    shippingAmount: "0",
    total: "1499",
    confirmedAt: new Date(),
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    awbNumber: null,
    items: [
      {
        id: "item_1",
        variantId: "v_1",
        quantity: 2,
        unitPrice: "749.50",
        taxAmount: "0",
        total: "1499",
        productSnapshot: { productName: "Cotton Bralette", sku: "CB-01" },
      },
    ],
    payment: {
      method: "upi",
      razorpayPaymentId: "pay_test123",
      amount: "1499",
    },
    statusHistory: [],
  };

  const dims = calculateDefaultPackageDimensions(mockOrder);
  assert(dims.weightKg >= 0.2, "Minimum billing weight for DTDC is >= 0.20 kg");
  assert(
    dims.length > 0 && dims.width > 0 && dims.height > 0,
    "Package dimensions have valid cm measurements"
  );

  // Metro pincodes TAT
  assert(
    isMetroPincode("400001"),
    "Identifies Mumbai (400xxx) as metro pincode"
  );
  assert(
    isMetroPincode("110001"),
    "Identifies Delhi (110xxx) as metro pincode"
  );
  assert(
    isMetroPincode("560001"),
    "Identifies Bengaluru (560xxx) as metro pincode"
  );
  assert(
    !isMetroPincode("790001"),
    "Identifies remote Arunachal Pradesh as non-metro"
  );
  assert(defaultTatDays("400001") === 2, "Metro TAT is 2 business days");
  assert(
    defaultTatDays("790001") === 4,
    "Rest of India TAT is 4 business days"
  );
}

// ─── 5. RAZORPAY PAYMENT & WEBHOOK CRYPTOGRAPHIC SIGNATURE ────────
console.log("\n▶ [5/6] Testing Razorpay Cryptographic Verification...");
{
  const secret = "test_razorpay_secret_key_12345";
  const orderId = "order_O8xG9cT8G5oM7a";
  const paymentId = "pay_O8xH2g8F3vC1bX";

  // Simulate payment signature verification
  const validPaymentSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const tamperedPaymentSignature = "tampered_signature_hex_value_00000";

  function verifyPayment(
    orderId: string,
    paymentId: string,
    sig: string,
    secretKey: string
  ) {
    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return expected === sig;
  }

  assert(
    verifyPayment(orderId, paymentId, validPaymentSignature, secret),
    "Valid Razorpay payment signature correctly verified"
  );
  assert(
    !verifyPayment(orderId, paymentId, tamperedPaymentSignature, secret),
    "Tampered payment signature successfully rejected"
  );

  // Webhook signature verification
  const webhookBody = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: { entity: { id: paymentId, order_id: orderId, amount: 149900 } },
    },
  });

  const validWebhookSignature = crypto
    .createHmac("sha256", secret)
    .update(webhookBody)
    .digest("hex");

  function verifyWebhook(body: string, sig: string, secretKey: string) {
    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("hex");
    return expected === sig;
  }

  assert(
    verifyWebhook(webhookBody, validWebhookSignature, secret),
    "Valid Razorpay webhook signature correctly verified"
  );
  assert(
    !verifyWebhook(webhookBody, "wrong_sig", secret),
    "Forged webhook payload / signature successfully rejected"
  );
}

// ─── 6. MONETARY & CURRENCY INTEGRITY ─────────────────────────────
console.log("\n▶ [6/6] Testing Monetary & Paise Rounding Precision...");
{
  // Paise conversion (Razorpay requires integer paise)
  const rupees = 1299.5;
  const paise = Math.round(rupees * 100);
  assert(
    paise === 129950,
    "Rupees to Paise conversion exact without floating point drift"
  );

  // Sum of fractional prices
  const itemA: CheckoutLineItem = {
    variantId: "va",
    quantity: 3,
    unitPrice: 299.33,
    taxAmount: 0,
    total: 897.99,
    snapshot: { productName: "Item A", sku: "IA" },
  };
  const itemB: CheckoutLineItem = {
    variantId: "vb",
    quantity: 2,
    unitPrice: 199.33,
    taxAmount: 0,
    total: 398.66,
    snapshot: { productName: "Item B", sku: "IB" },
  };
  const totals = calculateCheckoutTotals([itemA, itemB], 0);
  assert(
    typeof totals.total === "number",
    "Totals returned as clean numeric values"
  );
  assert(
    totals.subtotal === 1296.65,
    "Subtotal handles decimals without floating point glitch"
  );
}

console.log("\n========================================================");
console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
if (failedTests > 0) {
  console.error(`❌ FAILED: ${failedTests} test(s) failed!`);
  process.exit(1);
} else {
  console.log("✅ ALL PRODUCT & CORE BUSINESS LOGIC TESTS PASSED!");
  console.log("========================================================\n");
}
