"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { Address } from "@/db/schema";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

import { AddressSelectionSheet } from "./AddressSelectionSheet";
import { CouponDrawer } from "./CouponDrawer";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface FastCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FastCheckoutModal({ isOpen, onClose }: FastCheckoutModalProps) {
  const router = useRouter();
  const { cart, isLoading: isCartLoading, fetchCart } = useCartStore();

  // Read the globally-initialised auth store so that already-logged-in
  // users are detected instantly without an extra network round-trip.
  const {
    user: globalAuthUser,
    isAuthenticated: globalIsAuthenticated,
    isLoading: globalAuthLoading,
  } = useAuthStore();

  // Auth state -- local mirror of the authenticated user for this modal.
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    phone?: string | null;
    email?: string | null;
  } | null>(null);
  // true while we are still determining auth state on first open
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Addresses
  const [_addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);

  // Coupons
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    name?: string;
  } | null>(null);
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // UI States
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Inline Auth (Phone OTP & Email Magic Link)
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [authPhone, setAuthPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [optInUpdates, setOptInUpdates] = useState(true);

  // Fetch addresses for an already-authenticated user and select the default.
  const loadAddresses = useCallback(async () => {
    try {
      setIsAddressLoading(true);
      const addrRes = await fetch("/api/addresses");
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        const list: Address[] = addrData.addresses || [];
        setAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddress(def);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (err) {
      console.warn("[FastCheckoutModal] loadAddresses error:", err);
    } finally {
      setIsAddressLoading(false);
    }
  }, []);

  // Determine the authenticated user when the modal opens.
  // Priority: server-side profile API -> client SDK fallback.
  const checkAuthAndLoadAddresses = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      let authenticatedUser: {
        id: string;
        phone?: string | null;
        email?: string | null;
      } | null = null;

      // 1. Primary: server-side profile (reads HTTP-only SSR session cookies)
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData?.profile) {
            authenticatedUser = {
              id: profileData.profile.id,
              phone: profileData.profile.phone,
              email: profileData.profile.email,
            };
          }
        }
      } catch (err) {
        console.warn("[FastCheckoutModal] /api/profile check error:", err);
      }

      // 2. Secondary fallback: client SDK
      if (!authenticatedUser) {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            authenticatedUser = {
              id: data.user.id,
              phone: data.user.phone,
              email: data.user.email,
            };
          }
        } catch (err) {
          console.warn("[FastCheckoutModal] supabase.auth.getUser error:", err);
        }
      }

      if (authenticatedUser) {
        setCurrentUser(authenticatedUser);
        await loadAddresses();
      } else {
        setCurrentUser(null);
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error("[FastCheckoutModal] Auth check error:", err);
    } finally {
      setIsAuthLoading(false);
    }
  }, [loadAddresses]);

  // Seed currentUser instantly from the global auth store the moment the
  // modal opens -- eliminates the flash-of-login-form for users who are
  // already signed in, because globalAuthUser is available synchronously.
  useEffect(() => {
    if (!isOpen) return;
    if (globalAuthLoading) return; // wait until global store has resolved

    if (globalIsAuthenticated && globalAuthUser && !currentUser) {
      setCurrentUser({
        id: globalAuthUser.id,
        phone: globalAuthUser.phone ?? null,
        email: globalAuthUser.email ?? null,
      });
      // isAuthLoading stays true until checkAuthAndLoadAddresses finishes
      // so the address skeleton shows instead of the login form.
    }
  }, [
    isOpen,
    globalIsAuthenticated,
    globalAuthUser,
    globalAuthLoading,
    currentUser,
  ]);

  // On open: validate session server-side, load addresses, fetch cart.
  // Also subscribes to auth state changes for magic-link callback support.
  useEffect(() => {
    if (!isOpen) return;

    checkAuthAndLoadAddresses();
    fetchCart();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await checkAuthAndLoadAddresses();
        await fetchCart();
      }
    });

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => console.warn("Razorpay SDK could not load from CDN");
    document.body.appendChild(script);

    return () => {
      subscription.unsubscribe();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isOpen, checkAuthAndLoadAddresses, fetchCart]);

  if (!isOpen) return null;

  // Cart calculations
  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const rawSubtotal = cart?.subtotal || 0;

  // Total discount
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const totalSavings = couponDiscount;

  // Shipping (Free above ₹1,299, promo code, or ₹1 demo test items)
  const isDemoOrder =
    items.length > 0 &&
    items.every(
      (item) =>
        item.variant?.sku?.startsWith("DEMO-") ||
        Number(item.variant?.price ?? 0) <= 1
    );
  const isFreeShipping =
    rawSubtotal >= 1299 || appliedCoupon?.code === "FREESHIP" || isDemoOrder;
  const shippingFee = isFreeShipping ? 0 : 99;

  // Final Payable Total (No GST added per client pricing instructions)
  const finalPayable = Math.max(0, rawSubtotal - couponDiscount + shippingFee);
  const strikeThroughMrp = Math.round(rawSubtotal * 1.35);

  // Apply Coupon Handler
  const handleApplyCoupon = async (codeToApply: string): Promise<boolean> => {
    try {
      setIsApplyingCoupon(true);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToApply,
          cartSubtotal: rawSubtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.error || "Invalid coupon code");
        return false;
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.coupon.discountAmount,
        name: data.coupon.name,
      });
      setCouponCode(data.coupon.code);
      toast.success(`Coupon ${data.coupon.code} applied successfully!`);
      return true;
    } catch {
      toast.error("Failed to apply coupon");
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Inline Phone Auth Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone || authPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: authPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      toast.success("Verification code sent to your phone");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: authPhone,
          otp: otpValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid OTP");
        return;
      }

      const verifiedUser = {
        id: data.user.id,
        phone: data.user.phone ?? null,
        email: data.user.email ?? null,
      };

      // Immediately sync cart store with the merged cart returned by the
      // server -- zero delay before cart items appear in the modal.
      if (data.cart) {
        useCartStore.setState({ cart: data.cart, isLoading: false });
      }

      // Update local auth state instantly -- no round-trip to /api/profile
      // needed because the server validated the OTP and returned the user.
      setCurrentUser(verifiedUser);
      setIsAuthLoading(false);

      // Sync the GLOBAL auth store immediately so the header dropdown and
      // any other consumer of useAuthStore reflects the signed-in state
      // right away, rather than waiting 8-10s for onAuthStateChange to fire
      // (which is delayed because the session is set via server cookies,
      // not through the Supabase client SDK in-memory session).
      useAuthStore.setState({
        user: verifiedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      // Re-fetch full profile in background to populate firstName/lastName
      // for the header UserDropdown -- non-blocking.
      useAuthStore
        .getState()
        .fetchUser()
        .catch(() => {});

      toast.success("Logged in successfully!");
      setOtpSent(false);

      // Fetch addresses in the background (non-blocking).
      loadAddresses().catch(() => {});
    } catch {
      toast.error("Failed to verify OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Inline Email Magic Link Handler
  const handleSendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSendingMagicLink(true);
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          redirectTo: "/checkout",
          cartSession: cart?.sessionId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send magic link");
        return;
      }

      setMagicLinkSent(true);
      toast.success("Magic sign-in link sent to your email!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  // Payment Execution (Razorpay)
  const handlePayment = async () => {
    if (!currentUser) {
      toast.error("Please log in with your mobile number or email to continue");
      return;
    }

    if (!selectedAddress) {
      setIsAddressSheetOpen(true);
      toast.error("Please select a delivery address");
      return;
    }

    if (!cart || items.length === 0) {
      toast.error("Your shopping bag is empty");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // 1. Create or retrieve checkout session
      const sessionRes = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          addressId: selectedAddress.id,
          couponCode: appliedCoupon?.code,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        toast.error(sessionData.error || "Failed to initiate checkout session");
        setIsProcessingPayment(false);
        return;
      }

      const sessionId = sessionData.session.id;

      // 2. Create Razorpay order
      const orderRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutSessionId: sessionId }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error || "Failed to initiate payment gateway");
        setIsProcessingPayment(false);
        return;
      }

      // 3. Configure Razorpay Standard Modal
      if (!window.Razorpay) {
        toast.error("Payment SDK is loading, please try in a moment");
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Surekh.",
        description: `Order Checkout (${itemCount} items) • 100% Discreet Packaging`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: selectedAddress.fullName,
          contact: selectedAddress.phone,
        },
        theme: {
          color: "#c83c7e", // Surekh Clovia Fuchsia Accent
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/checkout/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                checkoutSessionId: sessionId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              toast.error(verifyData.error || "Payment verification failed");
              setIsProcessingPayment(false);
              return;
            }

            toast.success("Order placed successfully! Redirecting...");
            onClose();
            router.push(`/order-success/${verifyData.orderId}`);
          } catch {
            toast.error("Payment verification failed");
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.info("Payment window closed. Your cart is preserved.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("[FastCheckoutModal] Payment error:", err);
      toast.error("Payment initialization error");
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
        {/* Backdrop matching Wellbeing / GoKwik reference */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300">
          {/* ── Top Bar: Back • Logo • 100% Secured Payment ──────── */}
          <div className="flex items-center justify-between border-b border-neutral-100 bg-white px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-neutral-600 hover:bg-neutral-100 hover:text-black"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Centered Brand Mark */}
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-neutral-900">
                Surekh<span className="text-[var(--accent)]">.</span>
              </span>
            </div>

            {/* 100% Secured Payment Badge */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
              <span>100% Secured Payment</span>
              <Lock className="h-3.5 w-3.5 text-neutral-800" />
            </div>
          </div>

          {/* ── Top Reassurance Ribbon ─────────────────────────── */}
          <div className="bg-neutral-900 px-4 py-2 text-center text-xs font-semibold text-white">
            📦 100% Discreet Packaging | 🔒 256-Bit SSL Secured Checkout
          </div>

          {/* ── Scrollable Body ──────────────────────────────────── */}
          {isCartLoading && items.length === 0 ? (
            /* Cart is loading -- show skeleton to prevent "bag empty" flash */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
              <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-100" />
              <div className="h-3 w-32 animate-pulse rounded-full bg-neutral-100" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-100" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold text-neutral-900">
                Your shopping bag is empty
              </h3>
              <p className="mt-1 max-w-xs text-xs text-neutral-500">
                Add some luxury intimates to proceed with fast 1-click checkout.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-2xl bg-black px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-neutral-800"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {/* ── 1. DELIVERY ADDRESS ─────────────────────────────── */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                  1. Delivery Address
                </h3>

                {isAuthLoading && !currentUser ? (
                  /* Resolving auth -- show skeleton instead of login form */
                  <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded-full bg-neutral-100" />
                        <div className="h-3 w-48 rounded-full bg-neutral-100" />
                        <div className="h-3 w-40 rounded-full bg-neutral-100" />
                      </div>
                    </div>
                  </div>
                ) : currentUser ? (
                  /* Authenticated: Selected Delivery Address Card */
                  <div className="relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                    {isAddressLoading ? (
                      /* Fetching addresses -- show skeleton card */
                      <div className="animate-pulse space-y-2 py-1">
                        <div className="flex items-start gap-3">
                          <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-100" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-40 rounded-full bg-neutral-100" />
                            <div className="h-3 w-56 rounded-full bg-neutral-100" />
                          </div>
                        </div>
                      </div>
                    ) : selectedAddress ? (
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-neutral-900">
                                  Deliver To {selectedAddress.fullName}
                                </span>
                                <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  Tap To Edit Address
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-neutral-600">
                                {selectedAddress.line1}
                                {selectedAddress.line2
                                  ? `, ${selectedAddress.line2}`
                                  : ""}
                                , {selectedAddress.city},{" "}
                                {selectedAddress.state} -{" "}
                                {selectedAddress.pincode}
                              </p>
                              <p className="mt-1 text-[11px] text-neutral-500">
                                +91 {selectedAddress.phone}{" "}
                                {currentUser.email && `| ${currentUser.email}`}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsAddressSheetOpen(true)}
                            className="shrink-0 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                          >
                            Change
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5 text-xs">
                          <div
                            className={`flex items-center gap-1.5 ${
                              isFreeShipping
                                ? "text-emerald-700"
                                : "text-neutral-700"
                            }`}
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span className="font-semibold">
                              {isFreeShipping
                                ? "Free Shipping: FREE"
                                : `Discreet Delivery: ₹${shippingFee}`}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            Est. 2-5 business days
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* User is logged in but has no saved address */
                      <div className="py-2 text-center">
                        <p className="text-xs text-neutral-600">
                          No delivery address found.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsAddressSheetOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white"
                        >
                          + Add Delivery Address
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Unauthenticated: Inline Phone / Email Auth Card */
                  <div className="space-y-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-900">
                        <User className="h-4 w-4" />
                        <span className="text-xs font-bold">
                          Login to continue
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-amber-800/80">
                        Fast 1-Click Checkout
                      </span>
                    </div>

                    {/* Auth Method Tabs: Mobile OTP vs Email Magic Link */}
                    <div className="flex rounded-xl bg-amber-100/70 p-1 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod("phone");
                        }}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-all ${
                          authMethod === "phone"
                            ? "bg-white font-bold text-neutral-900 shadow-xs"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Mobile OTP</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod("email");
                        }}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-all ${
                          authMethod === "email"
                            ? "bg-white font-bold text-neutral-900 shadow-xs"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email Link</span>
                      </button>
                    </div>

                    {authMethod === "phone" ? (
                      /* Mobile OTP Auth Form */
                      !otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-medium text-neutral-600">
                              Enter Mobile Number
                            </label>
                            <div className="mt-1 flex rounded-xl border border-neutral-300 bg-white focus-within:border-[var(--accent)]">
                              <span className="flex items-center border-r border-neutral-200 px-3 text-xs font-bold text-neutral-600">
                                +91
                              </span>
                              <input
                                type="tel"
                                required
                                maxLength={10}
                                value={authPhone}
                                onChange={(e) =>
                                  setAuthPhone(
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 10)
                                  )
                                }
                                placeholder="79924 80412"
                                className="w-full px-3 py-2.5 text-sm font-medium focus:outline-none"
                              />
                            </div>
                          </div>

                          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral-600">
                            <input
                              type="checkbox"
                              checked={optInUpdates}
                              onChange={(e) =>
                                setOptInUpdates(e.target.checked)
                              }
                              className="rounded accent-neutral-900"
                            />
                            <span>
                              Send me order updates & offers - (no spam)
                            </span>
                          </label>

                          <button
                            type="submit"
                            disabled={isSendingOtp || authPhone.length < 10}
                            className="w-full rounded-2xl bg-black py-3 text-xs font-bold tracking-wider text-white uppercase hover:bg-neutral-800 disabled:opacity-50"
                          >
                            {isSendingOtp
                              ? "Sending OTP..."
                              : "Continue with OTP"}
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-medium text-neutral-600">
                              Enter 6-digit OTP sent to +91 {authPhone}
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={otpValue}
                              onChange={(e) =>
                                setOtpValue(
                                  e.target.value.replace(/\D/g, "").slice(0, 6)
                                )
                              }
                              placeholder="123456"
                              className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-center font-mono text-base font-bold tracking-widest focus:border-[var(--accent)] focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setOtpSent(false)}
                              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600"
                            >
                              Change Number
                            </button>
                            <button
                              type="submit"
                              disabled={isVerifyingOtp || otpValue.length < 6}
                              className="flex-1 rounded-xl bg-black py-2.5 text-xs font-bold tracking-wider text-white uppercase disabled:opacity-50"
                            >
                              {isVerifyingOtp
                                ? "Verifying..."
                                : "Verify & Continue"}
                            </button>
                          </div>
                        </form>
                      )
                    ) : /* Email Magic Link Auth Form */
                    !magicLinkSent ? (
                      <form
                        onSubmit={handleSendMagicLink}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Enter Email Address
                          </label>
                          <div className="mt-1 flex rounded-xl border border-neutral-300 bg-white focus-within:border-[var(--accent)]">
                            <span className="flex items-center pl-3 text-neutral-400">
                              <Mail className="h-4 w-4" />
                            </span>
                            <input
                              type="email"
                              required
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="w-full px-3 py-2.5 text-sm font-medium focus:outline-none"
                            />
                          </div>
                          <p className="mt-1 text-[10px] text-neutral-500">
                            We&apos;ll send an instant passwordless sign-in link
                            to your inbox.
                          </p>
                        </div>

                        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral-600">
                          <input
                            type="checkbox"
                            checked={optInUpdates}
                            onChange={(e) => setOptInUpdates(e.target.checked)}
                            className="rounded accent-neutral-900"
                          />
                          <span>
                            Send me order updates & offers - (no spam)
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={isSendingMagicLink || !authEmail.trim()}
                          className="w-full rounded-2xl bg-black py-3 text-xs font-bold tracking-wider text-white uppercase hover:bg-neutral-800 disabled:opacity-50"
                        >
                          {isSendingMagicLink
                            ? "Sending Magic Link..."
                            : "Send Magic Link"}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <div className="space-y-1">
                            <p className="font-bold text-emerald-900">
                              Magic Link Sent!
                            </p>
                            <p className="text-[11px] leading-relaxed text-emerald-800">
                              We sent a secure sign-in link to{" "}
                              <strong className="font-bold text-neutral-900">
                                {authEmail}
                              </strong>
                              . Click the link in your email to log in and
                              return directly to checkout.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-t border-emerald-200/60 pt-2.5">
                          <button
                            type="button"
                            onClick={() => setMagicLinkSent(false)}
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50"
                          >
                            Change Email
                          </button>
                          <button
                            type="button"
                            disabled={isSendingMagicLink}
                            onClick={() => handleSendMagicLink()}
                            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                          >
                            {isSendingMagicLink
                              ? "Resending..."
                              : "Resend Link"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 2. OFFERS & REWARDS ────────────────────────────── */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                  2. Offers & Rewards
                </h3>

                <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>
                          {appliedCoupon.code} applied (Saved ₹
                          {appliedCoupon.discountAmount.toLocaleString("en-IN")}
                          )
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter coupon code"
                        className="flex-1 rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-medium uppercase placeholder:font-normal placeholder:text-neutral-400 placeholder:normal-case focus:border-[var(--accent)] focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!couponCode.trim() || isApplyingCoupon}
                        onClick={() => handleApplyCoupon(couponCode.trim())}
                        className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white uppercase hover:bg-black disabled:opacity-50"
                      >
                        {isApplyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
                      <Tag className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <span>View all available offers</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCouponDrawerOpen(true)}
                      className="text-xs font-bold text-[var(--accent)] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>

              {/* ── 3. ORDER SUMMARY ────────────────────────────────── */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                  3. Order Summary
                </h3>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/70">
                  <button
                    type="button"
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-neutral-100/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-xs">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-900">
                            Order Summary
                          </span>
                          <span className="text-xs text-neutral-500">
                            ({itemCount} {itemCount === 1 ? "item" : "items"})
                          </span>
                        </div>
                        {totalSavings > 0 && (
                          <div className="mt-0.5 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            ₹{totalSavings.toLocaleString("en-IN")} saved so far
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        {strikeThroughMrp > finalPayable && (
                          <span className="mr-1.5 text-xs text-neutral-400 line-through">
                            ₹{strikeThroughMrp.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="text-sm font-extrabold text-neutral-900">
                          ₹{finalPayable.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {isSummaryExpanded ? (
                        <ChevronUp className="h-4 w-4 text-neutral-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Item List & Breakdown */}
                  {isSummaryExpanded && (
                    <div className="border-t border-neutral-200 bg-white p-4">
                      {/* Item list */}
                      <div className="max-h-48 divide-y divide-neutral-100 overflow-y-auto">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 py-2.5"
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                              {item.variant.product.images?.[0]?.url ? (
                                <Image
                                  src={item.variant.product.images[0].url}
                                  alt={item.variant.product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                  <Package className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-xs font-semibold text-neutral-900">
                                {item.variant.product.name}
                              </h4>
                              <p className="text-[11px] text-neutral-500">
                                Size: {item.variant.size || "Free"} • Qty:{" "}
                                {item.quantity}
                              </p>
                            </div>
                            <div className="text-right text-xs font-bold text-neutral-900">
                              ₹
                              {(
                                Number(item.variant.price) * item.quantity
                              ).toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Breakdown table */}
                      <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                        <div className="flex justify-between">
                          <span>Items Subtotal</span>
                          <span>{formatPrice(rawSubtotal)}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between font-medium text-emerald-600">
                            <span>Coupon Discount ({appliedCoupon?.code})</span>
                            <span>
                              -₹{couponDiscount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Discreet Delivery</span>
                          {isFreeShipping ? (
                            <span className="font-semibold text-emerald-600">
                              FREE
                            </span>
                          ) : (
                            <span>₹{shippingFee}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discreet Packaging Assurance Box */}
                <div className="flex items-center gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-xs text-neutral-600">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-200 text-neutral-700">
                    <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900">
                      100% Discreet Packaging Guaranteed
                    </span>
                    <p className="text-[11px] text-neutral-500">
                      Plain unmarked box. Sender listed as Surekh Logistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Modal Footer: Primary CTA Button ──────────────────── */}
          {!isCartLoading && items.length > 0 && (
            <div className="border-t border-neutral-200 bg-white p-4 shadow-lg sm:p-5">
              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessingPayment || !isRazorpayLoaded}
                className="group relative flex w-full items-center justify-between rounded-2xl bg-black px-6 py-3.5 font-bold text-white shadow-xl transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm tracking-wider uppercase">
                    {isProcessingPayment
                      ? "Processing Payment..."
                      : currentUser
                        ? `Pay ₹${finalPayable.toLocaleString("en-IN")}`
                        : `Login & Pay ₹${finalPayable.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <span>UPI • Cards • NetBanking</span>
                  <Lock className="h-3.5 w-3.5" />
                </div>
              </button>

              <p className="mt-2 text-center text-[10px] text-neutral-400">
                🔒 Safe & Secure 256-Bit SSL Encrypted Razorpay Checkout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Address Switcher Sheet */}
      <AddressSelectionSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        selectedAddressId={selectedAddress?.id || null}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
      />

      {/* Coupon Drawer */}
      <CouponDrawer
        isOpen={isCouponDrawerOpen}
        onClose={() => setIsCouponDrawerOpen(false)}
        subtotal={rawSubtotal}
        appliedCouponCode={appliedCoupon?.code || null}
        onApplyCoupon={handleApplyCoupon}
      />
    </>
  );
}
