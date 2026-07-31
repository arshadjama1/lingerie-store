"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStore } from "@/stores/useCartStore";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/utils";

import type { CartItemWithVariant } from "@/modules/cart/types";

interface CartItemCardProps {
  item: CartItemWithVariant;
  onCloseDrawer?: () => void;
}

export function CartItemCard({ item, onCloseDrawer }: CartItemCardProps) {
  const { updateQuantity, removeItem, isUpdatingItem } = useCartStore();
  const isUpdating = isUpdatingItem[item.id] || false;

  const variant = item.variant;
  const product = variant?.product;

  const primaryImage =
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    "/placeholder.jpg";

  const itemPrice = Number(variant?.price ?? item.priceAtAddition ?? 0);
  const mrp = Number(variant?.mrp ?? itemPrice);
  const hasDiscount = mrp > itemPrice;

  const availableStock = variant?.inventory
    ? variant.inventory.quantity - variant.inventory.reservedQuantity
    : 0;

  const handleDecrease = () => {
    if (isUpdating) return;
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  const handleIncrease = () => {
    if (isUpdating) return;
    if (item.quantity < availableStock) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  return (
    <div className="border-border/60 group flex gap-4 border-b py-4 last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/p/${product?.slug || ""}`}
        onClick={onCloseDrawer}
        className="bg-muted border-border/40 relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border"
      >
        <Image
          src={primaryImage}
          alt={product?.name || "Lingerie item"}
          fill
          sizes="80px"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/p/${product?.slug || ""}`}
              onClick={onCloseDrawer}
              className="text-foreground hover:text-primary line-clamp-1 text-sm font-medium transition-colors"
            >
              {product?.name || "Product"}
            </Link>

            <button
              onClick={() => removeItem(item.id)}
              disabled={isUpdating}
              className="text-muted-foreground hover:text-destructive -mr-1 rounded-sm p-1 transition-colors"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Variants (Size / Color) */}
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
            {variant?.size && (
              <span className="bg-secondary text-secondary-foreground rounded px-2 py-0.5 font-medium">
                Size: {variant.size}
              </span>
            )}
            {variant?.color && (
              <span className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded px-2 py-0.5">
                {variant.colorHex && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: variant.colorHex }}
                  />
                )}
                {variant.color}
              </span>
            )}
          </div>
        </div>

        {/* Price & Quantity Controls */}
        <div className="mt-3 flex items-center justify-between">
          <div className="border-input bg-background flex items-center gap-1.5 rounded-md border px-1 py-0.5">
            <button
              onClick={handleDecrease}
              disabled={isUpdating}
              className="hover:bg-accent text-foreground rounded p-1 transition-colors disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>

            <span className="w-6 text-center text-xs font-semibold">
              {isUpdating ? (
                <Loader2 className="text-primary mx-auto h-3 w-3 animate-spin" />
              ) : (
                item.quantity
              )}
            </span>

            <button
              onClick={handleIncrease}
              disabled={isUpdating || item.quantity >= availableStock}
              className="hover:bg-accent text-foreground rounded p-1 transition-colors disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-foreground text-sm font-bold">
              {formatPrice(itemPrice * item.quantity)}
            </span>
            {hasDiscount && (
              <div className="text-muted-foreground text-[10px] line-through">
                {formatPrice(mrp * item.quantity)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
