import { NextResponse } from "next/server";

import { UnauthorizedError, withErrorHandling } from "@/lib/errors";

import { cleanupExpiredCheckoutSessions } from "@/modules/checkout";

export const POST = withErrorHandling(async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    throw new UnauthorizedError("Invalid cron secret");
  }

  const cleanedSessions = await cleanupExpiredCheckoutSessions();

  return NextResponse.json({
    success: true,
    cleanedSessions,
  });
});

export const GET = POST;
