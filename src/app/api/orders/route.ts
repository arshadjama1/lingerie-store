import { NextResponse } from "next/server";

import { UnauthorizedError, withErrorHandling } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

import { listUserOrders } from "@/modules/orders";

export const GET = withErrorHandling(async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const result = await listUserOrders(user.id, { page });

  return NextResponse.json(result);
});
