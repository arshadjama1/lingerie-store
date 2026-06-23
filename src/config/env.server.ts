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
