import "server-only";
import { z } from "zod";

const schema = z.object({
  SUPABASE_SECRET_KEY: z
    .string()
    .min(1)
    .refine(
      (k) => k.startsWith("sb_secret_") || k.startsWith("eyJ"),
      "Key must start with sb_secret_ (new) or eyJ (legacy service_role)"
    ),
  DATABASE_URL: z.string().min(1, "DATABASE_URL required (pooler, port 6543)"),
  DATABASE_DIRECT_URL: z
    .string()
    .min(1, "DATABASE_DIRECT_URL required (direct, port 5432)"),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  MSG91_AUTH_KEY: z.string().min(1),
  MSG91_OTP_FLOW_ID: z.string().min(1),
  MSG91_ORDER_FLOW_ID: z.string().optional(),
  MSG91_SHIPPED_FLOW_ID: z.string().optional(),
  MSG91_SENDER_ID: z.string().default("BRAND"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email().default("orders@fashionstore.com"),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SHIPROCKET_EMAIL: z.string().email().optional(),
  SHIPROCKET_PASSWORD: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  REVALIDATE_SECRET: z.string().min(32).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error("\n❌  Invalid server environment variables:\n");
  Object.entries(errors).forEach(([key, messages]) => {
    console.error(`  ${key}: ${messages?.join(", ")}`);
  });
  throw new Error("Invalid server environment variables. See above.");
}

export const serverEnv = parsed.data;
