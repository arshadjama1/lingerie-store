import type {
  Cart,
  CartItem,
  Product,
  ProductImage,
  ProductVariant,
} from "@/db/schema";

export interface CartItemWithVariant extends CartItem {
  variant: ProductVariant & {
    product: Product & {
      images: ProductImage[];
    };
    inventory: {
      quantity: number;
      reservedQuantity: number;
    } | null;
  };
}

export interface HydratedCart extends Cart {
  items: CartItemWithVariant[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartInput {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}
