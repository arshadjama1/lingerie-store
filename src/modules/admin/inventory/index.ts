// Server Action — safe to import in Client Components (Next.js serialises the call)
export { updateStockAction } from "./actions";

// Types — type-only imports are always safe (erased at runtime)
export type {
  ActionResult,
  InventoryListItem,
  InventorySortOption,
  ListInventoryParams,
  ListInventoryResult,
  UpdateStockPayload,
} from "./types";

// NOTE: listInventory lives in ./queries.ts which has "server-only".
// Import it directly in Server Components:
//   import { listInventory } from "@/modules/admin/inventory/queries";
