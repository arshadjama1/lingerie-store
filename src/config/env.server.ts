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

  // DTDC Express Logistics
  DTDC_API_KEY: z.string().optional().default("ad2e54eabad12f21e624fcabf55ade"),
  DTDC_CUSTOMER_CODE: z.string().optional().default("GL19550"),
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

  // DTDC Warehouse / Shipper Origin
  DTDC_WAREHOUSE_NAME: z.string().optional().default("Surekh"),
  DTDC_WAREHOUSE_PHONE: z.string().optional().default("9702150990"),
  DTDC_WAREHOUSE_LINE1: z
    .string()
    .optional()
    .default("Shop No 1, Raj Darshan Apartment"),
  DTDC_WAREHOUSE_LINE2: z
    .string()
    .optional()
    .default("In front of kajuwadi last bus stop, louiswadi"),
  DTDC_WAREHOUSE_PINCODE: z.string().optional().default("400604"),
  DTDC_WAREHOUSE_CITY: z.string().optional().default("Thane West"),
  DTDC_WAREHOUSE_STATE: z.string().optional().default("Maharashtra"),
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
