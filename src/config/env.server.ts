import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_DIRECT_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  MSG91_AUTH_KEY: z.string().min(1),
  MSG91_SENDER_ID: z.string().min(1),
  MSG91_OTP_FLOW_ID: z.string().min(1),
  MSG91_ORDER_FLOW_ID: z.string().optional(),
  MSG91_SHIPPED_FLOW_ID: z.string().optional(),
  SHIPROCKET_EMAIL: z.string().email().optional(),
  SHIPROCKET_PASSWORD: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REVALIDATE_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // DTDC Express Logistics — credentials MUST be set in environment.
  // No defaults for credentials or operator PII (never commit real values to source).
  DTDC_API_KEY: z.string().min(1, "DTDC_API_KEY is required"),
  DTDC_CUSTOMER_CODE: z.string().min(1, "DTDC_CUSTOMER_CODE is required"),
  DTDC_API_URL: z.string().url().optional().default("https://pxapi.dtdc.in"),
  DTDC_SERVICE_TYPE_ID: z.string().optional().default("B2C PRIORITY"),
  DTDC_COMMODITY_ID: z.string().optional().default("CLOTHING"),
  DTDC_TRACKING_URL: z
    .string()
    .url()
    .optional()
    .default("https://blktracksvc.dtdc.com"),
  // Tracking API v4 uses separate username/password auth (not the api-key header)
  DTDC_TRACK_USERNAME: z.string().optional().default(""),
  DTDC_TRACK_PASSWORD: z.string().optional().default(""),
  DTDC_PINCODE_URL: z
    .string()
    .url()
    .optional()
    .default("https://smarttrack-ctbsplus.dtdc.com/ratecalapi/PincodeApiCall"),

  // DTDC Warehouse / Shipper Origin — must be set in environment (operator PII).
  DTDC_WAREHOUSE_NAME: z.string().min(1, "DTDC_WAREHOUSE_NAME is required"),
  DTDC_WAREHOUSE_PHONE: z.string().min(1, "DTDC_WAREHOUSE_PHONE is required"),
  DTDC_WAREHOUSE_LINE1: z.string().min(1, "DTDC_WAREHOUSE_LINE1 is required"),
  DTDC_WAREHOUSE_LINE2: z.string().optional().default(""),
  DTDC_WAREHOUSE_PINCODE: z
    .string()
    .min(1, "DTDC_WAREHOUSE_PINCODE is required"),
  DTDC_WAREHOUSE_CITY: z.string().min(1, "DTDC_WAREHOUSE_CITY is required"),
  DTDC_WAREHOUSE_STATE: z.string().min(1, "DTDC_WAREHOUSE_STATE is required"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const lines = Object.entries(errors)
    .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
    .join("\n");
  console.error("\n❌  Missing or invalid environment variables:\n");
  console.error(lines);
  console.error(
    "\nCopy .env.local.example to .env.local and fill in all required values.\n"
  );
  process.exit(1);
}

export const serverEnv = parsed.data;
