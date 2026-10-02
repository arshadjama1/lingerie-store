"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { slugify } from "@/lib/utils";

const variantSchema = z
  .object({
    id: z.string().optional(),
    sku: z.string().min(1, "SKU is required"),
    size: z.string().min(1, "Size is required"),
    colorName: z.string().min(1, "Color Name is required"),
    colorHex: z.string().min(1, "Color Hex is required"),
    price: z.coerce.number().min(0, "Price must be >= 0"),
    mrp: z.coerce.number().min(0, "MRP must be >= 0"),
    weightInGrams: z.coerce.number().min(0, "Weight must be >= 0").optional(),
    stockQuantity: z.coerce.number().int().min(0, "Stock must be >= 0"),
    lowStockAlert: z.coerce
      .number()
      .int()
      .min(0, "Alert must be >= 0")
      .optional(),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.price <= data.mrp, {
    message: "Price cannot be greater than MRP",
    path: ["price"],
  });

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  storagePath: z.string(),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  hsnCode: z.string().optional(),
  tags: z.string().optional(), // Will handle string[] conversion manually if needed or split by comma
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
}

interface BrandOption {
  id: string;
  name: string;
}

interface AdminProductFormProps {
  mode: "create" | "edit";
  initialData?: Record<string, unknown> & { id?: string };
  categories: CategoryOption[];
  brands: BrandOption[];
}

const inputCls =
  "w-full border border-gray-200 px-3 py-2 text-sm focus:border-[#3d0a20] focus:ring-1 focus:ring-[#3d0a20] focus:outline-none";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1";

export function AdminProductForm({
  mode,
  initialData,
  categories,
  brands,
}: AdminProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
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
          colorName: "",
          colorHex: "#000000",
          price: 0,
          mrp: 0,
          stockQuantity: 0,
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

  const onNameBlur = () => {
    if (watchName && !watchSlug) {
      setValue("slug", slugify(watchName), { shouldValidate: true });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    setUploadingImages(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "productId",
          mode === "create" ? "temp" : initialData?.id
        );
        formData.append("variantId", "");

        const res = await fetch("/api/admin/products/images/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload image");

        const data = await res.json();

        appendImage({
          url: data.url,
          storagePath: data.storagePath,
          altText: "",
          isPrimary: imageFields.length === 0, // First image is primary by default
          sortOrder: imageFields.length,
        });
      }
      toast.success("Images uploaded successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to upload images";
      toast.error(message);
    } finally {
      setUploadingImages(false);
      if (e.target) e.target.value = ""; // Reset input
    }
  };

  const setPrimaryImage = (index: number) => {
    const images = watch("images");
    images.forEach((img, i) => {
      setValue(`images.${i}.isPrimary`, i === index);
    });
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],
        metaDesc: data.metaDescription,
        variants: data.variants.map((v) => ({
          ...v,
          color: v.colorName,
          weightGrams: v.weightInGrams,
          stock: v.stockQuantity,
        })),
        images: data.images.map((img) => ({
          ...img,
          alt: img.altText,
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
        const err = await res.json();
        throw new Error(err.error || "Failed to save product");
      }

      toast.success(
        mode === "create" ? "Product created!" : "Product updated!"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input
              type="text"
              {...register("name")}
              onBlur={onNameBlur}
              className={inputCls}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input
              type="text"
              {...register("slug")}
              className={`${inputCls} font-mono`}
            />
            <p className="mt-1 text-xs text-gray-500">Unique URL identifier</p>
            {errors.slug && (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select {...register("categoryId")} className={inputCls}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
            <label className={labelCls}>Brand</label>
            <select {...register("brandId")} className={inputCls}>
              <option value="">Select Brand (Optional)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>HSN Code</label>
            <input type="text" {...register("hsnCode")} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Tags</label>
            <input
              type="text"
              {...register("tags")}
              placeholder="comma, separated, tags"
              className={inputCls}
            />
          </div>

          <div className="flex gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                {...register("isActive")}
                className="rounded text-[#3d0a20] focus:ring-[#3d0a20]"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="rounded text-[#3d0a20] focus:ring-[#3d0a20]"
              />
              Featured
            </label>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Meta Title</label>
            <input
              type="text"
              {...register("metaTitle")}
              maxLength={255}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <textarea
              {...register("metaDescription")}
              rows={2}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Variants</h2>
          <button
            type="button"
            onClick={() =>
              appendVariant({
                sku: "",
                size: "",
                colorName: "",
                colorHex: "#000000",
                price: 0,
                mrp: 0,
                stockQuantity: 0,
                isActive: true,
              })
            }
            className="text-sm font-semibold text-[#3d0a20] hover:underline"
          >
            + Add Variant
          </button>
        </div>

        {errors.variants?.message && (
          <p className="mb-2 text-xs text-red-500">{errors.variants.message}</p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  SKU
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  Size
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  Color
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  Price
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  MRP
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  Stock
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  Weight(g)
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600">
                  Active
                </th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variantFields.map((field, index) => {
                const price = watchVariants?.[index]?.price || 0;
                const mrp = watchVariants?.[index]?.mrp || 0;
                const hasPriceError = price > mrp;

                return (
                  <tr key={field.id} className="align-top">
                    <td className="p-2">
                      <input
                        type="text"
                        {...register(`variants.${index}.sku`)}
                        className={inputCls}
                        placeholder="SKU"
                      />
                      {errors.variants?.[index]?.sku && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {errors.variants[index]?.sku?.message}
                        </p>
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        {...register(`variants.${index}.size`)}
                        className={inputCls}
                        placeholder="Size"
                      />
                      {errors.variants?.[index]?.size && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {errors.variants[index]?.size?.message}
                        </p>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          {...register(`variants.${index}.colorName`)}
                          className={`${inputCls} w-20`}
                          placeholder="Name"
                        />
                        <input
                          type="color"
                          {...register(`variants.${index}.colorHex`)}
                          className="h-9 w-9 border-0 p-0"
                        />
                      </div>
                      {errors.variants?.[index]?.colorName && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {errors.variants[index]?.colorName?.message}
                        </p>
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`variants.${index}.price`)}
                        className={`${inputCls} w-20`}
                      />
                      {hasPriceError && (
                        <p className="mt-1 text-[10px] text-red-500">
                          Price &gt; MRP
                        </p>
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`variants.${index}.mrp`)}
                        className={`${inputCls} w-20`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`variants.${index}.stockQuantity`)}
                        className={`${inputCls} w-20`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`variants.${index}.weightInGrams`)}
                        className={`${inputCls} w-20`}
                      />
                    </td>
                    <td className="p-2 pt-4 text-center">
                      <input
                        type="checkbox"
                        {...register(`variants.${index}.isActive`)}
                        className="rounded text-[#3d0a20]"
                      />
                    </td>
                    <td className="p-2 pt-3">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={variantFields.length === 1}
                        className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Images */}
      <div className="border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Images</h2>
          <div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              id="image-upload"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImages}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer rounded-none border border-[#3d0a20] bg-white px-4 py-2 text-sm font-semibold text-[#3d0a20] transition-colors hover:bg-gray-50 ${uploadingImages ? "opacity-50" : ""}`}
            >
              {uploadingImages ? "Uploading..." : "Upload Images"}
            </label>
          </div>
        </div>

        {imageFields.length === 0 ? (
          <p className="border border-dashed border-gray-300 py-4 text-center text-sm text-gray-500">
            No images uploaded.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {imageFields.map((field, index) => {
              const isPrimary = watch(`images.${index}.isPrimary`);

              return (
                <div
                  key={field.id}
                  className="relative flex gap-3 border border-gray-200 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={watch(`images.${index}.url`)}
                    alt="Preview"
                    className="h-20 w-20 border border-gray-200 object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      {...register(`images.${index}.altText`)}
                      placeholder="Alt Text"
                      className={`${inputCls} py-1`}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="primaryImage"
                          checked={isPrimary}
                          onChange={() => setPrimaryImage(index)}
                          className="text-[#3d0a20]"
                        />
                        Primary
                      </label>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-xs font-semibold text-red-600 hover:underline"
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-none border border-[#3d0a20] bg-[#3d0a20] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5c1130] disabled:opacity-70"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
