"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import type { HydratedCheckoutSession } from "@/modules/checkout/types";

interface PaymentStepProps {
  session: HydratedCheckoutSession;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function PaymentStep({ session }: PaymentStepProps) {
  const router = useRouter();
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay Standard Checkout SDK dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsSdkLoaded(true);
    script.onerror = () => toast.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!isSdkLoaded) {
      toast.error("Payment SDK loading... Please try in a moment.");
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Get Razorpay Order ID from backend
      const res = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutSessionId: session.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to initiate payment");
        setIsProcessing(false);
        return;
      }

      // 2. Configure Razorpay Standard Checkout modal options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "LINGE.",
        description: `Order Checkout (${session.lineItems.length} items)`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: session.address.fullName,
          contact: session.address.phone,
        },
        theme: {
          color: "#e11d48", // rose-600
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            // 3. Verify Payment Signature & Complete Order
            const verifyRes = await fetch("/api/checkout/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                checkoutSessionId: session.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              toast.error(verifyData.error || "Payment verification failed");
              setIsProcessing(false);
              return;
            }

            toast.success("Payment successful! Redirecting to confirmation...");
            router.push(`/order-success/${verifyData.orderId}`);
          } catch (err) {
            console.error("[PaymentStep] Verification error:", err);
            toast.error("Payment verification failed");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info("Payment process cancelled.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("[PaymentStep] Payment error:", err);
      toast.error("Payment processing error");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        3. Payment Method
      </h2>

      <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50/40 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">
              Razorpay Secure Checkout
            </h3>
            <p className="text-xs text-neutral-600">
              UPI, Credit/Debit Cards, NetBanking, Wallets & EMI supported
            </p>
          </div>
        </div>

        <div className="flex justify-between border-t border-rose-100 pt-3 text-sm font-bold text-neutral-900">
          <span>Amount to Pay:</span>
          <span className="text-lg text-rose-600">
            ₹{session.total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>256-Bit SSL Encryption</span>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={!isSdkLoaded || isProcessing}
          className="rounded-xl bg-rose-600 px-8 py-3.5 font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50"
        >
          {isProcessing
            ? "Processing..."
            : `Pay ₹${session.total.toLocaleString("en-IN")}`}
        </button>
      </div>
    </div>
  );
}
