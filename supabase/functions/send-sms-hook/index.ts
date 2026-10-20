import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

/**
 * Supabase "Send SMS" Hook — MSG91 Campaign Run API delivery.
 *
 * Register this function as the Send SMS hook in:
 *   Supabase Dashboard → Authentication → Hooks → Send SMS
 *
 * Environment variables / secrets:
 *   MSG91_AUTH_KEY         — your MSG91 authkey
 *   MSG91_OTP_FLOW_ID      — the DLT-approved campaign slug (e.g. login-otp1)
 *   SEND_SMS_HOOK_SECRET   — the hook secret generated in Supabase Dashboard (starts with v1,whsec_ or whsec_)
 *
 * Supabase GoTrue Auth payload structure:
 *   {
 *     "user": { "id": "...", "phone": "917992480412", ... },
 *     "sms": { "otp": "123456", "phone": "..." }
 *   }
 */

const MSG91_CAMPAIGN_BASE =
  "https://control.msg91.com/api/v5/campaign/api/campaigns";

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

  // 1. Signature / Secret verification
  const webhookSecret =
    Deno.env.get("SEND_SMS_HOOK_SECRET") ||
    Deno.env.get("SUPABASE_HOOK_SEND_SMS_SECRET");

  if (webhookSecret) {
    const hasSignature =
      req.headers.get("webhook-signature") || req.headers.get("svix-signature");
    const authHeader = req.headers.get("authorization");

    if (hasSignature) {
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
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
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

  const variablesMap = {
    numeric: String(otp),
    NUMERIC: String(otp),
    otp: String(otp),
    OTP: String(otp),
    code: String(otp),
    CODE: String(otp),
    token: String(otp),
    TOKEN: String(otp),
    var1: String(otp),
    VAR1: String(otp),
  };

  // MSG91 Campaign Run API — variables mapped at both contact (to) and sendTo level
  const campaignPayload = {
    data: {
      sendTo: [
        {
          to: [
            {
              mobiles: mobile,
              variables: variablesMap,
            },
          ],
          variables: variablesMap,
        },
      ],
    },
  };

  const campaignUrl = `${MSG91_CAMPAIGN_BASE}/${templateId}/run`;

  try {
    const res = await fetch(campaignUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify(campaignPayload),
    });

    const responseJson = (await res.json().catch(() => ({}))) as {
      status?: string;
      hasError?: boolean;
      data?: { message?: string; request_id?: string };
      errors?: string[];
    };

    const isError = !res.ok || responseJson.hasError === true;

    if (isError) {
      console.error("[send-sms-hook] MSG91 campaign rejected:", responseJson);
      return new Response(
        JSON.stringify({
          error: {
            http_code: 502,
            message: responseJson.errors?.join(", ") ?? "MSG91 delivery failed",
          },
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

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
