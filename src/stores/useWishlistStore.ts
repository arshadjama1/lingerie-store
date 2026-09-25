import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  WishlistItemProduct,
  WishlistItemWithProduct,
  WishlistProductVariant,
} from "@/modules/wishlist/types";

export interface WishlistProductInput {
  id: string;
  parentProductId?: string;
  selectedColor?: string | null;
  colorName?: string | null;
  slug: string;
  name: string;
  brandName?: string | null;
  primaryImage?: { url: string; alt: string | null } | null;
  minPrice?: string;
  minMrp?: string;
  isInStock?: boolean;
  ratingAvg?: string;
  ratingCount?: number;
  variants?: Array<
    | WishlistProductVariant
    | {
        id: string;
        size: string;
        color: string;
        price: string;
        isAvailable: boolean;
        sku?: string;
        mrp?: string;
        isInStock?: boolean;
        availableStock?: number;
      }
  >;
}

export function isWishlistItemMatch(
  item: WishlistItemWithProduct,
  productIdOrCardId: string,
  color?: string | null,
  variantId?: string | null
): boolean {
  // 1. Direct item ID or variant ID match
  if (
    item.id === productIdOrCardId ||
    (variantId && item.variantId === variantId)
  ) {
    return true;
  }

  // 2. Direct card ID match (e.g. "prod_1-pink")
  if (item.product.id === productIdOrCardId) {
    return true;
  }

  // 3. Base product ID match
  const matchesBaseProduct =
    item.productId === productIdOrCardId ||
    item.product.slug === productIdOrCardId;

  if (matchesBaseProduct) {
    // If a color is specified, verify color matches
    if (color) {
      const itemColor =
        item.selectedVariant?.color ||
        item.product.selectedColor ||
        item.product.colorName;
      if (itemColor) {
        return itemColor.toLowerCase() === color.toLowerCase();
      }
    } else {
      // If no color specified on card or on item, it's a match
      const itemColor =
        item.selectedVariant?.color ||
        item.product.selectedColor ||
        item.product.colorName;
      return !itemColor;
    }
  }

  return false;
}

interface WishlistState {
  items: WishlistItemWithProduct[];
  productIds: string[];
  isLoading: boolean;
  isAuthenticated: boolean | null;
  hasHydrated: boolean;
  isUpdatingItem: Record<string, boolean>;

  // Actions
  setHasHydrated: (val: boolean) => void;
  fetchWishlist: () => Promise<void>;
  hasItem: (
    productIdOrCardId: string,
    color?: string | null,
    variantId?: string | null
  ) => boolean;
  toggleWishlist: (
    product: WishlistProductInput,
    variantId?: string | null
  ) => Promise<boolean>;
  removeItem: (productIdOrItemId: string) => Promise<boolean>;
  moveToBag: (
    productIdOrItemId: string,
    targetVariantId?: string
  ) => Promise<boolean>;
  syncGuestItems: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      productIds: [],
      isLoading: false,
      isAuthenticated: null,
      hasHydrated: false,
      isUpdatingItem: {},

      setHasHydrated: (val: boolean) => set({ hasHydrated: val }),

      hasItem: (
        productIdOrCardId: string,
        color?: string | null,
        variantId?: string | null
      ) => {
        return get().items.some((item) =>
          isWishlistItemMatch(item, productIdOrCardId, color, variantId)
        );
      },

      fetchWishlist: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch("/api/wishlist");
          if (!res.ok) throw new Error("Failed to fetch wishlist");
          const data = await res.json();

          const serverItems: WishlistItemWithProduct[] = data.items || [];
          const serverProductIds: string[] = data.productIds || [];
          const isAuthed = !!data.authenticated;

          set({
            isAuthenticated: isAuthed,
            hasHydrated: true,
          });

          if (isAuthed) {
            // Check if there are local guest items not yet on the server
            const localItems = get().items;
            const unmergedGuestItems = localItems.filter(
              (item) => !serverProductIds.includes(item.productId)
            );

            if (unmergedGuestItems.length > 0) {
              const mergeRes = await fetch("/api/wishlist/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: unmergedGuestItems.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                  })),
                }),
              });

              if (mergeRes.ok) {
                const mergedData = await mergeRes.json();
                set({
                  items: mergedData.items || [],
                  productIds: mergedData.productIds || [],
                  hasHydrated: true,
                });
                return;
              }
            }

            set({
              items: serverItems,
              productIds: serverProductIds,
              hasHydrated: true,
            });
          } else {
            // Guest session: sync productIds with local items
            const currentItems = get().items;
            const currentProductIds = get().productIds;
            const derived = Array.from(
              new Set([
                ...currentProductIds,
                ...currentItems.map((i) => i.productId),
              ])
            );
            set({
              productIds: derived,
              hasHydrated: true,
            });
          }
        } catch (err) {
          console.error("[useWishlistStore] fetchWishlist error:", err);
        } finally {
          set({ isLoading: false, hasHydrated: true });
        }
      },

      syncGuestItems: async () => {
        const { items, isAuthenticated } = get();
        if (!isAuthenticated || items.length === 0) return;

        try {
          const res = await fetch("/api/wishlist/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
              })),
            }),
          });

          if (res.ok) {
            const data = await res.json();
            set({
              items: data.items || [],
              productIds: data.productIds || [],
            });
          }
        } catch (err) {
          console.error("[useWishlistStore] syncGuestItems error:", err);
        }
      },

      toggleWishlist: async (product, variantId) => {
        const { removeItem, items, isAuthenticated } = get();

        const targetColor = product.selectedColor || product.colorName || null;
        const baseProductId = product.parentProductId || product.id;

        // Check if an item matching this card/color is already wishlisted
        const existingItem = items.find((item) =>
          isWishlistItemMatch(item, product.id, targetColor, variantId)
        );

        if (existingItem) {
          return await removeItem(existingItem.id);
        }

        // Optimistically add to wishlist
        const fallbackVariants: WishlistProductVariant[] = (
          product.variants || []
        ).map((v) => ({
          id: v.id,
          sku: "sku" in v && v.sku ? v.sku : v.id,
          size: v.size ?? null,
          color: v.color ?? null,
          price: v.price,
          mrp: "mrp" in v && v.mrp ? v.mrp : v.price,
          isInStock:
            "isInStock" in v && typeof v.isInStock === "boolean"
              ? v.isInStock
              : "isAvailable" in v
                ? v.isAvailable
                : true,
          availableStock:
            "availableStock" in v && typeof v.availableStock === "number"
              ? v.availableStock
              : 10,
        }));

        const selectedVariantObj = variantId
          ? (fallbackVariants.find((v) => v.id === variantId) ?? null)
          : (fallbackVariants[0] ?? null);

        const effectiveVariantId = variantId || selectedVariantObj?.id || null;

        const productPayload: WishlistItemProduct = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          selectedColor: targetColor,
          colorName: targetColor,
          brandName: product.brandName ?? null,
          primaryImage: product.primaryImage ?? null,
          minPrice: product.minPrice ?? "0",
          minMrp: product.minMrp ?? "0",
          isInStock: product.isInStock ?? true,
          ratingAvg: product.ratingAvg ?? "0",
          ratingCount: product.ratingCount ?? 0,
          variants: fallbackVariants,
        };

        const tempId = `local-${product.id}-${Date.now()}`;
        const newItem: WishlistItemWithProduct = {
          id: tempId,
          userId: "guest",
          productId: baseProductId,
          variantId: effectiveVariantId,
          addedAt: new Date().toISOString(),
          product: productPayload,
          selectedVariant: selectedVariantObj,
        };

        const prevItems = [...items];
        const nextItems = [newItem, ...items];
        const nextProductIds = Array.from(
          new Set(nextItems.map((i) => i.productId))
        );

        set({
          items: nextItems,
          productIds: nextProductIds,
        });

        toast.success(
          targetColor
            ? `Saved ${product.name} (${targetColor}) to your wishlist`
            : "Saved to your wishlist",
          {
            action: {
              label: "View Wishlist",
              onClick: () => {
                window.location.href = "/wishlist";
              },
            },
          }
        );

        if (isAuthenticated) {
          try {
            const res = await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: baseProductId,
                variantId: effectiveVariantId,
              }),
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || "Failed to save item");
            }

            const data = await res.json();
            if (data.item?.id) {
              set((state) => ({
                items: state.items.map((i) =>
                  i.id === tempId ? { ...i, id: data.item.id } : i
                ),
              }));
            }
          } catch (err) {
            console.error("[useWishlistStore] toggleWishlist error:", err);
            // Rollback
            set({
              items: prevItems,
              productIds: Array.from(
                new Set(prevItems.map((i) => i.productId))
              ),
            });
            toast.error("Could not save to wishlist");
            return false;
          }
        }

        return true;
      },

      removeItem: async (productIdOrItemId: string) => {
        const { items, isAuthenticated } = get();

        const itemToRemove = items.find(
          (i) => i.id === productIdOrItemId || i.productId === productIdOrItemId
        );

        const targetItemId = itemToRemove?.id || productIdOrItemId;
        const targetProductId = itemToRemove?.productId;
        const targetVariantId = itemToRemove?.variantId;

        const prevItems = [...items];

        const nextItems = items.filter(
          (i) =>
            i.id !== targetItemId &&
            (itemToRemove
              ? i.id !== itemToRemove.id
              : i.productId !== productIdOrItemId)
        );

        set({
          items: nextItems,
          productIds: Array.from(new Set(nextItems.map((i) => i.productId))),
        });

        toast.info("Removed from your wishlist");

        if (isAuthenticated) {
          try {
            const deleteTarget = targetItemId.startsWith("local-")
              ? targetProductId || targetItemId
              : targetItemId;
            const query = targetVariantId
              ? `?variantId=${encodeURIComponent(targetVariantId)}`
              : "";
            const res = await fetch(`/api/wishlist/${deleteTarget}${query}`, {
              method: "DELETE",
            });

            if (!res.ok) {
              throw new Error("Failed to delete from server");
            }
          } catch (err) {
            console.error("[useWishlistStore] removeItem error:", err);
            // Rollback
            set({
              items: prevItems,
              productIds: Array.from(
                new Set(prevItems.map((i) => i.productId))
              ),
            });
            toast.error("Could not remove item from server");
            return false;
          }
        }

        return true;
      },

      moveToBag: async (
        productIdOrItemId: string,
        targetVariantId?: string
      ) => {
        const { items, removeItem } = get();

        const item = items.find(
          (i) => i.id === productIdOrItemId || i.productId === productIdOrItemId
        );

        if (!item) {
          toast.error("Item not found in wishlist");
          return false;
        }

        // Determine variant to add
        let variantIdToAdd = targetVariantId || item.variantId;

        if (!variantIdToAdd) {
          const inStockVariant = item.product.variants.find(
            (v) => v.isInStock && v.availableStock > 0
          );
          if (inStockVariant) {
            variantIdToAdd = inStockVariant.id;
          } else if (item.product.variants.length === 1) {
            variantIdToAdd = item.product.variants[0].id;
          }
        }

        if (!variantIdToAdd) {
          // Can't auto-pick variant, redirect to PDP to select size
          const colorParam = item.product.selectedColor
            ? `?color=${encodeURIComponent(item.product.selectedColor)}`
            : "";
          window.location.href = `/p/${item.product.slug}${colorParam}`;
          return false;
        }

        const success = await useCartStore
          .getState()
          .addItem(variantIdToAdd, 1);

        if (success) {
          await removeItem(item.id);
          toast.success("Moved to your shopping bag");
          return true;
        }

        return false;
      },
    }),
    {
      name: "surekh-wishlist-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        productIds: state.productIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const derived = Array.from(
            new Set([
              ...state.productIds,
              ...state.items.map((i) => i.productId),
            ])
          );
          state.setHasHydrated(true);
          useWishlistStore.setState({ productIds: derived });
        }
      },
    }
  )
);

/**
 * Reactive hook to determine whether a product / color variant is wishlisted.
 * Automatically synchronizes with client storage and server updates,
 * safe from hydration mismatches during server rendering.
 */
export function useIsWishlisted(
  productIdOrCardId: string,
  color?: string | null,
  variantId?: string | null
): boolean {
  return useWishlistStore((state) => {
    if (!state.hasHydrated) return false;
    return state.items.some((item) =>
      isWishlistItemMatch(item, productIdOrCardId, color, variantId)
    );
  });
}
