import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
  addresses,
  brands,
  cartItems,
  carts,
  categories,
  checkoutSessions,
  couponUsage,
  coupons,
  inventory,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  productImages,
  productVariants,
  products,
  profiles,
  returnRequests,
  reviews,
  wishlistItems,
} from "./schema";

// ─── ENUM TYPES ───────────────────────────────────────────────────────────────

export type UserRole = "customer" | "staff" | "admin";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "pending" | "captured" | "failed" | "refunded";
export type CouponType = "percentage" | "fixed_amount" | "free_shipping";
export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "picked_up"
  | "refunded";

// ─── SELECT TYPES (Read) ──────────────────────────────────────────────────────

export type Profile = InferSelectModel<typeof profiles>;
export type Address = InferSelectModel<typeof addresses>;
export type Category = InferSelectModel<typeof categories>;
export type Brand = InferSelectModel<typeof brands>;
export type Product = InferSelectModel<typeof products>;
export type ProductImage = InferSelectModel<typeof productImages>;
export type ProductVariant = InferSelectModel<typeof productVariants>;
export type Inventory = InferSelectModel<typeof inventory>;
export type Coupon = InferSelectModel<typeof coupons>;
export type Cart = InferSelectModel<typeof carts>;
export type CartItem = InferSelectModel<typeof cartItems>;
export type CheckoutSession = InferSelectModel<typeof checkoutSessions>;
export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type OrderStatusHistory = InferSelectModel<typeof orderStatusHistory>;
export type Payment = InferSelectModel<typeof payments>;
export type CouponUsage = InferSelectModel<typeof couponUsage>;
export type Review = InferSelectModel<typeof reviews>;
export type WishlistItem = InferSelectModel<typeof wishlistItems>;
export type ReturnRequest = InferSelectModel<typeof returnRequests>;

// ─── INSERT TYPES (Create) ────────────────────────────────────────────────────

export type NewProfile = InferInsertModel<typeof profiles>;
export type NewAddress = InferInsertModel<typeof addresses>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewBrand = InferInsertModel<typeof brands>;
export type NewProduct = InferInsertModel<typeof products>;
export type NewProductImage = InferInsertModel<typeof productImages>;
export type NewProductVariant = InferInsertModel<typeof productVariants>;
export type NewInventory = InferInsertModel<typeof inventory>;
export type NewCoupon = InferInsertModel<typeof coupons>;
export type NewCart = InferInsertModel<typeof carts>;
export type NewCartItem = InferInsertModel<typeof cartItems>;
export type NewCheckoutSession = InferInsertModel<typeof checkoutSessions>;
export type NewOrder = InferInsertModel<typeof orders>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;
export type NewOrderStatusHistory = InferInsertModel<typeof orderStatusHistory>;
export type NewPayment = InferInsertModel<typeof payments>;
export type NewCouponUsage = InferInsertModel<typeof couponUsage>;
export type NewReview = InferInsertModel<typeof reviews>;
export type NewWishlistItem = InferInsertModel<typeof wishlistItems>;
export type NewReturnRequest = InferInsertModel<typeof returnRequests>;

// ─── COMPLEX TYPES ────────────────────────────────────────────────────────────

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ProductSnapshot {
  productName: string;
  sku: string;
  size?: string;
  color?: string;
  imageUrl?: string;
}

export interface CartWithItems extends Cart {
  items: CartItem[];
  coupon?: Coupon | null;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  payment?: Payment;
  statusHistory: OrderStatusHistory[];
  user: Profile;
}

export interface ProductWithDetails extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  brand?: Brand | null;
  category: Category;
  reviews: Review[];
}

export interface CheckoutData {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  couponCode?: string;
  couponId?: string;
}
