"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Globe,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { calcDiscount, slugify } from "@/lib/utils";

const variantSchema = z
  .object({
    id: z.string().optional(),
    sku: z.string().min(1, "SKU is required"),
    size: z.string().min(1, "Size is required"),
    colorName: z.string().min(1, "Color name is required"),
    colorHex: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex code (e.g. #000000)"),
    price: z.coerce.number().min(0, "Price must be ≥ 0"),
    mrp: z.coerce.number().min(0, "MRP must be ≥ 0"),
    weightInGrams: z.coerce.number().min(0).optional(),
    stockQuantity: z.coerce.number().int().min(0, "Stock must be ≥ 0"),
    lowStockAlert: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.price <= data.mrp, {
    message: "Price cannot exceed MRP",
    path: ["price"],
  });

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1),
  storagePath: z.string().nullable().optional(),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug may only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  brandId: z.string().optional(),
  hsnCode: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  images: z.array(imageSchema),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface CategoryOption {
  id: string;
  name: string;
  path?: string;
}

interface BrandOption {
  id: string;
  name: string;
}

interface AdminProductFormProps {
  mode: "create" | "edit";
  initialData?: Record<string, unknown> & {
    id?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  categories: CategoryOption[];
  brands: BrandOption[];
}

const inputCls =
  "w-full rounded-none border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none transition-colors";
const labelCls =
  "block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5";

export function AdminProductForm({
  mode,
  initialData,
  categories,
  brands,
}: AdminProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState<string[]>(() => {
    if (typeof initialData?.tags === "string" && initialData.tags) {
      return initialData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (Array.isArray(initialData?.tags)) {
      return initialData.tags as string[];
    }
    return [];
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: (initialData as unknown as ProductFormValues) || {
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      brandId: "",
      hsnCode: "",
      tags: "",
      isActive: true,
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
      variants: [
        {
          sku: "",
          size: "",
          colorName: "Black",
          colorHex: "#000000",
          price: 0,
          mrp: 0,
          weightInGrams: 100,
          stockQuantity: 10,
          lowStockAlert: 5,
          isActive: true,
        },
      ],
      images: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  const watchName = watch("name");
  const watchSlug = watch("slug");
  const watchVariants = watch("variants");
  const watchIsActive = watch("isActive");
  const watchMetaTitle = watch("metaTitle");
  const watchMetaDesc = watch("metaDescription");

  // Keep hidden tags field updated with tagList
  useEffect(() => {
    setValue("tags", tagList.join(", "));
  }, [tagList, setValue]);

  const onNameBlur = () => {
    if (watchName && !watchSlug) {
      setValue("slug", slugify(watchName), { shouldValidate: true });
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,+|,+$/g, "");
      if (val && !tagList.includes(val)) {
        setTagList([...tagList, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagList(tagList.filter((t) => t !== tagToRemove));
  };

  const handleAutoGenerateSkus = () => {
    const baseSlug = watchSlug || slugify(watchName || "PROD");
    const updatedVariants = (watchVariants || []).map((v) => {
      const sizeClean = (v.size || "STD").toUpperCase().replace(/\s+/g, "");
      const colorClean = (v.colorName || "COLOR")
        .toUpperCase()
        .replace(/\s+/g, "");
      const generatedSku = `${baseSlug.toUpperCase().slice(0, 10)}-${colorClean.slice(0, 4)}-${sizeClean}`;
      return {
        ...v,
        sku: v.sku?.trim() ? v.sku : generatedSku,
      };
    });
    setValue("variants", updatedVariants, { shouldValidate: true });
    toast.success("Generated SKUs for variants with missing SKU");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const productId = initialData?.id || "temp";

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId as string);

        const res = await fetch("/api/admin/products/images/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        appendImage({
          url: data.url,
          storagePath: data.storagePath,
          altText: watchName || "",
          isPrimary: imageFields.length === 0 && i === 0,
          sortOrder: imageFields.length + i,
        });
      }
      toast.success("Image(s) uploaded successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to upload images";
      toast.error(message);
    } finally {
      setUploadingImages(false);
      if (e.target) e.target.value = "";
    }
  };

  const setPrimaryImage = (index: number) => {
    const images = watch("images") || [];
    images.forEach((_, i) => {
      setValue(`images.${i}.isPrimary`, i === index);
    });
    toast.success("Cover image updated");
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        tags: tagList,
        metaDesc: data.metaDescription || null,
        metaTitle: data.metaTitle || null,
        variants: data.variants.map((v, idx) => ({
          ...v,
          id: v.id || undefined,
          color: v.colorName,
          weightGrams: v.weightInGrams ?? 100,
          stock: v.stockQuantity,
          lowStockAlert: v.lowStockAlert ?? 5,
          sortOrder: idx,
        })),
        images: data.images.map((img, idx) => ({
          ...img,
          id: img.id || undefined,
          alt: img.altText || null,
          sortOrder: idx,
        })),
      };

      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save product");
      }

      toast.success(
        mode === "create"
          ? "Product created successfully!"
          : "Product updated successfully!"
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex h-8 w-8 items-center justify-center border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-900"
            title="Back to products list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">
                {mode === "create"
                  ? "New Product"
                  : watchName || "Edit Product"}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                  watchIsActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-gray-100 text-gray-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    watchIsActive ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                {watchIsActive ? "Active" : "Draft"}
              </span>
            </div>
            {watchSlug && (
              <p className="font-mono text-xs text-gray-400">/p/{watchSlug}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === "edit" && watchSlug && (
            <Link
              href={`/p/${watchSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
              title="Preview on storefront"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View in Store</span>
            </Link>
          )}

          <Link
            href="/admin/products"
            className="border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className="inline-flex items-center gap-2 border border-[#3d0a20] bg-[#3d0a20] px-5 py-2 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-[#5c1130] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>
                  {mode === "create" ? "Publish Product" : "Save Changes"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (Primary Content) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section: General Details */}
          <div className="border border-gray-200 bg-white p-6 shadow-2xs">
            <h2 className="mb-4 text-sm font-bold tracking-wider text-gray-900 uppercase">
              General Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  onBlur={onNameBlur}
                  placeholder="e.g. Silk Luxe Plunge Bralette"
                  className={inputCls}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  Handle / URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 border border-r-0 border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    /p/
                  </span>
                  <input
                    type="text"
                    {...register("slug")}
                    placeholder="silk-luxe-plunge-bralette"
                    className={`${inputCls} font-mono text-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (watchName) {
                        setValue("slug", slugify(watchName), {
                          shouldValidate: true,
                        });
                        toast.success("Slug generated from title");
                      }
                    }}
                    className="shrink-0 border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    title="Generate from name"
                  >
                    Auto
                  </button>
                </div>
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  {...register("description")}
                  rows={5}
                  placeholder="Describe material composition, lace details, wire type, clasp closures, and care instructions..."
                  className={inputCls}
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Comprehensive descriptions help customers choose the right fit
                  and improve SEO rankings.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Media Gallery */}
          <div className="border border-gray-200 bg-white p-6 shadow-2xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                  Media & Product Images
                </h2>
                <p className="text-xs text-gray-500">
                  Upload high-res images to your Supabase Storage bucket
                  (`surekh-assets`).
                </p>
              </div>

              <label
                htmlFor="image-upload"
                className={`inline-flex cursor-pointer items-center gap-2 border border-[#3d0a20] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3d0a20] transition-colors hover:bg-gray-50 ${
                  uploadingImages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Add Images</span>
                  </>
                )}
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                id="image-upload"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImages}
              />
            </div>

            {imageFields.length === 0 ? (
              <label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center transition-colors hover:border-[#3d0a20] hover:bg-gray-50"
              >
                <ImageIcon className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  Click to browse or drop images here
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Supports JPEG, PNG, WebP, AVIF up to 10MB each
                </p>
              </label>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {imageFields.map((field, index) => {
                  const isPrimary = watch(`images.${index}.isPrimary`);
                  const imageUrl = watch(`images.${index}.url`);

                  return (
                    <div
                      key={field.id}
                      className={`relative flex flex-col border p-2 transition-all ${
                        isPrimary
                          ? "border-[#3d0a20] bg-gray-50/60 ring-1 ring-[#3d0a20]"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="relative mb-2 aspect-square w-full overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                        {isPrimary && (
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#3d0a20] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                            <Star className="h-3 w-3 fill-white" />
                            Cover
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          {...register(`images.${index}.altText`)}
                          placeholder="Alt tag / description"
                          className={`${inputCls} py-1 text-xs`}
                        />

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className={`text-xs font-semibold ${
                              isPrimary
                                ? "text-[#3d0a20]"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            {isPrimary ? "★ Primary Cover" : "Set as Cover"}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-xs font-semibold text-red-600 transition-colors hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Variants & Pricing */}
          <div className="border border-gray-200 bg-white p-6 shadow-2xs">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                  Variants & Inventory
                </h2>
                <p className="text-xs text-gray-500">
                  Configure sizes, colors, SKUs, pricing, and stock levels.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoGenerateSkus}
                  className="inline-flex items-center gap-1.5 border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  title="Auto-fill missing SKUs based on slug, color, and size"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Auto SKUs</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    appendVariant({
                      sku: "",
                      size: "M",
                      colorName: "Black",
                      colorHex: "#000000",
                      price: watchVariants?.[0]?.price || 0,
                      mrp: watchVariants?.[0]?.mrp || 0,
                      weightInGrams: 100,
                      stockQuantity: 10,
                      lowStockAlert: 5,
                      isActive: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 border border-[#3d0a20] bg-[#3d0a20] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#5c1130]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Variant</span>
                </button>
              </div>
            </div>

            {errors.variants?.message && (
              <div className="mb-4 flex items-center gap-2 border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errors.variants.message}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase">
                      SKU
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase">
                      Size
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase">
                      Color Swatch
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase">
                      Price (₹)
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase">
                      MRP (₹)
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase">
                      Stock
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase">
                      Low Alert ≤
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600 uppercase">
                      Active
                    </th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {variantFields.map((field, index) => {
                    const price = Number(watchVariants?.[index]?.price || 0);
                    const mrp = Number(watchVariants?.[index]?.mrp || 0);
                    const hasPriceError = price > mrp && mrp > 0;
                    const discount = calcDiscount(price, mrp);

                    return (
                      <tr
                        key={field.id}
                        className="align-top hover:bg-gray-50/50"
                      >
                        {/* SKU */}
                        <td className="p-2">
                          <input
                            type="text"
                            {...register(`variants.${index}.sku`)}
                            placeholder="SKU-001"
                            className={`${inputCls} font-mono text-xs`}
                          />
                          {errors.variants?.[index]?.sku && (
                            <p className="mt-1 text-[10px] text-red-500">
                              {errors.variants[index]?.sku?.message}
                            </p>
                          )}
                        </td>

                        {/* Size */}
                        <td className="p-2">
                          <input
                            type="text"
                            {...register(`variants.${index}.size`)}
                            placeholder="34B / S"
                            className={`${inputCls} w-20 text-center text-xs font-semibold`}
                          />
                          {errors.variants?.[index]?.size && (
                            <p className="mt-1 text-[10px] text-red-500">
                              {errors.variants[index]?.size?.message}
                            </p>
                          )}
                        </td>

                        {/* Color */}
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              {...register(`variants.${index}.colorHex`)}
                              className="h-8 w-8 cursor-pointer rounded-none border border-gray-200 p-0.5"
                            />
                            <input
                              type="text"
                              {...register(`variants.${index}.colorName`)}
                              placeholder="Ruby"
                              className={`${inputCls} w-24 text-xs`}
                            />
                          </div>
                          {errors.variants?.[index]?.colorName && (
                            <p className="mt-1 text-[10px] text-red-500">
                              {errors.variants[index]?.colorName?.message}
                            </p>
                          )}
                        </td>

                        {/* Price */}
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`variants.${index}.price`)}
                            className={`${inputCls} w-24 text-xs font-medium`}
                          />
                          {hasPriceError ? (
                            <p className="mt-1 text-[10px] font-bold text-red-500">
                              Price &gt; MRP
                            </p>
                          ) : discount > 0 ? (
                            <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                              {discount}% OFF
                            </p>
                          ) : null}
                        </td>

                        {/* MRP */}
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            {...register(`variants.${index}.mrp`)}
                            className={`${inputCls} w-24 text-xs`}
                          />
                        </td>

                        {/* Stock */}
                        <td className="p-2">
                          <input
                            type="number"
                            {...register(`variants.${index}.stockQuantity`)}
                            className={`${inputCls} w-20 text-center text-xs font-bold`}
                          />
                        </td>

                        {/* Low stock alert */}
                        <td className="p-2">
                          <input
                            type="number"
                            {...register(`variants.${index}.lowStockAlert`)}
                            className={`${inputCls} w-20 text-center text-xs`}
                          />
                        </td>

                        {/* Active toggle */}
                        <td className="p-2 pt-4 text-center">
                          <input
                            type="checkbox"
                            {...register(`variants.${index}.isActive`)}
                            className="h-4 w-4 cursor-pointer accent-[#3d0a20]"
                          />
                        </td>

                        {/* Delete */}
                        <td className="p-2 pt-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            disabled={variantFields.length === 1}
                            className="text-gray-400 transition-colors hover:text-red-600 disabled:opacity-30"
                            title={
                              variantFields.length === 1
                                ? "Product must have at least one variant"
                                : "Remove variant"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Search Engine Optimization (SEO) */}
          <div className="border border-gray-200 bg-white p-6 shadow-2xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                  Search Engine Optimization (SEO)
                </h2>
                <p className="text-xs text-gray-500">
                  Preview and optimize how this product snippet looks on Google.
                </p>
              </div>
              <Globe className="h-4 w-4 text-gray-400" />
            </div>

            {/* Google Live SERP Preview Box */}
            <div className="mb-6 rounded-none border border-gray-200 bg-gray-50/60 p-4">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Google Search Result Preview
              </span>
              <div className="mt-2 space-y-1">
                <div className="text-xs text-gray-600">
                  surekh.com &rsaquo; p &rsaquo;{" "}
                  <span className="font-mono text-gray-800">
                    {watchSlug || "product-slug"}
                  </span>
                </div>
                <div className="text-base font-medium text-blue-800 hover:underline">
                  {watchMetaTitle || watchName || "Product Name | Surekh"}
                </div>
                <div className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                  {watchMetaDesc ||
                    "Explore premium, breathable lingerie designed with artisanal finesse and ultra-soft fabrics at Surekh."}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Page Meta Title</label>
                  <span className="text-[10px] text-gray-400">
                    {(watchMetaTitle || "").length} / 60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  {...register("metaTitle")}
                  maxLength={255}
                  placeholder={
                    watchName ? `${watchName} | Surekh` : "Page Title"
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Page Meta Description</label>
                  <span className="text-[10px] text-gray-400">
                    {(watchMetaDesc || "").length} / 160 recommended
                  </span>
                </div>
                <textarea
                  {...register("metaDescription")}
                  rows={3}
                  placeholder="Summarize the product for search engine snippets..."
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card: Status & Visibility */}
          <div className="border border-gray-200 bg-white p-5 shadow-2xs">
            <h2 className="mb-3 text-xs font-bold tracking-wider text-gray-900 uppercase">
              Visibility & Publishing
            </h2>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-none border border-gray-100 p-2.5 transition-colors hover:bg-gray-50">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[#3d0a20]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900">
                    Active on Storefront
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Product will be discoverable and purchasable by customers.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Card: Organization */}
          <div className="border border-gray-200 bg-white p-5 shadow-2xs">
            <h2 className="mb-3 text-xs font-bold tracking-wider text-gray-900 uppercase">
              Organization
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Category <span className="text-red-500">*</span>
                </label>
                <select {...register("categoryId")} className={inputCls}>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.path ? `(${c.path})` : ""}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Brand (Optional)</label>
                <select {...register("brandId")} className={inputCls}>
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag &amp; press Enter"
                  className={inputCls}
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Press Enter or comma to add tag
                </p>

                {tagList.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {tagList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-400 hover:text-gray-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card: Logistics & Taxes */}
          <div className="border border-gray-200 bg-white p-5 shadow-2xs">
            <h2 className="mb-3 text-xs font-bold tracking-wider text-gray-900 uppercase">
              Tax &amp; Logistics
            </h2>

            <div>
              <label className={labelCls}>HSN Code</label>
              <input
                type="text"
                {...register("hsnCode")}
                placeholder="e.g. 6212"
                maxLength={10}
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-gray-400">
                HSN code for GST invoice generation (e.g. 6212 for bras &amp;
                corsets).
              </p>
            </div>
          </div>

          {/* Card: Metadata & Information (when in Edit mode) */}
          {mode === "edit" && initialData?.id && (
            <div className="border border-gray-200 bg-gray-50 p-5 text-xs">
              <h2 className="mb-2 font-bold tracking-wider text-gray-700 uppercase">
                Record Metadata
              </h2>
              <div className="space-y-1.5 text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Product ID:</span>
                  <div className="flex items-center gap-1 font-mono text-gray-900">
                    <span>{String(initialData.id).slice(0, 10)}...</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(String(initialData.id));
                        toast.success("Product ID copied");
                      }}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {initialData.createdAt && (
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(
                        String(initialData.createdAt)
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {initialData.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(
                        String(initialData.updatedAt)
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
