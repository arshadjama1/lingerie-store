import { cn } from "@/lib/utils";

import type { ProductListItem } from "@/modules/catalog";

import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: ProductListItem[];
  className?: string;
  /** How many above-the-fold items get priority image loading */
  priorityCount?: number;
}

export function ProductGrid({
  products,
  className,
  priorityCount = 4,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
