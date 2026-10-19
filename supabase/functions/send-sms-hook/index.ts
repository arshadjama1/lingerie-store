import { Webhook } from "https://esm.sh/standard-webhooks@1.0.0";

/**
 * Supabase "Send SMS" Hook — MSG91 Flow API delivery.
 *
 * Register this function as the Send SMS hook in:
 *   Supabase Dashboard → Authentication → Hooks → Send SMS
 *
 * Environment variables / secrets (configured via `supabase secrets set`):
 *   MSG91_AUTH_KEY         — your MSG91 authkey
 *   MSG91_OTP_FLOW_ID      — the DLT-approved OTP template / flow ID
 *   SEND_SMS_HOOK_SECRET   — the hook secret generated in Supabase Dashboard (starts with v1,whsec_ or whsec_)
 *
 * Supabase GoTrue Auth payload structure:
 *   {
 *     "user": { "id": "...", "phone": "+919876543210", ... },
 *     "sms": { "otp": "123456", "template": "..." }
 *   }
 */

const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/";

function normaliseToIndianE164Digits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();

  // 1. Verify Request Signature / Authentication
  const webhookSecret =
    Deno.env.get("SEND_SMS_HOOK_SECRET") ||
    Deno.env.get("SUPABASE_HOOK_SEND_SMS_SECRET");

  if (webhookSecret) {
    const hasSignature =
      req.headers.get("webhook-signature") || req.headers.get("svix-signature");
    const authHeader = req.headers.get("authorization");

    if (hasSignature) {
      // Standard Webhooks HMAC verification (Supabase GoTrue default)
      try {
        const cleanSecret = webhookSecret
          .replace(/^v1,/, "")
          .replace(/^whsec_/, "");
        const wh = new Webhook(cleanSecret);
        const headers = {
          "webhook-id":
            req.headers.get("webhook-id") ?? req.headers.get("svix-id") ?? "",
          "webhook-timestamp":
            req.headers.get("webhook-timestamp") ??
            req.headers.get("svix-timestamp") ??
            "",
          "webhook-signature":
            req.headers.get("webhook-signature") ??
            req.headers.get("svix-signature") ??
            "",
        };
        wh.verify(rawBody, headers);
      } catch (err) {
        console.error(
          "[send-sms-hook] Webhook signature verification failed:",
          err
        );
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (authHeader) {
      // Fallback: Bearer token (useful for manual testing)
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      // Secret is configured but no credentials were provided at all — reject
      console.error(
        "[send-sms-hook] Request rejected: secret configured but no auth credentials sent"
      );
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // 2. Parse payload
  let body: {
    user?: { phone?: string };
    sms?: { otp?: string };
    phone?: string;
    otp?: string;
  };

  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Extract phone & OTP with backwards-compatible fallbacks
  const phone = body.user?.phone ?? body.phone;
  const otp = body.sms?.otp ?? body.otp;

  if (!phone || !otp) {
    console.error(
      "[send-sms-hook] Missing phone or otp. Received payload:",
      body
    );
    return new Response(
      JSON.stringify({ error: "Missing phone or otp in payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const authKey = Deno.env.get("MSG91_AUTH_KEY");
  const templateId = Deno.env.get("MSG91_OTP_FLOW_ID");

  if (!authKey || !templateId) {
    console.error(
      "[send-sms-hook] MSG91_AUTH_KEY or MSG91_OTP_FLOW_ID not set"
    );
    return new Response(
      JSON.stringify({ error: "SMS provider credentials missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const mobile = normaliseToIndianE164Digits(phone);

  // MSG91 Flow API v5 format with dual-case variable support for DLT
  const payload = {
    template_id: templateId,
    short_url: "0",
    recipients: [
      {
        mobiles: mobile,
        otp: String(otp),
        OTP: String(otp),
      },
    ],
  };

  try {
    const res = await fetch(MSG91_FLOW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as {
      type?: string;
      message?: string;
    };

    if (!res.ok || data.type === "error") {
      console.error("[send-sms-hook] MSG91 delivery rejected:", data);
      return new Response(
        JSON.stringify({
          error: {
            http_code: 502,
            message: data.message ?? "MSG91 delivery failed",
          },
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Supabase Auth expects 200 OK (empty object) on success
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-sms-hook] Network or execution error:", err);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: "Internal error delivering SMS",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
