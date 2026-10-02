"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { inventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { ActionResult } from "./types";

// ── Validation schema ────────────────────────────────────────────────

const UpdateStockSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  lowStockAlert: z
    .number({ error: "Alert threshold must be a number" })
    .int("Alert threshold must be a whole number")
    .min(0, "Alert threshold cannot be negative"),
});

// ── updateStockAction ────────────────────────────────────────────────
// Updates quantity and lowStockAlert for a single inventory row.
// Called from InventoryStockEditor via useActionState.

export async function updateStockAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // ── Auth guard ───────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // ── Parse + validate ─────────────────────────────────────────────
  const raw = {
    variantId: formData.get("variantId"),
    quantity: Number(formData.get("quantity")),
    lowStockAlert: Number(formData.get("lowStockAlert")),
  };

  const parsed = UpdateStockSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: firstError };
  }

  const { variantId, quantity, lowStockAlert } = parsed.data;

  // Ensure lowStockAlert does not exceed quantity (mirrors the DB CHECK constraint
  // `reserved_lte_quantity` — here we only guard the alert threshold semantically,
  // not a hard DB constraint, but it makes the UI safer).
  if (lowStockAlert > quantity) {
    return {
      success: false,
      error: "Alert threshold cannot exceed total stock quantity.",
    };
  }

  // ── Write ────────────────────────────────────────────────────────
  try {
    const result = await db
      .update(inventory)
      .set({ quantity, lowStockAlert })
      .where(eq(inventory.variantId, variantId))
      .returning({ id: inventory.id });

    if (result.length === 0) {
      return {
        success: false,
        error: "Inventory record not found for this variant.",
      };
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/admin"); // refresh dashboard low-stock count

    return { success: true };
  } catch (err) {
    // Bubble up DB CHECK constraint violations (e.g. quantity < 0,
    // or reserved_quantity > quantity) as friendly error messages.
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
