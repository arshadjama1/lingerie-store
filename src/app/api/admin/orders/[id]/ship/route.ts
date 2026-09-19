import { NextResponse } from "next/server";

import {
  ForbiddenError,
  UnauthorizedError,
  withErrorHandling,
} from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { getAdminOrderDetails } from "@/modules/admin/orders";
import { createDtdcShipment } from "@/modules/shipping";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    throw new ForbiddenError();
  }
}

export const POST = withErrorHandling(async (_req: Request, ctx?: unknown) => {
  const params = (ctx as { params: Promise<{ id: string }> })?.params;
  const { id: orderId } = await params;

  await assertAdmin();

  // Fetch full order details for DTDC shipment creation
  const order = await getAdminOrderDetails(orderId);

  // This throws the stub error until DTDC API keys are configured.
  // withErrorHandling catches it and returns a 500 JSON response with
  // the descriptive error message, which the AdminShipForm displays inline.
  const result = await createDtdcShipment(order);

  return NextResponse.json({ success: true, awbNumber: result.awbNumber });
});
