import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { returnRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { assertAdmin } from "@/lib/admin-auth";
import {
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";

import {
  RETURN_VALID_TRANSITIONS,
  type ReturnStatus,
  getAdminReturnDetails,
  updateReturnStatus,
} from "@/modules/admin/returns";
import {
  sendReturnApprovedEmail,
  sendReturnRejectedEmail,
} from "@/modules/notifications";

const bodySchema = z.object({
  status: z.enum([
    "requested",
    "approved",
    "rejected",
    "picked_up",
    "refunded",
  ]),
  notes: z.string().optional(),
});

export const PATCH = withErrorHandling(async (req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: returnId } = await params;

  await assertAdmin();

  const body = bodySchema.safeParse(
    await (req as NextRequest).json().catch(() => ({}))
  );
  if (!body.success) {
    throw new ValidationError(body.error.issues[0]?.message ?? "Invalid input");
  }

  const { status: newStatus, notes } = body.data;

  // Validate transition before delegating to the module (gives a clear 400
  // before any DB write happens, consistent with the orders status route).
  const current = await db.query.returnRequests.findFirst({
    where: eq(returnRequests.id, returnId),
  });
  if (!current) throw new NotFoundError("Return request");

  const allowed =
    RETURN_VALID_TRANSITIONS[current.status as ReturnStatus] ?? [];
  if (!allowed.includes(newStatus as ReturnStatus)) {
    throw new ValidationError(
      `Cannot transition from "${current.status}" to "${newStatus}". ` +
        `Allowed: ${allowed.length ? allowed.join(", ") : "none"}`
    );
  }

  // Execute the update (validates again internally + handles inventory)
  await updateReturnStatus(returnId, newStatus as ReturnStatus, notes);

  // Fire-and-forget customer notifications for terminal decisions
  if (newStatus === "approved" || newStatus === "rejected") {
    getAdminReturnDetails(returnId)
      .then((details) => {
        if (newStatus === "approved") return sendReturnApprovedEmail(details);
        return sendReturnRejectedEmail(details);
      })
      .catch((err) =>
        console.error("[notifications] return status notification failed:", err)
      );
  }

  return NextResponse.json({ success: true, status: newStatus });
});
