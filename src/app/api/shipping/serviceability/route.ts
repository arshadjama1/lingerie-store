import { type NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ValidationError, withErrorHandling } from "@/lib/errors";

import { checkDtdcPincodeServiceability } from "@/modules/shipping";

const querySchema = z.object({
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be a 6-digit Indian postal code"),
});

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    pincode: searchParams.get("pincode") ?? "",
  });

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid pincode"
    );
  }

  const result = await checkDtdcPincodeServiceability(parsed.data.pincode);

  return NextResponse.json({
    success: true,
    serviceability: result,
  });
});

export const POST = withErrorHandling(async (req: Request) => {
  const json = await (req as NextRequest).json();
  const parsed = querySchema.safeParse(json);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid pincode"
    );
  }

  const result = await checkDtdcPincodeServiceability(parsed.data.pincode);

  return NextResponse.json({
    success: true,
    serviceability: result,
  });
});
