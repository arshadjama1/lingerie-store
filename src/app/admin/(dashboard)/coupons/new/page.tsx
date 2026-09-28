"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import type { CreateCouponInput } from "@/modules/coupons";

// Local form schema: no .default() so react-hook-form types are unambiguous.
// perUserLimit is always 1 (added back before submit) — not shown in the form.
const formSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  name: z.string().max(255).optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Must be positive"),
  minOrderValue: z.number().min(0),
  maxDiscount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: z.string().min(1, "Start date is required"),
  expiresAt: z.string().optional(),
  isFirstOrderOnly: z.boolean(),
  applicableCategoryId: z.string().optional(),
  minItemCount: z.number().int().min(1).optional(),
  bundleProductIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

export default function NewCouponPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "percentage",
      minOrderValue: 0,
      isFirstOrderOnly: false,
    },
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("applicableCategoryId");

  // Fetch categories for the applicable category dropdown
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.categories)) setCategories(data.categories);
      })
      .catch(() => {
        // Non-critical — dropdown stays empty
      });
  }, []);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setServerError(null);

    // Reconstruct the full CreateCouponInput with perUserLimit fixed at 1
    const payload: CreateCouponInput = {
      ...values,
      perUserLimit: 1,
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Failed to create coupon");
        return;
      }

      router.push("/admin/coupons");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const labelCls =
    "block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1";
  const inputCls =
    "w-full rounded-none border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none";
  const errorCls = "mt-1 text-xs text-rose-600";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
        <p className="mt-1 text-sm text-gray-500">
          New coupons are active immediately after creation.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-none border border-gray-200 bg-white p-6"
      >
        {/* Code & Name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Code *</label>
            <input
              {...register("code")}
              placeholder="e.g. SUREKH20"
              className={`${inputCls} font-mono uppercase`}
              onChange={(e) =>
                setValue("code", e.target.value.toUpperCase(), {
                  shouldValidate: true,
                })
              }
            />
            {errors.code && <p className={errorCls}>{errors.code.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Internal Label</label>
            <input
              {...register("name")}
              placeholder="e.g. Summer Sale 20%"
              className={inputCls}
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className={labelCls}>Discount Type *</label>
          <div className="flex gap-4">
            {(["percentage", "fixed"] as const).map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  value={t}
                  {...register("type")}
                  className="accent-[#3d0a20]"
                />
                <span>{t === "fixed" ? "Fixed (₹)" : "Percentage (%)"}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Value + Max Discount */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              Value * {selectedType === "percentage" ? "(%)" : "(₹)"}
            </label>
            <input
              {...register("value", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0.01"
              placeholder={selectedType === "percentage" ? "10" : "100"}
              className={inputCls}
            />
            {errors.value && <p className={errorCls}>{errors.value.message}</p>}
          </div>

          {selectedType === "percentage" && (
            <div>
              <label className={labelCls}>Max Discount (₹)</label>
              <input
                {...register("maxDiscount", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="200"
                className={inputCls}
              />
              {errors.maxDiscount && (
                <p className={errorCls}>{errors.maxDiscount.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Min Order + Max Uses */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Min Order Value (₹)</label>
            <input
              {...register("minOrderValue", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Max Uses (Total)</label>
            <input
              {...register("maxUses", { valueAsNumber: true })}
              type="number"
              step="1"
              min="1"
              placeholder="Unlimited"
              className={inputCls}
            />
          </div>
        </div>

        {/* Start / Expiry */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Starts At *</label>
            <input
              {...register("startsAt")}
              type="datetime-local"
              className={inputCls}
            />
            {errors.startsAt && (
              <p className={errorCls}>{errors.startsAt.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Expires At</label>
            <input
              {...register("expiresAt")}
              type="datetime-local"
              className={inputCls}
            />
          </div>
        </div>

        {/* First Order Only */}
        <div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("isFirstOrderOnly")}
              className="h-4 w-4 accent-[#3d0a20]"
            />
            <div>
              <span className="text-sm font-semibold text-gray-800">
                First Order Only
              </span>
              <p className="text-xs text-gray-500">
                Only users with zero previous orders can apply this coupon.
              </p>
            </div>
          </label>
        </div>

        {/* Category Restriction */}
        <div className="space-y-3 rounded-none border border-dashed border-gray-200 p-4">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Category Restriction (Optional)
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Applicable Category</label>
              <select
                {...register("applicableCategoryId")}
                className={inputCls}
              >
                <option value="">Any category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedCategoryId && (
              <div>
                <label className={labelCls}>Min Item Count</label>
                <input
                  {...register("minItemCount", { valueAsNumber: true })}
                  type="number"
                  step="1"
                  min="1"
                  placeholder="2"
                  className={inputCls}
                />
                {errors.minItemCount && (
                  <p className={errorCls}>{errors.minItemCount.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bundle Product IDs */}
        <div className="rounded-none border border-dashed border-gray-200 p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Bundle Rule (Optional)
          </p>
          <label className={labelCls}>Required Product IDs</label>
          <textarea
            {...register("bundleProductIds", {
              setValueAs: (v: string) =>
                v
                  ? v
                      .split(/[\n,]+/)
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  : undefined,
            })}
            rows={3}
            placeholder={
              "Enter product IDs, one per line:\ncld_abc123\ncld_def456"
            }
            className={`${inputCls} font-mono text-xs`}
          />
          <p className="mt-1 text-xs text-gray-400">
            All listed products must be in the cart for the coupon to apply.
          </p>
        </div>

        {serverError && (
          <div className="rounded-none border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {serverError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/coupons")}
            className="rounded-none border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-none bg-[#3d0a20] px-6 py-2 text-sm font-semibold text-white hover:bg-[#5c1130] disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Coupon
          </button>
        </div>
      </form>
    </div>
  );
}
